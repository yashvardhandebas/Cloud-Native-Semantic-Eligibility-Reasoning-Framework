"""
FastAPI service for Layer 4 - Readiness Scorer & Evidence Completion.
"""

from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.evidence_engine import build_evidence_plan
from app.readiness_scorer import compute_readiness_score
from app.schema import ActionableGuidance, CitizenReadinessReport

app = FastAPI(
    title="Layer 4 Delivery & Readiness Service",
    description="Calculates application readiness score (0-100) and actionable evidence checklists.",
    version="1.0.0",
)


class DeliveryRequest(BaseModel):
    eligibility_result: Dict[str, Any]
    provided_documents: Optional[List[str]] = None


@app.get("/health")
def health_check():
    return {"status": "ok", "layer": 4, "service": "delivery"}


@app.post("/api/v1/delivery/readiness", response_model=CitizenReadinessReport)
def calculate_readiness(req: DeliveryRequest):
    try:
        score = compute_readiness_score(
            eligibility_payload=req.eligibility_result,
            provided_documents=req.provided_documents,
        )
        plan = build_evidence_plan(
            eligibility_payload=req.eligibility_result,
            provided_documents=req.provided_documents,
        )
        return CitizenReadinessReport(
            scheme_id=req.eligibility_result.get("scheme_id", "unknown"),
            scheme_name=req.eligibility_result.get("scheme_name"),
            verdict=req.eligibility_result.get("verdict", "needs_more_info"),
            readiness_score=score,
            evidence_plan=plan,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Readiness scoring failed: {str(e)}")
