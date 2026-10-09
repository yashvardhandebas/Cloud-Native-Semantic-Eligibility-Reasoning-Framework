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


def test_amendment_income_ceiling_250k_to_300k():
    """
    Item 5: Test simulating an amendment (income ceiling 250000 -> 300000) asserting:
    1. Only condition:income_threshold clause changes.
    2. Old version is superseded (is_current = False, valid_to is set).
    3. Point-in-time query with as_of returns old version (250000), without as_of returns new version (300000).
    """
    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    base = Path(__file__).parent / "sample_data" / "sample_ruleset.json"
    amended = Path(__file__).parent / "sample_data" / "sample_ruleset_v2.json"

    builder.ingest_ruleset(base)
    old_node = next(
        n for n in client.nodes.values()
        if n.get("_label") == "Condition" and n.get("field") == "income_threshold"
    )
    old_timestamp = old_node["valid_from"]

    engine = RuleEvolutionEngine(client)
    diff = engine.evolve_ruleset(amended)

    # 1. Assert condition:income_threshold clause changed
    assert "condition:income_threshold" in diff["changed_clauses"]
    assert "condition:caste_category" in diff["unchanged_clauses"]

    # 2. Assert old version is superseded
    updated_old_node = client.nodes[old_node["id"]]
    assert updated_old_node["is_current"] is False
    assert updated_old_node["valid_to"] is not None

    # 3. Assert as_of query returns correct versions
    subgraph_old = client.get_scheme_subgraph("post_matric_sc_scholarship_demo", as_of=old_timestamp)
    income_cond_old = next(c for c in subgraph_old["conditions"] if c["field"] == "income_threshold")
    assert income_cond_old["value"] == 250000

    subgraph_current = client.get_scheme_subgraph("post_matric_sc_scholarship_demo")
    income_cond_current = next(c for c in subgraph_current["conditions"] if c["field"] == "income_threshold")
    assert income_cond_current["value"] == 300000
