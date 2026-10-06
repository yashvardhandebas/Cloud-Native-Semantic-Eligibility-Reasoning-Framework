"""
Citizen-fact evaluation against a scheme subgraph from Layer 2 / graph ingestion.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set, Tuple

from app.graph_client import BaseGraphClient, MockGraphClient
from app.schema import (
    CitizenFactSet,
    ClauseEvaluation,
    ClauseType,
    EligibilityResult,
    EligibilityVerdict,
    EvaluationStatus,
)


def _normalize_scalar(value: Any) -> Any:
    if isinstance(value, str):
        return value.strip().lower()
    return value


def _coerce_number(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        cleaned = value.replace(",", "").replace("Rs.", "").replace("rs.", "").strip()
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None


def _evaluate_operator(
    operator: str,
    expected: Any,
    actual: Any,
) -> Optional[bool]:
    """
    Compare citizen value to clause expectation.
    Returns True if satisfied, False if not, None if cannot evaluate (unknown).
    """
    op = operator.strip().lower()

    if op == "in_list":
        if isinstance(expected, (list, tuple, set)):
            choices = {_normalize_scalar(v) for v in expected}
        elif isinstance(expected, str):
            choices = {_normalize_scalar(p.strip()) for p in expected.split(",")}
        else:
            choices = {_normalize_scalar(expected)}
        return _normalize_scalar(actual) in choices

    exp_num = _coerce_number(expected)
    act_num = _coerce_number(actual)
    if exp_num is not None and act_num is not None:
        if op in ("eq", "=="):
            return act_num == exp_num
        if op == "lt":
            return act_num < exp_num
        if op == "lte":
            return act_num <= exp_num
        if op == "gt":
            return act_num > exp_num
        if op == "gte":
            return act_num >= exp_num
        if op == "ne":
            return act_num != exp_num

    exp_norm = _normalize_scalar(expected)
    act_norm = _normalize_scalar(actual)
    if op in ("eq", "=="):
        return act_norm == exp_norm
    if op == "ne":
        return act_norm != exp_norm
    if op in ("lt", "lte", "gt", "gte"):
        return None
    return None


def _citizen_fact(facts: Dict[str, Any], field: str) -> Tuple[Optional[Any], bool]:
    if field not in facts:
        return None, False
    return facts[field], True


def _build_clause_evaluation(
    node: Dict[str, Any],
    clause_type: ClauseType,
    facts: Dict[str, Any],
    *,
    prerequisite_met: bool = True,
    as_exclusion: bool = False,
) -> ClauseEvaluation:
    clause_id = str(node.get("id", ""))
    field = str(node.get("field", ""))
    operator = str(node.get("operator", "eq"))
    expected = node.get("value")
    raw_text = str(node.get("raw_text", ""))
    citizen_value, present = _citizen_fact(facts, field)

    if not prerequisite_met:
        return ClauseEvaluation(
            clause_id=clause_id,
            clause_type=clause_type,
            field=field,
            operator=operator,
            expected_value=expected,
            citizen_value=citizen_value if present else None,
            status=EvaluationStatus.UNKNOWN,
            raw_text=raw_text,
            reason=f"Prerequisite condition for '{field}' was not satisfied; evaluation deferred.",
            prerequisite_met=False,
        )

    if not present or citizen_value is None:
        return ClauseEvaluation(
            clause_id=clause_id,
            clause_type=clause_type,
            field=field,
            operator=operator,
            expected_value=expected,
            citizen_value=None,
            status=EvaluationStatus.UNKNOWN,
            raw_text=raw_text,
            reason=f"Missing citizen fact '{field}'. Verification cannot proceed.",
            prerequisite_met=True,
        )

    outcome = _evaluate_operator(operator, expected, citizen_value)
    if outcome is None:
        return ClauseEvaluation(
            clause_id=clause_id,
            clause_type=clause_type,
            field=field,
            operator=operator,
            expected_value=expected,
            citizen_value=citizen_value,
            status=EvaluationStatus.UNKNOWN,
            raw_text=raw_text,
            reason=f"Could not compare citizen value for '{field}' using operator '{operator}'.",
            prerequisite_met=True,
        )

    if as_exclusion:
        if outcome:
            status = EvaluationStatus.FAILED
            reason = (
                f"Disqualifying exclusion matched: {field} {operator} {expected!r} "
                f"(citizen value: {citizen_value!r})."
            )
        else:
            status = EvaluationStatus.PASSED
            reason = f"Exclusion on '{field}' did not apply to this citizen profile."
    else:
        if outcome:
            status = EvaluationStatus.PASSED
            reason = f"Citizen value for '{field}' satisfies {operator} {expected!r}."
        else:
            status = EvaluationStatus.FAILED
            reason = f"Citizen value for '{field}' does not satisfy {operator} {expected!r}."

    return ClauseEvaluation(
        clause_id=clause_id,
        clause_type=clause_type,
        field=field,
        operator=operator,
        expected_value=expected,
        citizen_value=citizen_value,
        status=status,
        raw_text=raw_text,
        reason=reason,
        prerequisite_met=True,
    )


def _depends_on_map(conditions: List[Dict[str, Any]]) -> Dict[str, Optional[str]]:
    dep: Dict[str, Optional[str]] = {}
    for c in conditions:
        field = str(c.get("field", ""))
        dep[field] = c.get("depends_on_field")
    return dep


def _prerequisite_fields_met(
    field: str,
    dep_map: Dict[str, Optional[str]],
    status_by_field: Dict[str, EvaluationStatus],
) -> bool:
    prereq = dep_map.get(field)
    if not prereq:
        return True
    prereq_status = status_by_field.get(prereq)
    return prereq_status == EvaluationStatus.PASSED


class EligibilityEvaluator:
    """Evaluate citizen facts against an ingested scheme graph."""

    def __init__(self, client: BaseGraphClient):
        self.client = client

    def evaluate(
        self,
        scheme_id: str,
        facts: Dict[str, Any],
        *,
        citizen_id: Optional[str] = None,
        as_of: Optional[str] = None,
    ) -> EligibilityResult:
        if isinstance(self.client, MockGraphClient):
            subgraph = self.client.get_scheme_subgraph(scheme_id, as_of=as_of)
        else:
            subgraph = self._fetch_subgraph_neo4j(scheme_id, as_of)

        if not subgraph.get("scheme"):
            raise ValueError(f"Scheme '{scheme_id}' not found in graph.")

        scheme = subgraph["scheme"]
        conditions = subgraph.get("conditions", [])
        exclusions = subgraph.get("exclusions", [])
        documents = subgraph.get("documents", [])
        benefits = subgraph.get("benefits", [])

        dep_map = _depends_on_map(conditions)
        status_by_field: Dict[str, EvaluationStatus] = {}

        passed: List[ClauseEvaluation] = []
        failed: List[ClauseEvaluation] = []
        unknown: List[ClauseEvaluation] = []
        matched_exclusions: List[ClauseEvaluation] = []
        audit: List[str] = []

        # Pass 1: evaluate conditions without dependency gating (for prereq status map)
        preliminary: Dict[str, ClauseEvaluation] = {}
        for cond in conditions:
            ev = _build_clause_evaluation(cond, ClauseType.CONDITION, facts, prerequisite_met=True)
            preliminary[str(cond.get("field", ""))] = ev
            status_by_field[str(cond.get("field", ""))] = ev.status

        # Pass 2: re-evaluate with dependency rules
        for cond in conditions:
            field = str(cond.get("field", ""))
            prereq_ok = _prerequisite_fields_met(field, dep_map, status_by_field)
            if not prereq_ok and dep_map.get(field):
                ev = _build_clause_evaluation(
                    cond, ClauseType.CONDITION, facts, prerequisite_met=False
                )
            else:
                ev = preliminary[field]
            audit.append(
                f"Evaluated {field}: {ev.citizen_value!r} {ev.operator} {ev.expected_value!r} ({ev.status.value.upper()})"
            )
            if ev.status == EvaluationStatus.PASSED:
                passed.append(ev)
            elif ev.status == EvaluationStatus.FAILED:
                failed.append(ev)
            else:
                unknown.append(ev)

        for exc in exclusions:
            ev = _build_clause_evaluation(
                exc, ClauseType.EXCLUSION, facts, as_exclusion=True
            )
            audit.append(f"Exclusion {ev.field}: ({ev.status.value.upper()})")
            if ev.status == EvaluationStatus.FAILED:
                matched_exclusions.append(ev)

        verdict = self._overall_verdict(failed, unknown, matched_exclusions)
        summary = self._summary(scheme, verdict, failed, unknown, matched_exclusions)

        required_documents = [
            {
                "document_type": d.get("document_type"),
                "required_for": d.get("required_for"),
                "raw_text": d.get("raw_text"),
            }
            for d in documents
        ]
        entitled = (
            [
                {
                    "benefit_type": b.get("benefit_type"),
                    "amount": b.get("amount"),
                    "frequency": b.get("frequency"),
                    "raw_text": b.get("raw_text"),
                }
                for b in benefits
            ]
            if verdict == EligibilityVerdict.ELIGIBLE
            else []
        )

        return EligibilityResult(
            scheme_id=scheme_id,
            scheme_name=scheme.get("name"),
            verdict=verdict,
            citizen_id=citizen_id,
            passed_conditions=passed,
            failed_conditions=failed,
            unknown_conditions=unknown,
            matched_exclusions=matched_exclusions,
            required_documents=required_documents,
            entitled_benefits=entitled,
            summary_explanation=summary,
            audit_trail=audit,
        )

    @staticmethod
    def _overall_verdict(
        failed: List[ClauseEvaluation],
        unknown: List[ClauseEvaluation],
        matched_exclusions: List[ClauseEvaluation],
    ) -> EligibilityVerdict:
        if matched_exclusions:
            return EligibilityVerdict.INELIGIBLE
        if failed:
            return EligibilityVerdict.INELIGIBLE
        if unknown:
            return EligibilityVerdict.NEEDS_MORE_INFO
        return EligibilityVerdict.ELIGIBLE

    @staticmethod
    def _summary(
        scheme: Dict[str, Any],
        verdict: EligibilityVerdict,
        failed: List[ClauseEvaluation],
        unknown: List[ClauseEvaluation],
        matched_exclusions: List[ClauseEvaluation],
    ) -> str:
        name = scheme.get("name") or scheme.get("id", "scheme")
        if verdict == EligibilityVerdict.ELIGIBLE:
            return f"Citizen qualifies for {name}."
        if verdict == EligibilityVerdict.NEEDS_MORE_INFO:
            fields = ", ".join(u.field for u in unknown)
            return f"Citizen profile incomplete for {name}: missing or deferred facts ({fields})."
        if matched_exclusions:
            return f"Citizen is ineligible for {name} due to disqualifying exclusion(s)."
        if failed:
            return f"Citizen is ineligible for {name} due to unmet eligibility condition(s)."
        return f"Eligibility determination for {name}: {verdict.value}."

    def _fetch_subgraph_neo4j(self, scheme_id: str, as_of: Optional[str]) -> Dict[str, Any]:
        raise NotImplementedError(
            "Neo4j subgraph fetch for evaluation is not implemented; use MockGraphClient for offline tests."
        )


def evaluate_citizen(
    client: BaseGraphClient,
    scheme_id: str,
    facts: Dict[str, Any],
    *,
    citizen_id: Optional[str] = None,
    as_of: Optional[str] = None,
) -> EligibilityResult:
    return EligibilityEvaluator(client).evaluate(
        scheme_id, facts, citizen_id=citizen_id, as_of=as_of
    )
