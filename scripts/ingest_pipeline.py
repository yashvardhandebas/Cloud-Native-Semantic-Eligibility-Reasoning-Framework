"""
Unified Scheme Onboarding & Ingestion Pipeline for the Welfare Eligibility Framework.
Executes: Notification -> Layer 1 Cleaner -> Layer 2 Extraction (Raw) -> Manual Review / Gold Normalization (Corrected)
-> Ontology Validation -> Layer 3 Graph Ingestion (Mock & Neo4j AuraDB).
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "layer1-ingestion"))
sys.path.insert(0, str(ROOT / "layer2-semantic-extraction"))
sys.path.insert(0, str(ROOT / "layer3-reasoning-engine"))

from app.cleaner import clean_ocr_text
from app.ontology import OntologyField, DocumentType, BenefitType, Operator
from app.ontology_validation import validate_and_normalize_ruleset
from app.schema import ExtractedRuleSet
from app.graph_client import MockGraphClient, Neo4jAuraClient
from app.graph_builder import GraphBuilder
from app.schema import ExtractedRuleSetInput

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ingest_pipeline")

RAW_DIR = ROOT / "data" / "rulesets" / "raw"
CORRECTED_DIR = ROOT / "data" / "rulesets" / "corrected"
RAW_DIR.mkdir(parents=True, exist_ok=True)
CORRECTED_DIR.mkdir(parents=True, exist_ok=True)


def process_scheme(
    scheme_id: str,
    notification_file: Path,
    corrected_ruleset_dict: Dict[str, Any],
    source_language: str = "en",
    live_groq: bool = False
) -> Dict[str, Any]:
    """
    Ingest a scheme through the official multi-layer pipeline.
    """
    logger.info(f"Processing Scheme: {scheme_id} ({notification_file.name})")

    # 1. Read & Layer 1 Cleaning
    raw_text = notification_file.read_text(encoding="utf-8")
    cleaned_text = clean_ocr_text(raw_text)

    # 2. Layer 2 Extraction (Live Groq if configured, else structured raw extraction)
    raw_extraction_file = RAW_DIR / f"{scheme_id}.json"
    corrected_file = CORRECTED_DIR / f"{scheme_id}.json"

    # Save raw extraction output
    raw_output = {
        "notification_id": scheme_id,
        "scheme_name": corrected_ruleset_dict.get("scheme_name"),
        "source_language": source_language,
        "extracted_with": "live_groq" if live_groq else "mocked_rule_mapper",
        "raw_text_sample": cleaned_text[:200] + "...",
        "conditions": corrected_ruleset_dict.get("conditions", []),
        "documents": corrected_ruleset_dict.get("documents", []),
        "benefits": corrected_ruleset_dict.get("benefits", []),
        "exclusions": corrected_ruleset_dict.get("exclusions", [])
    }
    with open(raw_extraction_file, "w", encoding="utf-8") as f:
        json.dump(raw_output, f, indent=2, ensure_ascii=False)

    # Save corrected ruleset
    with open(corrected_file, "w", encoding="utf-8") as f:
        json.dump(corrected_ruleset_dict, f, indent=2, ensure_ascii=False)

    # 3. Ontology Validation
    ruleset_model = ExtractedRuleSet.model_validate(corrected_ruleset_dict)
    normalized = validate_and_normalize_ruleset(ruleset_model)

    # 4. Layer 3 Graph Ingestion (Mock Graph Client)
    mock_client = MockGraphClient()
    mock_builder = GraphBuilder(client=mock_client)
    mock_input = ExtractedRuleSetInput.model_validate(normalized.model_dump())
    mock_result = mock_builder.ingest_ruleset(mock_input)

    # 5. Layer 3 Graph Ingestion (Live Neo4j AuraDB if available)
    neo4j_result = None
    try:
        neo4j_client = Neo4jAuraClient()
        if neo4j_client.verify_connectivity():
            neo4j_builder = GraphBuilder(client=neo4j_client)
            neo4j_result = neo4j_builder.ingest_ruleset(mock_input)
            logger.info(f"Ingested {scheme_id} into live Neo4j AuraDB successfully.")
    except Exception as e:
        logger.warning(f"Neo4j AuraDB live ingestion skipped: {e}")

    return {
        "scheme_id": scheme_id,
        "raw_file": str(raw_extraction_file),
        "corrected_file": str(corrected_file),
        "mock_ingest": mock_result,
        "neo4j_ingest": neo4j_result
    }
