import hashlib
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator


# ============================================================================
# Enums
# ============================================================================

class EvaluationStatus(str, Enum):
    """Clause-level evaluation outcome."""
    PASSED = "passed"
    FAILED = "failed"
    UNKNOWN = "unknown"  # Fact missing from citizen input (Layer 4 readiness hook)


class EligibilityVerdict(str, Enum):
    """Overall scheme eligibility determination."""
    ELIGIBLE = "eligible"
    INELIGIBLE = "ineligible"
    NEEDS_MORE_INFO = "needs_more_info"


class ClauseType(str, Enum):
    """Graph clause node classification."""
    CONDITION = "condition"
    EXCLUSION = "exclusion"
    DOCUMENT = "document"
    BENEFIT = "benefit"


# ============================================================================
# Layer 2 Ingestion Contract Models
# ============================================================================

class ConditionInput(BaseModel):
    """Condition clause extracted by Layer 2."""
    field: str = Field(..., description="Ontology field metric (e.g. income_threshold, age_min)")
    operator: str = Field(..., description="Operator (e.g. eq, lt, lte, gt, gte, in_list)")
    value: Any = Field(..., description="Threshold or categorical requirement")
    unit: Optional[str] = Field(None, description="Optional unit (e.g. INR, years, acres)")
    raw_text: str = Field(..., description="Original notification wording for traceability")
    depends_on_field: Optional[str] = Field(None, description="Optional prerequisite condition field")


class DocumentInput(BaseModel):
    """Document requirement clause extracted by Layer 2."""
    document_type: str = Field(..., description="Normalized document type")
    required_for: str = Field(default="verification", description="Requirement it verifies")
    raw_text: str = Field(..., description="Original notification wording")


class BenefitInput(BaseModel):
    """Benefit entitlement clause extracted by Layer 2."""
    benefit_type: str = Field(..., description="Normalized benefit type")
    amount: Optional[Union[float, int, str]] = Field(None, description="Monetary or quantitative value")
    frequency: Optional[str] = Field(None, description="Disbursement frequency")
    raw_text: str = Field(..., description="Original notification wording")


class ExclusionInput(BaseModel):
    """Disqualifying exclusion clause extracted by Layer 2."""
    field: str = Field(..., description="Ontology metric indicating disqualification")
    operator: str = Field(..., description="Operator")
    value: Any = Field(..., description="Disqualifying value")
    unit: Optional[str] = Field(None, description="Optional unit")
    raw_text: str = Field(..., description="Original notification wording")


class ExtractedRuleSetInput(BaseModel):
    """Structured Layer 2 ruleset to be loaded into Neo4j graph."""
    notification_id: str = Field(..., description="Unique scheme identifier or SHA-256 hash")
    scheme_name: Optional[str] = Field(None, description="Official welfare scheme title")
    source_language: str = Field(default="en", description="Source notification language code")
    version: int = Field(default=1, ge=1, description="Scheme rule specification version number")
    effective_date: Optional[str] = Field(None, description="Optional effective date of notification")
    conditions: List[ConditionInput] = Field(default_factory=list)
    documents: List[DocumentInput] = Field(default_factory=list)
    benefits: List[BenefitInput] = Field(default_factory=list)
    exclusions: List[ExclusionInput] = Field(default_factory=list)

    @classmethod
    def generate_clause_id(cls, scheme_id: str, clause_type: str, field_or_type: str, version: int = 1) -> str:
        """Deterministic unique clause node ID."""
        raw = f"{scheme_id}:{clause_type}:{field_or_type}:v{version}"
        hash_suffix = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:8]
        return f"{scheme_id}_{clause_type}_{field_or_type}_{hash_suffix}"


# ============================================================================
# Reasoning Engine Models
# ============================================================================

class CitizenFactSet(BaseModel):
    """Citizen facts profile evaluated against scheme graph."""
    citizen_id: Optional[str] = Field(None, description="Optional citizen identifier")
    facts: Dict[str, Any] = Field(..., description="Flat map of ontology fields to citizen values")


class ClauseEvaluation(BaseModel):
    """Explainable result of evaluating a single condition or exclusion node."""
    clause_id: str
    clause_type: ClauseType
    field: str
    operator: str
    expected_value: Any
    citizen_value: Optional[Any] = None
    status: EvaluationStatus
    raw_text: str = Field(..., description="Verbatim original clause text for explainability")
    reason: str = Field(..., description="Human-readable audit explanation")
    prerequisite_met: bool = Field(default=True, description="False if prerequisite DEPENDS_ON failed")


class EligibilityResult(BaseModel):
    """
    Clause-level explainable eligibility determination.
    The primary output contract of Layer 3 consumed by Layer 4.
    """
    scheme_id: str
    scheme_name: Optional[str]
    verdict: EligibilityVerdict
    citizen_id: Optional[str] = None
    
    # Detailed clause audit trail
    passed_conditions: List[ClauseEvaluation] = Field(default_factory=list)
    failed_conditions: List[ClauseEvaluation] = Field(default_factory=list)
    unknown_conditions: List[ClauseEvaluation] = Field(
        default_factory=list,
        description="Conditions with missing facts - Layer 4 readiness score hook",
    )
    matched_exclusions: List[ClauseEvaluation] = Field(
        default_factory=list,
        description="Exclusion clauses that triggered disqualification",
    )
    
    # Entitlements and proofs
    required_documents: List[Dict[str, Any]] = Field(default_factory=list)
    entitled_benefits: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Explainability summary
    summary_explanation: str = Field(..., description="Human-readable summary narrative")
    audit_trail: List[str] = Field(default_factory=list, description="Step-by-step reasoning trail")
    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ============================================================================
# Version History Models
# ============================================================================

class ClauseHistoryItem(BaseModel):
    """Node version in an AMENDED_BY evolution lineage."""
    clause_id: str
    version: int
    field: str
    operator: str
    value: Any
    raw_text: str
    valid_from: str
    valid_to: Optional[str] = None
    is_current: bool = True
    amended_by_clause_id: Optional[str] = None


class SchemeVersionHistory(BaseModel):
    """Version history of all clauses for a scheme."""
    scheme_id: str
    total_revisions: int
    history: List[ClauseHistoryItem]
