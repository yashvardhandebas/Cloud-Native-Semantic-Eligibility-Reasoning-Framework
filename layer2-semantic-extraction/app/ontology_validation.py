"""
Post-extraction validation and correction for common LLM ontology mis-assignments.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Tuple

from app.ontology import OntologyField, Operator
from app.schema import ExtractedRuleSet, Condition, Exclusion


INSTITUTIONAL_LANDHOLDER_PATTERNS = (
    "institutional landholder",
    "institutional landholders",
)

TAX_PAYER_PATTERNS = (
    "paid income tax",
    "income tax in the last",
    "income tax payer",
    "filed income tax",
)

CONSTITUTIONAL_POST_PATTERNS = (
    "constitutional post",
    "holders of constitutional",
)


def _text_mentions(raw_text: str, patterns: Tuple[str, ...]) -> bool:
    lowered = raw_text.lower()
    return any(p in lowered for p in patterns)


def _remap_exclusion(exc: Exclusion) -> Exclusion:
    raw = exc.raw_text or ""
    data = exc.model_dump()

    if exc.field == OntologyField.OCCUPATION and (
        exc.value == "institutional_landholder"
        or _text_mentions(raw, INSTITUTIONAL_LANDHOLDER_PATTERNS)
    ):
        data["field"] = OntologyField.INSTITUTIONAL_LANDHOLDER
        data["operator"] = Operator.EQ
        data["value"] = True

    if exc.field == OntologyField.INCOME_THRESHOLD and (
        str(exc.value).lower() in ("income_tax_payer", "tax_payer", "paid_income_tax")
        or _text_mentions(raw, TAX_PAYER_PATTERNS)
    ):
        data["field"] = OntologyField.INCOME_TAX_PAYER_STATUS
        data["operator"] = Operator.EQ
        data["value"] = True

    if exc.field == OntologyField.OCCUPATION and _text_mentions(raw, CONSTITUTIONAL_POST_PATTERNS):
        data["field"] = OntologyField.CONSTITUTIONAL_POST_HOLDER
        data["operator"] = Operator.EQ
        data["value"] = True

    return Exclusion.model_validate(data)


def _normalize_condition(cond: Condition) -> Condition:
    data = cond.model_dump()
    field = cond.field
    val = cond.value
    op = cond.operator

    # Numeric threshold normalization
    numeric_fields = {
        OntologyField.INCOME_THRESHOLD,
        OntologyField.ACADEMIC_PERCENTAGE,
        OntologyField.AGE_MIN,
        OntologyField.AGE_MAX,
    }
    if field in numeric_fields:
        if isinstance(val, str):
            clean_val = re.sub(r"[^\d.]", "", val)
            if clean_val:
                try:
                    data["value"] = float(clean_val) if "." in clean_val else int(clean_val)
                except ValueError:
                    pass
        if field == OntologyField.INCOME_THRESHOLD and op == Operator.EQ and isinstance(data.get("value"), (int, float)):
            data["operator"] = Operator.LTE

    # Caste category normalization
    if field == OntologyField.CASTE_CATEGORY and isinstance(val, str):
        uval = val.strip().upper()
        if uval in ("SC", "SCHEDULED CASTE"):
            data["value"] = "SC"
        elif uval in ("ST", "SCHEDULED TRIBE"):
            data["value"] = "ST"
        elif uval in ("OBC", "OTHER BACKWARD CLASS"):
            data["value"] = "OBC"

    return Condition.model_validate(data)


def validate_and_normalize_ruleset(ruleset: ExtractedRuleSet) -> ExtractedRuleSet:
    """Apply controlled vocabulary corrections and general field/value pair validations."""
    conditions: List[Condition] = [_normalize_condition(c) for c in ruleset.conditions]
    exclusions: List[Exclusion] = [_remap_exclusion(e) for e in ruleset.exclusions]
    payload = ruleset.model_dump()
    payload["conditions"] = [c.model_dump() for c in conditions]
    payload["exclusions"] = [e.model_dump() for e in exclusions]
    return ExtractedRuleSet.model_validate(payload)
