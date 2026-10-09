"""
Full Offline Image-to-Readiness Integration Test.
Executes end-to-end pipeline from OCR cleaning (Layer 1) to rule extraction (Layer 2),
graph reasoning & citizen evaluation (Layer 3), and readiness scoring (Layer 4).
"""

import sys
import importlib
from pathlib import Path
import pytest

ROOT = Path(__file__).parent.parent


def set_layer_context(layer_subpath: str):
    layer_dir = str(ROOT / layer_subpath)
    if layer_dir in sys.path:
        sys.path.remove(layer_dir)
    sys.path.insert(0, layer_dir)
    for k in list(sys.modules.keys()):
        if k == "app" or k.startswith("app."):
            del sys.modules[k]


# 1. Layer 1 Ingestion
set_layer_context("layer1-ingestion")
from app.cleaner import clean_ocr_text

# 2. Layer 2 Semantic Extraction
set_layer_context("layer2-semantic-extraction")
from app.ontology_validation import validate_and_normalize_ruleset
from app.schema import ExtractedRuleSet

# 3. Layer 3 Reasoning Engine
set_layer_context("layer3-reasoning-engine")
from app.graph_client import MockGraphClient
from app.graph_builder import GraphBuilder
from app.evaluation_engine import evaluate_citizen
from app.schema import ExtractedRuleSetInput

# 4. Layer 4 Delivery Service
set_layer_context("layer4-delivery/layer4-service")
from app.readiness_scorer import compute_readiness_score
from app.evidence_engine import build_evidence_plan


def test_full_pipeline_offline_execution():
    raw_notification_text = """
    Post-Matric Scholarship Scheme for SC Students
    Eli- 
    gibility Criteria:
    1. Student must belong to Scheduled Caste (SC) category.
    2. Annual family income must not exceed RS . 2,50,000 per annum.
    3. Student must have completed 10th standard education.

    Exclusions:
    - Families where any member is paying income tax.

    Required Documents:
    - Income Certificate
    - Caste Certificate
    - 10th Marksheet
    - Aadhaar Card

    Benefits:
    - Scholarship allowance of Rs. 12,000 per annum.
    """

    # 1. Layer 1: Text Cleaning & OCR Ingestion
    cleaned_text = clean_ocr_text(raw_notification_text)
    assert "Eligibility Criteria" in cleaned_text

    # 2. Layer 2: Semantic Extraction
    extracted_data = {
        "notification_id": "integration_test_sc_scholarship",
        "scheme_name": "Post-Matric Scholarship Scheme for SC Students",
        "source_language": "en",
        "conditions": [
            {"field": "caste_category", "operator": "eq", "value": "SC", "unit": None, "raw_text": "Student must belong to Scheduled Caste (SC)"},
            {"field": "income_threshold", "operator": "lte", "value": 250000, "unit": "INR", "raw_text": "Annual family income must not exceed 2,50,000"},
            {"field": "education_level", "operator": "gte", "value": "10th", "unit": "grade", "raw_text": "Completed 10th standard"}
        ],
        "documents": [
            {"document_type": "income_certificate", "required_for": "income proof", "raw_text": "Income Certificate"},
            {"document_type": "caste_certificate", "required_for": "caste proof", "raw_text": "Caste Certificate"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "Aadhaar Card"}
        ],
        "benefits": [
            {"benefit_type": "scholarship", "amount": 12000, "frequency": "annual", "raw_text": "Scholarship allowance of Rs. 12,000"}
        ],
        "exclusions": [
            {"field": "income_tax_payer_status", "operator": "eq", "value": True, "unit": None, "raw_text": "Income tax payers excluded"}
        ]
    }
    extracted_rules = ExtractedRuleSet.model_validate(extracted_data)
    normalized_rules = validate_and_normalize_ruleset(extracted_rules)

    # 3. Layer 3: Reasoning Engine Ingestion & Evaluation
    set_layer_context("layer3-reasoning-engine")
    graph_client = MockGraphClient()
    builder = GraphBuilder(client=graph_client)
    input_ruleset = ExtractedRuleSetInput.model_validate(normalized_rules.model_dump())
    builder.ingest_ruleset(input_ruleset)

    # Citizen Profile 1: Fully Eligible
    citizen_facts_1 = {
        "caste_category": "SC",
        "income_threshold": 210000,
        "education_level": "10th",
        "income_tax_payer_status": False,
    }
    eval_result_1 = evaluate_citizen(graph_client, "integration_test_sc_scholarship", citizen_facts_1)
    print("UNKNOWN CONDITIONS:", [u.model_dump() for u in eval_result_1.unknown_conditions])
    assert eval_result_1.verdict.value == "eligible"

    # 4. Layer 4: Readiness Scoring & Actionable Plan
    set_layer_context("layer4-delivery/layer4-service")
    provided_docs = ["income_certificate", "caste_certificate", "aadhaar_card"]
    elig_dict = eval_result_1.model_dump()
    readiness_score = compute_readiness_score(elig_dict, provided_docs)
    evidence_plan = build_evidence_plan(elig_dict, provided_docs)

    assert readiness_score == 100.0


def test_full_pipeline_ineligible_profile():
    # Citizen Profile 2: Exceeded Income Threshold (Ineligible)
    set_layer_context("layer2-semantic-extraction")
    extracted_data = {
        "notification_id": "integration_test_sc_scholarship",
        "scheme_name": "Post-Matric Scholarship Scheme for SC Students",
        "source_language": "en",
        "conditions": [
            {"field": "caste_category", "operator": "eq", "value": "SC", "unit": None, "raw_text": "Student must belong to Scheduled Caste (SC)"},
            {"field": "income_threshold", "operator": "lte", "value": 250000, "unit": "INR", "raw_text": "Annual family income must not exceed 2,50,000"}
        ],
        "documents": [
            {"document_type": "income_certificate", "required_for": "income proof", "raw_text": "Income Certificate"}
        ],
        "benefits": [],
        "exclusions": []
    }
    extracted_rules = ExtractedRuleSet.model_validate(extracted_data)

    set_layer_context("layer3-reasoning-engine")
    graph_client = MockGraphClient()
    builder = GraphBuilder(client=graph_client)
    input_ruleset = ExtractedRuleSetInput.model_validate(extracted_rules.model_dump())
    builder.ingest_ruleset(input_ruleset)

    citizen_facts_2 = {
        "caste_category": "SC",
        "income_threshold": 320000,
    }
    eval_result_2 = evaluate_citizen(graph_client, "integration_test_sc_scholarship", citizen_facts_2)
    assert eval_result_2.verdict.value == "ineligible"

    set_layer_context("layer4-delivery/layer4-service")
    readiness_score = compute_readiness_score(eval_result_2.model_dump(), ["income_certificate"])
    assert readiness_score < 100.0
