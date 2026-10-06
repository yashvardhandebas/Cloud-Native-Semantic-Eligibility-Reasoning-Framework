import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.evaluation_engine import evaluate_citizen
from app.graph_builder import GraphBuilder
from app.graph_client import MockGraphClient


@pytest.fixture
def post_matric_graph():
    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    ruleset = Path(__file__).parent / "sample_data" / "sample_ruleset.json"
    builder.ingest_ruleset(ruleset)
    with open(Path(__file__).parent / "sample_data" / "sample_citizen_facts.json", encoding="utf-8") as f:
        citizens = json.load(f)
    return client, citizens


def test_eligible_citizen(post_matric_graph):
    client, citizens = post_matric_graph
    profile = citizens["citizen_01_eligible"]
    result = evaluate_citizen(
        client,
        "post_matric_sc_scholarship_demo",
        profile["facts"],
        citizen_id=profile["citizen_id"],
    )
    assert result.verdict.value == "eligible"
    assert len(result.failed_conditions) == 0
    assert len(result.unknown_conditions) == 0
    assert len(result.matched_exclusions) == 0
    assert len(result.passed_conditions) == 3


def test_needs_more_info_missing_income(post_matric_graph):
    client, citizens = post_matric_graph
    profile = citizens["citizen_04_needs_more_info"]
    result = evaluate_citizen(
        client,
        "post_matric_sc_scholarship_demo",
        profile["facts"],
        citizen_id=profile["citizen_id"],
    )
    assert result.verdict.value == "needs_more_info"
    assert len(result.unknown_conditions) == 1
    assert result.unknown_conditions[0].field == "income_threshold"


def test_ineligible_high_income(post_matric_graph):
    client, citizens = post_matric_graph
    profile = citizens["citizen_02_ineligible_income"]
    result = evaluate_citizen(
        client,
        "post_matric_sc_scholarship_demo",
        profile["facts"],
        citizen_id=profile["citizen_id"],
    )
    assert result.verdict.value == "ineligible"
    assert len(result.failed_conditions) == 1
    assert result.failed_conditions[0].field == "income_threshold"
    assert result.failed_conditions[0].citizen_value == 320000


def test_ineligible_exclusion_employed(post_matric_graph):
    client, citizens = post_matric_graph
    profile = citizens["citizen_03_ineligible_exclusion"]
    result = evaluate_citizen(
        client,
        "post_matric_sc_scholarship_demo",
        profile["facts"],
        citizen_id=profile["citizen_id"],
    )
    assert result.verdict.value == "ineligible"
    assert len(result.matched_exclusions) >= 1
