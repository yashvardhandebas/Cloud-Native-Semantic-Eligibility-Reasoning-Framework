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


def validate_and_normalize_ruleset(ruleset: ExtractedRuleSet) -> ExtractedRuleSet:
    """Apply controlled vocabulary corrections without calling the LLM again."""
    exclusions: List[Exclusion] = [_remap_exclusion(e) for e in ruleset.exclusions]
    payload = ruleset.model_dump()
    payload["exclusions"] = [e.model_dump() for e in exclusions]
    return ExtractedRuleSet.model_validate(payload)
