import hashlib
from typing import Any, List, Optional, Union
from pydantic import BaseModel, Field, field_validator
from app.ontology import OntologyField, DocumentType, BenefitType, Operator

class Condition(BaseModel):
    """Represents an eligibility requirement clause extracted from a notification."""
    field: OntologyField = Field(..., description="Ontology field representing the eligibility metric")
    operator: Operator = Field(..., description="Comparison or relational operator")
    value: Any = Field(..., description="Threshold, categorical value, or list of values")
    unit: Optional[str] = Field(None, description="Optional unit (e.g., INR, years, acres)")
    raw_text: str = Field(..., description="Original clause text from notification for explainability")

    @field_validator("operator", mode="before")
    @classmethod
    def normalize_operator(cls, v: Any) -> Any:
        if isinstance(v, str):
            v_clean = v.strip().lower()
            mapping = {
                "<": Operator.LT,
                "<=": Operator.LTE,
                ">": Operator.GT,
                ">=": Operator.GTE,
                "=": Operator.EQ,
                "==": Operator.EQ,
                "!=": Operator.NE,
                "in": Operator.IN_LIST,
                "between": Operator.IN_RANGE,
            }
            if v_clean in mapping:
                return mapping[v_clean]
            # Try matching enum value
            for op in Operator:
                if op.value == v_clean:
                    return op
        return v


class Document(BaseModel):
    """Represents a document or proof required to support eligibility claims."""
    document_type: DocumentType = Field(..., description="Normalized document type from ontology")
    required_for: str = Field(..., description="Condition, benefit, or verification requirement it supports")
    raw_text: str = Field(..., description="Original clause text from notification for explainability")


class Benefit(BaseModel):
    """Represents a welfare benefit entitlement provided by the scheme."""
    benefit_type: BenefitType = Field(..., description="Normalized benefit category from ontology")
    amount: Optional[Union[float, int, str]] = Field(None, description="Monetary or quantitative value of benefit")
    frequency: Optional[str] = Field(None, description="Disbursement frequency (e.g., monthly, annual, one-time)")
    raw_text: str = Field(..., description="Original clause text from notification for explainability")


class Exclusion(BaseModel):
    """Represents a disqualifying criterion or negative condition."""
    field: OntologyField = Field(..., description="Ontology field representing the disqualification metric")
    operator: Operator = Field(..., description="Comparison or relational operator")
    value: Any = Field(..., description="Disqualifying threshold or categorical value")
    unit: Optional[str] = Field(None, description="Optional unit (e.g., INR, years, acres)")
    raw_text: str = Field(..., description="Original clause text from notification for explainability")

    @field_validator("operator", mode="before")
    @classmethod
    def normalize_operator(cls, v: Any) -> Any:
        return Condition.normalize_operator(v)


# Type aliases for backwards / stylistic compatibility
ConditionClause = Condition
DocumentClause = Document
BenefitClause = Benefit
ExclusionClause = Exclusion


class ExtractedRuleSet(BaseModel):
    """Top-level structured output of extracted eligibility rules for Layer 3 reasoning."""
    notification_id: str = Field(..., description="Unique notification identifier or SHA-256 content hash")
    scheme_name: Optional[str] = Field(None, description="Identifiable welfare scheme title")
    source_language: str = Field(..., description="Language code of source text (en, hi, ta, te)")
    conditions: List[Condition] = Field(default_factory=list, description="Extracted eligibility condition clauses")
    documents: List[Document] = Field(default_factory=list, description="Required verification documents")
    benefits: List[Benefit] = Field(default_factory=list, description="Entitlements and welfare benefits")
    exclusions: List[Exclusion] = Field(default_factory=list, description="Disqualifying criteria")

    @classmethod
    def generate_hash_id(cls, text: str) -> str:
        """Generate deterministic SHA-256 hash prefix from notification text."""
        return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()[:16]
