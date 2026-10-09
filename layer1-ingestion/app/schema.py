import hashlib
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator


class SourceType(str, Enum):
    """Supported source media types for notification ingestion."""
    SCANNED_IMAGE = "scanned_image"
    PDF = "pdf"
    WEB_PAGE = "web_page"


class DetectedLanguage(str, Enum):
    """Supported languages for the semantic reasoning framework."""
    EN = "en"
    HI = "hi"
    TA = "ta"
    TE = "te"
    UNKNOWN = "unknown"


class PageOCRResult(BaseModel):
    """OCR result for a single page of a multi-page document."""
    page_number: int = Field(..., description="1-based page number")
    raw_text: str = Field(default="", description="Raw OCR text extracted from this page")
    cleaned_text: str = Field(default="", description="Cleaned OCR text extracted from this page")
    confidence: Optional[float] = Field(None, ge=0.0, le=100.0, description="Average OCR confidence percentage")


class OCRResult(BaseModel):
    """Aggregated output from OCR extraction engine."""
    raw_text: str = Field(..., description="Full concatenated text across all pages")
    cleaned_text: str = Field(default="", description="Cleaned concatenated text across all pages")
    page_count: int = Field(default=1, ge=1, description="Total number of processed pages")
    pages: List[PageOCRResult] = Field(default_factory=list, description="Page-by-page OCR results")


class IngestedNotification(BaseModel):
    """
    Standard output contract for Layer 1 ingestion.
    Directly consumed by Layer 2 for semantic rule and clause extraction.
    """
    notification_id: str = Field(
        ...,
        description="Deterministic hash of source content for deduplication and versioning",
    )
    source_type: SourceType = Field(
        ...,
        description="Type of input source (scanned_image, pdf, or web_page)",
    )
    detected_language: DetectedLanguage = Field(
        ...,
        description="Identified language code (en, hi, ta, te, or unknown)",
    )
    language_confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Language detection confidence score between 0 and 1",
    )
    raw_ocr_text: str = Field(
        ...,
        description="Unprocessed raw extracted text preserved for auditing and debugging",
    )
    cleaned_text: str = Field(
        ...,
        description="Normalized and cleaned text ready for Layer 2 LLM clause extraction",
    )
    source_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Source metadata including original filename/URL, page count, and timestamp",
    )

    @classmethod
    def generate_notification_id(cls, content: Union[str, bytes]) -> str:
        """
        Generate deterministic SHA-256 hash prefix from raw binary or text content.
        Consistent with Layer 2 notification ID conventions.
        """
        if isinstance(content, str):
            data = content.strip().encode("utf-8")
        else:
            data = content
        return hashlib.sha256(data).hexdigest()[:16]

    @classmethod
    def create_metadata(
        cls,
        source_name: str,
        source_type: SourceType,
        page_count: int = 1,
        file_size_bytes: Optional[int] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Convenience builder for standardized source_metadata."""
        metadata: Dict[str, Any] = {
            "source_name": source_name,
            "source_type": source_type.value,
            "page_count": page_count,
            "file_size_bytes": file_size_bytes,
            "ingested_at": datetime.now(timezone.utc).isoformat(),
        }
        if extra:
            metadata.update(extra)
        return metadata
