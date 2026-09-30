"""
Demonstration script executing Layer 4 Part A (Evidence Completion)
and Part B (Readiness Scoring) against 3 sample Layer 3 evaluation cases.
"""

import json
import sys
from pathlib import Path

# Ensure UTF-8 output on all operating systems and terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Add layer4-service root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.evidence_engine import analyze_evidence_completion
from app.readiness_scorer import calculate_readiness
from tests.sample_data import (
    CASE_1_HIGH_CONFIDENCE_ELIGIBLE,
    CASE_2_LOW_CONFIDENCE_MISSING_FACTS,
    CASE_3_INELIGIBLE_BUT_CLOSE,
)


def run_demonstration():
    cases = [
        ("Case 1: High-Confidence Eligible", CASE_1_HIGH_CONFIDENCE_ELIGIBLE),
        ("Case 2: Low-Confidence with Missing Facts (Needs More Info)", CASE_2_LOW_CONFIDENCE_MISSING_FACTS),
        ("Case 3: Ineligible-But-Close (Actionable / Flippable)", CASE_3_INELIGIBLE_BUT_CLOSE),
    ]

    print("=" * 80)
    print("LAYER 4: EVIDENCE COMPLETION & ELIGIBILITY READINESS ENGINE")
    print("Course Project: VIT Cloud Computing (BITE412L)")
    print("=" * 80)

    for idx, (title, case) in enumerate(cases, 1):
        print(f"\n{'#' * 80}")
        print(f"[{idx}/3] {title}")
        print(f"Citizen ID:  {case.citizen_id}")
        print(f"Scheme ID:   {case.scheme_id}")
        print(f"Scheme Name: {case.scheme_name}")
        print(f"L3 Verdict:  {case.verdict.value.upper()}")
        print(f"{'#' * 80}\n")

        # ----------------------------------------------------
        # Part A: Evidence Completion Engine
        # ----------------------------------------------------
        evidence = analyze_evidence_completion(case)
        print("--- PART A: EVIDENCE COMPLETION ENGINE ---")
        print(f"Confidence Score:       {evidence.confidence_score:.2f} ({int(evidence.confidence_score * 100)}%)")
        print(f"Total Scheme Criteria:  {evidence.total_clauses}")
        print(f"Resolved Criteria:      {evidence.resolved_clauses}")
        print(f"Unknown Criteria Count: {evidence.unknown_clauses_count}")
        print(f"Engine Explanation:     {evidence.explanation}")

        if evidence.missing_evidence:
            print("\n  Missing Evidence Diagnosed:")
            for m_idx, m in enumerate(evidence.missing_evidence, 1):
                print(f"  [{m_idx}] Missing Fact:    {m.field_label} (`{m.field}`)")
                print(f"      Required Proof:  {m.recommended_document}")
                print(f"      Governing Clause: \"{m.raw_text}\"")
                print(f"      Citizen Action:  {m.action_prompt}")
        else:
            print("  Missing Evidence: None (All facts provided and verified)")

        # ----------------------------------------------------
        # Part B: Eligibility Readiness Scorer
        # ----------------------------------------------------
        readiness = calculate_readiness(case)
        print("\n--- PART B: ELIGIBILITY READINESS SCORER ---")
        print(f"Readiness Score:        {readiness.readiness_score:.1f} / 100")
        print(f"Blocked by Immutable:   {readiness.is_blocked_by_immutable}")

        print("\n  Clause-by-Clause Proximity & Mutability Breakdown:")
        for c in readiness.clause_breakdown:
            mut_tag = "MUTABLE (Can change)" if c.is_mutable else "IMMUTABLE (Fixed)"
            print(f"  • Clause [{c.field}] ({c.status.value.upper()} | Proximity: {c.proximity_score:.2f}) -> {mut_tag}")
            print(f"    Expected: {c.operator} {c.expected_value} | Citizen Value: {c.citizen_value}")
            if c.actionable_message:
                print(f"    Actionable Note: {c.actionable_message}")

        if readiness.immutable_roadblocks:
            print("\n  Permanent Roadblocks (Unchangeable):")
            for r in readiness.immutable_roadblocks:
                print(f"  ⛔ {r}")

        if readiness.actionable_recommendations:
            print("\n  Actionable Recommendations to Flip Verdict:")
            for a in readiness.actionable_recommendations:
                print(f"  💡 {a}")

        print("\n  Citizen Summary:")
        print(f"  \"{readiness.citizen_summary}\"")
        print("-" * 80)

    # Automated assertions for validation
    ev1 = analyze_evidence_completion(CASE_1_HIGH_CONFIDENCE_ELIGIBLE)
    rd1 = calculate_readiness(CASE_1_HIGH_CONFIDENCE_ELIGIBLE)
    assert ev1.confidence_score == 1.0, f"Expected 1.0, got {ev1.confidence_score}"
    assert rd1.readiness_score == 100.0, f"Expected 100.0, got {rd1.readiness_score}"
    assert len(ev1.missing_evidence) == 0

    ev2 = analyze_evidence_completion(CASE_2_LOW_CONFIDENCE_MISSING_FACTS)
    rd2 = calculate_readiness(CASE_2_LOW_CONFIDENCE_MISSING_FACTS)
    assert ev2.confidence_score == 0.67, f"Expected 0.67, got {ev2.confidence_score}"
    assert ev2.unknown_clauses_count == 1
    assert ev2.missing_evidence[0].field == "income_threshold"
    assert "Rs. 2,50,000" in ev2.missing_evidence[0].raw_text

    ev3 = analyze_evidence_completion(CASE_3_INELIGIBLE_BUT_CLOSE)
    rd3 = calculate_readiness(CASE_3_INELIGIBLE_BUT_CLOSE)
    assert ev3.confidence_score == 1.0, f"Expected 1.0, got {ev3.confidence_score}"
    assert rd3.readiness_score > 80.0, f"Expected > 80.0, got {rd3.readiness_score}"
    assert len(rd3.actionable_recommendations) == 1
    assert "Rs. 70,000" in rd3.actionable_recommendations[0]
    assert "Rs. 250,000" in rd3.actionable_recommendations[0]

    print("\nALL AUTOMATED ASSERTIONS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_demonstration()
