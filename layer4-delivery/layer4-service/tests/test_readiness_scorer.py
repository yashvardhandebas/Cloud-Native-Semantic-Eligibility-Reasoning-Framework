"""
Unit tests for Part B — Eligibility Readiness Scorer.
"""

import pytest
from app.readiness_scorer import calculate_readiness, is_field_mutable
from tests.sample_data import (
    CASE_1_HIGH_CONFIDENCE_ELIGIBLE,
    CASE_2_LOW_CONFIDENCE_MISSING_FACTS,
    CASE_3_INELIGIBLE_BUT_CLOSE,
)
from app.schema import (
    ClauseEvaluation,
    ClauseType,
    EligibilityResult,
    EligibilityVerdict,
    EvaluationStatus,
)


def test_field_mutability_classification():
    assert not is_field_mutable("caste_category")
    assert not is_field_mutable("gender")
    assert not is_field_mutable("date_of_birth")

    assert is_field_mutable("income_threshold")
    assert is_field_mutable("occupation")
    assert is_field_mutable("existing_scheme_beneficiary")


def test_eligible_readiness_score():
    res = calculate_readiness(CASE_1_HIGH_CONFIDENCE_ELIGIBLE)
    assert res.readiness_score == 100.0
    assert not res.is_blocked_by_immutable
    assert len(res.actionable_recommendations) == 0
    assert "Congratulations" in res.citizen_summary


def test_missing_facts_readiness_score():
    res = calculate_readiness(CASE_2_LOW_CONFIDENCE_MISSING_FACTS)
    # 2 passed (1.0 each) + 1 unknown (0.5) = 2.5 / 3 = 83.3
    assert res.readiness_score == 83.3
    assert not res.is_blocked_by_immutable
    assert len(res.actionable_recommendations) == 0
    assert "in progress" in res.citizen_summary


def test_ineligible_close_proximity_and_recommendation():
    res = calculate_readiness(CASE_3_INELIGIBLE_BUT_CLOSE)
    # Income 3.2L vs limit 2.5L: proximity = 1 - (70k / 250k) = 0.72
    # Total proximity = 1.0 + 1.0 + 0.72 = 2.72 / 3 = 90.7
    assert res.readiness_score == 90.7
    assert not res.is_blocked_by_immutable
    assert len(res.actionable_recommendations) == 1
    assert "Rs. 70,000" in res.actionable_recommendations[0]
    assert "Rs. 250,000" in res.actionable_recommendations[0]
    assert "If your annual family income changes" in res.citizen_summary


def test_immutable_roadblock_detection():
    # Case with failed caste category (immutable)
    case_immutable_failed = EligibilityResult(
        scheme_id="scheme_test",
        scheme_name="SC Scheme",
        verdict=EligibilityVerdict.INELIGIBLE,
        passed_conditions=[],
        failed_conditions=[
            ClauseEvaluation(
                clause_id="caste_clause",
                clause_type=ClauseType.CONDITION,
                field="caste_category",
                operator="eq",
                expected_value="SC",
                citizen_value="General",
                status=EvaluationStatus.FAILED,
                raw_text="Candidate must belong to Scheduled Caste (SC).",
                reason="Citizen caste 'General' != 'SC'.",
            )
        ],
        unknown_conditions=[],
        matched_exclusions=[],
    )

    res = calculate_readiness(case_immutable_failed)
    assert res.readiness_score == 0.0
    assert res.is_blocked_by_immutable
    assert len(res.immutable_roadblocks) == 1
    assert "Fixed criterion" in res.immutable_roadblocks[0]
    assert "non-changeable qualification roadblock" in res.citizen_summary
