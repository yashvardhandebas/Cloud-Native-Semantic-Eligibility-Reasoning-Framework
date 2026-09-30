from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


# ============================================================================
# Layer 3 Inbound Contract Enums & Models
# ============================================================================

class EvaluationStatus(str, Enum):
    """Clause-level evaluation outcome from Layer 3."""
    PASSED = "passed"
    FAILED = "failed"
    UNKNOWN = "unknown"


class EligibilityVerdict(str, Enum):
    """Overall scheme eligibility determination from Layer 3."""
    ELIGIBLE = "eligible"
    INELIGIBLE = "ineligible"
    NEEDS_MORE_INFO = "needs_more_info"


class ClauseType(str, Enum):
    """Clause classification node type."""
    CONDITION = "condition"
    EXCLUSION = "exclusion"
    DOCUMENT = "document"
    BENEFIT = "benefit"


class ClauseEvaluation(BaseModel):
    """Explainable result of evaluating a single condition or exclusion from Layer 3."""
    clause_id: str
    clause_type: ClauseType = ClauseType.CONDITION
    field: str
    operator: str
    expected_value: Any
    citizen_value: Optional[Any] = None
    status: EvaluationStatus
    raw_text: str = Field(..., description="Verbatim original notification clause text")
    reason: str = Field(..., description="Audit explanation from Layer 3")
    prerequisite_met: bool = Field(default=True)


class EligibilityResult(BaseModel):
    """
    Clause-level explainable eligibility determination from Layer 3.
    This is the primary input payload for Layer 4.
    """
    scheme_id: str
    scheme_name: Optional[str] = None
    verdict: EligibilityVerdict
    citizen_id: Optional[str] = None

    passed_conditions: List[ClauseEvaluation] = Field(default_factory=list)
    failed_conditions: List[ClauseEvaluation] = Field(default_factory=list)
    unknown_conditions: List[ClauseEvaluation] = Field(default_factory=list)
    matched_exclusions: List[ClauseEvaluation] = Field(default_factory=list)

    required_documents: List[Dict[str, Any]] = Field(default_factory=list)
    entitled_benefits: List[Dict[str, Any]] = Field(default_factory=list)

    summary_explanation: str = Field(default="")
    audit_trail: List[str] = Field(default_factory=list)
    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ============================================================================
# Layer 4 Outbound Contract Models
# ============================================================================

class MissingEvidenceItem(BaseModel):
    """A missing fact or document diagnosed for a specific unknown clause."""
    clause_id: str
    field: str
    field_label: str
    raw_text: str = Field(..., description="Verbatim clause text from notification")
    recommended_document: str = Field(..., description="Recommended supporting verification document")
    action_prompt: str = Field(..., description="Citizen-directed instructions to resolve")


class EvidenceCompletionSummary(BaseModel):
    """Part A: Evidence Completion diagnostic analysis."""
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Explainable confidence score: resolved_clauses / total_clauses",
    )
    total_clauses: int
    resolved_clauses: int
    unknown_clauses_count: int
    missing_evidence: List[MissingEvidenceItem] = Field(default_factory=list)
    explanation: str


class ClauseReadinessDetail(BaseModel):
    """Part B: Clause-level actionability and proximity breakdown."""
    clause_id: str
    clause_type: ClauseType
    field: str
    field_label: str
    status: EvaluationStatus
    is_mutable: bool = Field(..., description="Whether this criterion can change or is permanently fixed")
    citizen_value: Any = None
    expected_value: Any = None
    operator: str
    raw_text: str
    proximity_score: float = Field(
        ..., ge=0.0, le=1.0, description="Numerical/logical closeness score (1.0 = satisfied)"
    )
    actionable_message: Optional[str] = Field(
        None, description="Specific guidance on what exact value needs to change"
    )


class ReadinessAssessment(BaseModel):
    """Part B: Overall readiness scoring and change recommendations."""
    readiness_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Eligibility readiness score (0-100) showing closeness to qualifying",
    )
    verdict: EligibilityVerdict
    is_blocked_by_immutable: bool = Field(
        default=False,
        description="True if an unchangeable attribute (e.g. caste) permanently blocks qualification",
    )
    immutable_roadblocks: List[str] = Field(
        default_factory=list,
        description="Fixed criteria that failed and cannot be altered",
    )
    actionable_recommendations: List[str] = Field(
        default_factory=list,
        description="Specific changes to mutable fields that would flip verdict to eligible",
    )
    clause_breakdown: List[ClauseReadinessDetail] = Field(default_factory=list)
    citizen_summary: str = Field(..., description="Clear citizen-facing synthesis")


class FullReadinessResponse(BaseModel):
    """Combined Part A + Part B API response payload."""
    scheme_id: str
    scheme_name: Optional[str] = None
    citizen_id: Optional[str] = None
    verdict: EligibilityVerdict
    evidence_completion: EvidenceCompletionSummary
    readiness_assessment: ReadinessAssessment
    entitled_benefits: List[Dict[str, Any]] = Field(default_factory=list)
    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
