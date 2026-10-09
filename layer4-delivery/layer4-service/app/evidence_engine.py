"""
Part A — Evidence Completion Engine.

Analyzes Layer 3 clause-level evaluation results, identifies unknown clauses,
diagnoses missing facts and required supporting documents, and estimates an
explainable confidence score (0.0 to 1.0).
"""

from typing import Any, Dict, List, Optional
from app.schema import (
    EligibilityResult,
    EvidenceCompletionSummary,
    MissingEvidenceItem,
)

# Canonical human-readable field labels for citizen guidance
FIELD_LABELS: Dict[str, str] = {
    "income_threshold": "Annual Family Income",
    "caste_category": "Social / Caste Category",
    "education_level": "Educational Qualification",
    "occupation": "Employment / Occupation Status",
    "existing_scheme_beneficiary": "Other Government Scholarship / Benefit Status",
    "residence_state": "State Domicile / Residence",
    "age": "Citizen Age",
    "age_min": "Minimum Age Requirement",
    "age_max": "Maximum Age Requirement",
    "gender": "Gender",
    "disability_percentage": "Disability Percentage",
    "land_holding_acres": "Agricultural Land Holding",
}

# Standard verification document mapping fallback
DEFAULT_DOCUMENTS: Dict[str, str] = {
    "income_threshold": "Income Certificate issued by competent revenue authority (valid for current FY)",
    "caste_category": "Caste Certificate issued by competent revenue authority (Tahsildar / SDO)",
    "education_level": "10th Standard / Matriculation Board Marksheet or Passing Certificate",
    "occupation": "Student Bonafide / Enrollment Certificate or Non-employment Affidavit",
    "existing_scheme_beneficiary": "Self-declaration undertaking of not receiving duplicate scholarships",
    "residence_state": "Permanent Resident Certificate (PRC) or Domicile Certificate",
    "age": "Birth Certificate, 10th Admit Card, or Aadhaar Card",
    "age_min": "Birth Certificate or Aadhaar Card",
    "age_max": "Birth Certificate or Aadhaar Card",
    "gender": "Government Photo ID Proof",
    "disability_percentage": "UDID Card or Disability Certificate issued by District Medical Board",
    "land_holding_acres": "Revenue Land Record / Patta Copy",
}


def _find_matching_document(field: str, required_documents: List[Dict]) -> Optional[str]:
    """Look up if scheme's required documents list explicitly names a document for this field."""
    f_clean = field.lower().replace("_", " ")
    for doc in required_documents:
        doc_type = str(doc.get("document_type", "")).lower().replace("_", " ")
        req_for = str(doc.get("required_for", "")).lower()
        raw = str(doc.get("raw_text", ""))

        if (
            f_clean in req_for
            or doc_type in f_clean
            or ("income" in field and "income" in doc_type)
            or ("caste" in field and "caste" in doc_type)
            or ("residence" in field and "residence" in doc_type)
            or ("domicile" in field and "domicile" in doc_type)
        ):
            return f"{doc.get('document_type', '').replace('_', ' ').title()} - {raw}"
    return None


def analyze_evidence_completion(result: EligibilityResult) -> EvidenceCompletionSummary:
    """
    Part A pure function:
    Evaluates missing evidence from unknown conditions in Layer 3's output.
    Computes explainable confidence score = resolved_clauses / total_clauses.
    """
    total_clauses = (
        len(result.passed_conditions)
        + len(result.failed_conditions)
        + len(result.unknown_conditions)
        + len(result.matched_exclusions)
    )

    unknown_count = len(result.unknown_conditions)
    resolved_count = total_clauses - unknown_count

    # Explainable confidence formula
    if total_clauses == 0:
        confidence = 1.0
    else:
        confidence = round(resolved_count / total_clauses, 2)

    missing_items: List[MissingEvidenceItem] = []

    for clause in result.unknown_conditions:
        field = clause.field
        field_label = FIELD_LABELS.get(field, field.replace("_", " ").title())

        # Match with scheme documents or default reference
        matched_doc = _find_matching_document(field, result.required_documents)
        recommended_doc = matched_doc or DEFAULT_DOCUMENTS.get(
            field, f"Official supporting verification document for {field_label}"
        )

        prompt = (
            f"Please declare your {field_label.lower()} and provide an official "
            f"'{recommended_doc.split(' - ')[0]}' to complete verification of this clause."
        )

        missing_items.append(
            MissingEvidenceItem(
                clause_id=clause.clause_id,
                field=field,
                field_label=field_label,
                raw_text=clause.raw_text,
                recommended_document=recommended_doc,
                action_prompt=prompt,
            )
        )

    if unknown_count == 0:
        explanation = (
            f"All {total_clauses} eligibility criteria have been verified with complete "
            f"citizen evidence (Confidence: {int(confidence * 100)}%)."
        )
    else:
        explanation = (
            f"Evaluated {resolved_count} of {total_clauses} scheme criteria. "
            f"{unknown_count} required fact(s) are missing from the citizen profile, "
            f"resulting in a confidence score of {confidence:.2f} ({int(confidence * 100)}%)."
        )

    return EvidenceCompletionSummary(
        confidence_score=confidence,
        total_clauses=total_clauses,
        resolved_clauses=resolved_count,
        unknown_clauses_count=unknown_count,
        missing_evidence=missing_items,
        explanation=explanation,
    )


def build_evidence_plan(
    eligibility_payload: Dict[str, Any], provided_documents: Optional[List[str]] = None
) -> EvidenceCompletionSummary:
    """Convenience builder parsing dict eligibility payload and returning evidence summary."""
    result = EligibilityResult.model_validate(eligibility_payload)
    return analyze_evidence_completion(result)
