"""
Unified API Gateway orchestrating end-to-end welfare eligibility pipeline execution across Layers 1-4.
"""

from typing import Any, Dict, List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

app = FastAPI(
    title="Welfare Eligibility Framework - API Gateway",
    description="Unified Gateway orchestrating Layer 1 OCR -> Layer 2 Extraction -> Layer 3 Graph Reasoning -> Layer 4 Readiness Scoring.",
    version="1.0.0",
)


class PipelineTextRequest(BaseModel):
    notification_text: str
    citizen_facts: Dict[str, Any]
    language: str = "en"
    provided_documents: Optional[List[str]] = None


@app.get("/health")
def gateway_health():
    return {"status": "ok", "gateway": "active", "layers": [1, 2, 3, 4]}


@app.post("/api/v1/pipeline/process-text")
def process_pipeline_text(req: PipelineTextRequest):
    """
    Full pipeline execution from raw notification text to readiness report.
    """
    try:
        # Layer 1 Processing
        from layer1-ingestion.app.cleaner import clean_ocr_text
    except Exception:
        pass

    # Direct in-process execution across layer modules
    import sys
    from pathlib import Path
    root = Path(__file__).parent.parent
    sys.path.insert(0, str(root / "layer1-ingestion"))
    sys.path.insert(0, str(root / "layer2-semantic-extraction"))
    sys.path.insert(0, str(root / "layer3-reasoning-engine"))
    sys.path.insert(0, str(root / "layer4-delivery" / "layer4-service"))

    try:
        from layer1.app.cleaner import clean_ocr_text
    except ImportError:
        def clean_ocr_text(t): return t.strip()

    # 1. Layer 1 Ingestion
    cleaned_text = clean_ocr_text(req.notification_text)

    # 2. Layer 2 Semantic Extraction
    from layer2.app.extractor import RuleExtractor
    from layer2.app.schema import ExtractedRuleSet
    extractor = RuleExtractor()
    extracted_rules = extractor.extract(text=cleaned_text, language=req.language)

    # 3. Layer 3 Graph Reasoning
    from layer3.app.graph_client import MockGraphClient
    from layer3.app.graph_builder import GraphBuilder
    from layer3.app.evaluation_engine import evaluate_citizen
    from layer3.app.schema import ExtractedRuleSetInput

    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    input_ruleset = ExtractedRuleSetInput.model_validate(extracted_rules.model_dump())
    builder.ingest_ruleset(input_ruleset)

    eligibility = evaluate_citizen(
        client=client,
        scheme_id=input_ruleset.notification_id,
        facts=req.citizen_facts,
    )

    # 4. Layer 4 Readiness Delivery
    from layer4.app.readiness_scorer import compute_readiness_score
    from layer4.app.evidence_engine import build_evidence_plan

    elig_dict = eligibility.model_dump()
    readiness_score = compute_readiness_score(elig_dict, req.provided_documents)
    evidence_plan = build_evidence_plan(elig_dict, req.provided_documents)

    return {
        "notification_id": input_ruleset.notification_id,
        "scheme_name": extracted_rules.scheme_name,
        "cleaned_text": cleaned_text,
        "extracted_rules": extracted_rules.model_dump(),
        "eligibility_verdict": eligibility.verdict.value,
        "eligibility_result": elig_dict,
        "readiness_score": readiness_score,
        "evidence_plan": evidence_plan,
    }
