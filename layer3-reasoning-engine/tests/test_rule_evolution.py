import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.evaluation_engine import evaluate_citizen
from app.graph_builder import GraphBuilder
from app.graph_client import MockGraphClient
from app.rule_evolution import RuleEvolutionEngine


@pytest.fixture
def evolved_graph():
    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    base = Path(__file__).parent / "sample_data" / "sample_ruleset.json"
    amended = Path(__file__).parent / "sample_data" / "sample_ruleset_v2.json"
    builder.ingest_ruleset(base)
    before_ids = {
        n.get("field"): n["id"]
        for n in client.nodes.values()
        if n.get("_label") == "Condition" and n.get("valid_to") in (None, "")
    }
    engine = RuleEvolutionEngine(client)
    result = engine.evolve_ruleset(amended)
    return client, result, before_ids


def test_income_amendment_only(evolved_graph):
    client, evolution, before_ids = evolved_graph
    assert "condition:income_threshold" in evolution["changed_clauses"]
    assert "condition:caste_category" in evolution["unchanged_clauses"]
    assert "condition:education_level" in evolution["unchanged_clauses"]

    income_nodes = [
        n
        for n in client.nodes.values()
        if n.get("_label") == "Condition" and n.get("field") == "income_threshold"
    ]
    assert len(income_nodes) == 2
    active_income = [n for n in income_nodes if n.get("valid_to") in (None, "")]
    assert len(active_income) == 1
    assert active_income[0]["value"] == 300000

    assert before_ids["caste_category"] == client.nodes[before_ids["caste_category"]]["id"]
    assert before_ids["education_level"] == client.nodes[before_ids["education_level"]]["id"]


def test_point_in_time_income_threshold(evolved_graph):
    client, _, _ = evolved_graph
    facts = {
        "caste_category": "SC",
        "education_level": "10th",
        "income_threshold": 280000,
        "occupation": "student",
    }
    old_node = next(
        n
        for n in client.nodes.values()
        if n.get("_label") == "Condition"
        and n.get("field") == "income_threshold"
        and n.get("value") == 250000
    )
    as_of_old = old_node["valid_from"]
    result_old = evaluate_citizen(
        client,
        "post_matric_sc_scholarship_demo",
        facts,
        as_of=as_of_old,
    )
    assert result_old.verdict.value == "ineligible"

    result_new = evaluate_citizen(
        client,
        "post_matric_sc_scholarship_demo",
        facts,
    )
    assert result_new.verdict.value == "eligible"
