"""
Part B — Eligibility Readiness Scorer.

Computes a transparent, explainable Readiness Score (0-100) for citizens whose
determination is ineligible or needs_more_info. Evaluates proximity to qualifying,
distinguishes mutable vs immutable criteria, and provides citizen-facing actionable
guidance with exact values and operators.
"""

from typing import Any, Dict, List, Set, Tuple
from app.schema import (
    ClauseEvaluation,
    ClauseReadinessDetail,
    ClauseType,
    EligibilityResult,
    EligibilityVerdict,
    EvaluationStatus,
    ReadinessAssessment,
)
from app.evidence_engine import FIELD_LABELS

# Categorization of attributes: Mutable (can be altered/rectified) vs Immutable (permanently fixed)
IMMUTABLE_FIELDS: Set[str] = {
    "caste_category",
    "gender",
    "date_of_birth",
    "social_group",
    "religion",
    "parent_deceased",
    "disability_type",
}

MUTABLE_FIELDS: Set[str] = {
    "income_threshold",
    "occupation",
    "existing_scheme_beneficiary",
    "residence_state",
    "residence_type",
    "bank_account_seeded",
    "enrollment_status",
    "attendance_percentage",
}


def is_field_mutable(field: str) -> bool:
    """Determine if a criterion can realistically change for a citizen."""
    if field in IMMUTABLE_FIELDS:
        return False
    if field in MUTABLE_FIELDS:
        return True
    # Default heuristic: if not explicitly immutable, consider mutable/actionable
    return True


def _calculate_clause_proximity(clause: ClauseEvaluation) -> Tuple[float, Optional[str]]:
    """
    Calculate 0.0 to 1.0 closeness for a single clause, plus an actionable message.
    """
    field = clause.field
    field_label = FIELD_LABELS.get(field, field.replace("_", " ").title())
    op = clause.operator.lower()
    expected = clause.expected_value
    actual = clause.citizen_value

    if clause.status == EvaluationStatus.PASSED:
        return 1.0, None

    if clause.status == EvaluationStatus.UNKNOWN:
        return (
            0.5,
            f"Verification pending for {field_label}. Providing supporting proof may satisfy this requirement.",
        )

    # Failed condition or triggered exclusion
    # Try numeric proximity calculation if values can be parsed as float
    try:
        if actual is not None and expected is not None:
            num_actual = float(actual)
            num_expected = float(expected)

            if op in ("lte", "lt"):
                if num_actual <= num_expected:
                    return 1.0, None
                gap = num_actual - num_expected
                # Proportional proximity: falls to 0 if actual >= 2 * expected
                proximity = max(0.0, min(1.0, 1.0 - (gap / num_expected)))
                
                # Format currency or integer nicely if large
                act_str = f"Rs. {num_actual:,.0f}" if num_actual > 1000 else f"{num_actual}"
                exp_str = f"Rs. {num_expected:,.0f}" if num_expected > 1000 else f"{num_expected}"
                gap_str = f"Rs. {gap:,.0f}" if gap > 1000 else f"{gap}"

                msg = (
                    f"Your current {field_label.lower()} is {act_str}, exceeding the scheme threshold of "
                    f"{exp_str} by {gap_str}. If your {field_label.lower()} changes to {exp_str} or below, "
                    f"you would satisfy this requirement."
                )
                return round(proximity, 3), msg

            elif op in ("gte", "gt"):
                if num_actual >= num_expected:
                    return 1.0, None
                gap = num_expected - num_actual
                proximity = max(0.0, min(1.0, 1.0 - (gap / num_expected)))
                msg = (
                    f"Your current {field_label.lower()} is {num_actual}, below the required minimum "
                    f"of {num_expected} (gap of {gap}). Reaching at least {num_expected} is required."
                )
                return round(proximity, 3), msg

            elif op in ("eq", "=="):
                if num_actual == num_expected:
                    return 1.0, None
                msg = f"Requires {field_label.lower()} to be '{expected}', but current value is '{actual}'."
                return 0.0, msg
    except (ValueError, TypeError):
        pass

    # Categorical or exclusion failure
    if clause.clause_type == ClauseType.EXCLUSION:
        msg = (
            f"Disqualifying exclusion triggered: your {field_label.lower()} is '{actual}', "
            f"which violates: \"{clause.raw_text}\". You must not belong to this category to qualify."
        )
        return 0.0, msg

    # Categorical condition failure
    msg = (
        f"Your {field_label.lower()} is recorded as '{actual}', but the scheme requires "
        f"'{expected}'. Clause text: \"{clause.raw_text}\"."
    )
    return 0.0, msg


def calculate_readiness(result: EligibilityResult) -> ReadinessAssessment:
    """
    Part B pure function:
    Calculates 0-100 Readiness Score, classifies mutable vs immutable criteria,
    and produces targeted citizen-facing recommendations.
    """
    all_clauses: List[Tuple[ClauseEvaluation, ClauseType]] = []

    for c in result.passed_conditions:
        all_clauses.append((c, ClauseType.CONDITION))
    for c in result.failed_conditions:
        all_clauses.append((c, ClauseType.CONDITION))
    for c in result.unknown_conditions:
        all_clauses.append((c, ClauseType.CONDITION))
    for c in result.matched_exclusions:
        all_clauses.append((c, ClauseType.EXCLUSION))

    clause_breakdown: List[ClauseReadinessDetail] = []
    actionable_recs: List[str] = []
    immutable_blocks: List[str] = []
    total_proximity = 0.0

    for clause, c_type in all_clauses:
        field = clause.field
        field_label = FIELD_LABELS.get(field, field.replace("_", " ").title())
        mutable = is_field_mutable(field)
        proximity, msg = _calculate_clause_proximity(clause)
        total_proximity += proximity

        if clause.status == EvaluationStatus.FAILED or c_type == ClauseType.EXCLUSION:
            if not mutable:
                immutable_blocks.append(
                    f"Fixed criterion '{field_label}' requirement not met: "
                    f"profile indicates '{clause.citizen_value}', scheme requires '{clause.expected_value}'. "
                    f"Clause wording: \"{clause.raw_text}\""
                )
            else:
                if msg:
                    actionable_recs.append(msg)

        clause_breakdown.append(
            ClauseReadinessDetail(
                clause_id=clause.clause_id,
                clause_type=c_type,
                field=field,
                field_label=field_label,
                status=clause.status,
                is_mutable=mutable,
                citizen_value=clause.citizen_value,
                expected_value=clause.expected_value,
                operator=clause.operator,
                raw_text=clause.raw_text,
                proximity_score=proximity,
                actionable_message=msg,
            )
        )

    # Compute overall 0-100 score
    if result.verdict == EligibilityVerdict.ELIGIBLE:
        readiness_score = 100.0
    elif not all_clauses:
        readiness_score = 0.0
    else:
        readiness_score = round((total_proximity / len(all_clauses)) * 100.0, 1)

    is_blocked_by_immutable = len(immutable_blocks) > 0

    # Formulate citizen-facing summary narrative
    if result.verdict == EligibilityVerdict.ELIGIBLE:
        citizen_summary = (
            "Congratulations! You meet all verified scheme criteria (Readiness Score: 100/100). "
            "You are eligible to receive the entitled scheme benefits."
        )
    elif is_blocked_by_immutable:
        blocks_text = "; ".join(immutable_blocks)
        citizen_summary = (
            f"You are currently ineligible (Readiness Score: {readiness_score}/100). "
            f"This scheme has a non-changeable qualification roadblock: {blocks_text}. "
            "Because this criterion is fixed, adjusting other factors will not result in eligibility."
        )
    elif result.verdict == EligibilityVerdict.NEEDS_MORE_INFO and not result.failed_conditions:
        citizen_summary = (
            f"Your eligibility determination is in progress (Readiness Score: {readiness_score}/100). "
            "No criteria have failed, but missing information needs to be provided. "
            "Once you submit the required evidence, your application can be verified."
        )
    else:
        # Ineligible but close / mutable
        recs_text = " ".join(actionable_recs)
        citizen_summary = (
            f"You are not currently eligible (Readiness Score: {readiness_score}/100). "
            f"However, you may qualify if the following condition(s) change: {recs_text}"
        )

    return ReadinessAssessment(
        readiness_score=readiness_score,
        verdict=result.verdict,
        is_blocked_by_immutable=is_blocked_by_immutable,
        immutable_roadblocks=immutable_blocks,
        actionable_recommendations=actionable_recs,
        clause_breakdown=clause_breakdown,
        citizen_summary=citizen_summary,
    )
