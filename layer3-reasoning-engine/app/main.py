"""
FastAPI service for Layer 3 - Reasoning Engine & Graph Evaluation.
"""

from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from app.evaluation_engine import evaluate_citizen
from app.graph_builder import GraphBuilder
from app.graph_client import get_graph_client
from app.rule_evolution import RuleEvolutionEngine
from app.schema import EligibilityResult, ExtractedRuleSetInput

app = FastAPI(
    title="Layer 3 Reasoning Engine Service",
    description="Graph-based eligibility determination and point-in-time rule evolution.",
    version="1.0.0",
)


class EvaluationRequest(BaseModel):
    scheme_id: str
    citizen_facts: Dict[str, Any]
    citizen_id: Optional[str] = None
    as_of: Optional[str] = None


@app.get("/health")
def health_check():
    client = get_graph_client()
    summary = client.get_graph_summary()
    return {"status": "ok", "layer": 3, "service": "reasoning-engine", "graph": summary}


@app.post("/api/v1/reasoning/ingest")
def ingest_ruleset(ruleset: ExtractedRuleSetInput):
    try:
        client = get_graph_client()
        builder = GraphBuilder(client=client)
        result = builder.ingest_ruleset(ruleset)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@app.post("/api/v1/reasoning/evaluate", response_model=EligibilityResult)
def evaluate(req: EvaluationRequest):
    try:
        client = get_graph_client()
        result = evaluate_citizen(
            client=client,
            scheme_id=req.scheme_id,
            facts=req.citizen_facts,
            citizen_id=req.citizen_id,
            as_of=req.as_of,
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=440, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@app.post("/api/v1/reasoning/evolve")
def evolve_ruleset(ruleset: ExtractedRuleSetInput):
    try:
        client = get_graph_client()
        engine = RuleEvolutionEngine(client=client)
        result = engine.evolve_ruleset(ruleset)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evolution failed: {str(e)}")
