"""
FastAPI service for Layer 2 - Semantic Rule Extraction.
"""

from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.extractor import RuleExtractor
from app.schema import ExtractedRuleSet

app = FastAPI(
    title="Layer 2 Semantic Extraction Service",
    description="Converts notification text into structured eligibility rules using Groq LLM & Pydantic schema.",
    version="1.0.0",
)


class ExtractionRequest(BaseModel):
    text: str
    language: str = "en"
    notification_id: Optional[str] = None


@app.get("/health")
def health_check():
    return {"status": "ok", "layer": 2, "service": "semantic-extraction"}


@app.post("/api/v1/extraction/extract", response_model=ExtractedRuleSet)
def extract_rules(req: ExtractionRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Notification text cannot be empty.")

    try:
        extractor = RuleExtractor()
        ruleset = extractor.extract(
            text=req.text,
            language=req.language,
            notification_id=req.notification_id,
        )
        return ruleset
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rule extraction failed: {str(e)}")
