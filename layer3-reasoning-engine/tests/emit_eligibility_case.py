"""Emit Layer 3 EligibilityResult JSON for a named demo citizen profile (stdout)."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.evaluation_engine import evaluate_citizen
from app.graph_builder import GraphBuilder
from app.graph_client import MockGraphClient

CASE_MAP = {
    "eligible": "citizen_01_eligible",
    "needs_more_info": "citizen_04_needs_more_info",
    "ineligible_close": "citizen_02_ineligible_income",
}


def main():
    case_key = sys.argv[1]
    citizens_path = Path(__file__).parent / "sample_data" / "sample_citizen_facts.json"
    ruleset_path = Path(__file__).parent / "sample_data" / "sample_ruleset.json"
    with open(citizens_path, encoding="utf-8") as f:
        citizens = json.load(f)
    profile = citizens[CASE_MAP[case_key]]

    client = MockGraphClient()
    GraphBuilder(client=client).ingest_ruleset(ruleset_path)
    result = evaluate_citizen(
        client,
        "post_matric_sc_scholarship_demo",
        profile["facts"],
        citizen_id=profile["citizen_id"],
    )
    print(result.model_dump_json())


if __name__ == "__main__":
    main()
