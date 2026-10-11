"""
Test Suite: Expanded Scheme Catalog & Multilingual Reasoning Pipeline.
Validates:
1. Extended Ontology controlled vocabulary (new fields, documents, benefits).
2. End-to-end multilingual pipeline execution across English, Hindi, Tamil, and Telugu.
3. Verification of 39 hand-derived citizen profiles across all 13 welfare schemes.
"""

import json
import sys
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


def test_extended_ontology_fields():
    """Verify newly introduced ontology fields and document/benefit types are valid."""
    set_layer_context("layer2-semantic-extraction")
    from app.ontology import OntologyField, DocumentType, BenefitType, Operator
    from app.ontology_validation import validate_and_normalize_ruleset
    from app.schema import ExtractedRuleSet, Condition, Document, Benefit, Exclusion

    assert OntologyField.BPL_STATUS == "bpl_status"
    assert OntologyField.HAS_LPG_CONNECTION == "has_lpg_connection"
    assert OntologyField.HOUSE_TYPE == "house_type"
    assert OntologyField.OWNS_VEHICLE == "owns_vehicle"
    assert OntologyField.TRADE == "trade"
    assert OntologyField.SCHOOL_TYPE == "school_type"
    assert OntologyField.CHILD_AGE == "child_age"
    assert OntologyField.HAS_PENSION_SCHEME == "has_pension_scheme"

    assert DocumentType.JOB_CARD == "job_card"
    assert DocumentType.SCHOOL_CERTIFICATE == "school_certificate"
    assert DocumentType.ARTISAN_ID == "artisan_id"

    assert BenefitType.HEALTH_COVER == "health_cover"
    assert BenefitType.HOUSING_SUBSIDY == "housing_subsidy"
    assert BenefitType.TOOLKIT_INCENTIVE == "toolkit_incentive"
    assert BenefitType.CREDIT_FACILITY == "credit_facility"

    # Test normalization of a ruleset containing new ontology fields
    test_ruleset = ExtractedRuleSet(
        notification_id="test_ontology_ext",
        scheme_name="Extended Test Scheme",
        source_language="en",
        conditions=[
            Condition(field=OntologyField.BPL_STATUS, operator=Operator.EQ, value=True, raw_text="Must be BPL"),
            Condition(field=OntologyField.HOUSE_TYPE, operator=Operator.IN_LIST, value=["kutcha"], raw_text="Kutcha house"),
        ],
        documents=[
            Document(document_type=DocumentType.JOB_CARD, required_for="labor", raw_text="MGNREGA Job Card")
        ],
        benefits=[
            Benefit(benefit_type=BenefitType.HEALTH_COVER, amount=500000, frequency="annual", raw_text="Health cover 5 lakh")
        ],
        exclusions=[
            Exclusion(field=OntologyField.OWNS_VEHICLE, operator=Operator.EQ, value=True, raw_text="No vehicles")
        ]
    )
    normalized = validate_and_normalize_ruleset(test_ruleset)
    assert len(normalized.conditions) == 2
    assert len(normalized.exclusions) == 1


def test_e2e_pipeline_english_pmjay():
    """End-to-End Test for English Scheme: Ayushman Bharat PM-JAY."""
    set_layer_context("layer1-ingestion")
    from app.cleaner import clean_ocr_text

    raw_text = (ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "04_pm_jay_en.txt").read_text(encoding="utf-8")
    cleaned = clean_ocr_text(raw_text)
    assert "Ayushman Bharat" in cleaned

    set_layer_context("layer2-semantic-extraction")
    from app.schema import ExtractedRuleSet
    from app.ontology_validation import validate_and_normalize_ruleset

    with open(ROOT / "data" / "rulesets" / "corrected" / "pm-jay-ayushman-bharat.json", "r", encoding="utf-8") as f:
        ruleset_dict = json.load(f)
    normalized = validate_and_normalize_ruleset(ExtractedRuleSet.model_validate(ruleset_dict))

    set_layer_context("layer3-reasoning-engine")
    from app.graph_client import MockGraphClient
    from app.graph_builder import GraphBuilder
    from app.evaluation_engine import evaluate_citizen
    from app.schema import ExtractedRuleSetInput

    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    input_ruleset = ExtractedRuleSetInput.model_validate(normalized.model_dump())
    builder.ingest_ruleset(input_ruleset)

    # 1. Eligible citizen
    res_eligible = evaluate_citizen(client, "pm-jay-ayushman-bharat", {"bpl_status": True, "existing_scheme_beneficiary": "none"})
    assert res_eligible.verdict.value == "eligible"

    # 2. Ineligible citizen (CGHS exclusion)
    res_ineligible = evaluate_citizen(client, "pm-jay-ayushman-bharat", {"bpl_status": True, "existing_scheme_beneficiary": "cghs_echs_capf"})
    assert res_ineligible.verdict.value == "ineligible"


def test_e2e_pipeline_hindi_pm_ujjwala():
    """End-to-End Test for Hindi Scheme: PM Ujjwala Yojana 2.0."""
    set_layer_context("layer1-ingestion")
    from app.cleaner import clean_ocr_text

    raw_text = (ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "hi" / "02_pm_ujjwala_hi.txt").read_text(encoding="utf-8")
    cleaned = clean_ocr_text(raw_text)
    assert "उज्ज्वला" in cleaned

    set_layer_context("layer2-semantic-extraction")
    from app.schema import ExtractedRuleSet
    from app.ontology_validation import validate_and_normalize_ruleset

    with open(ROOT / "data" / "rulesets" / "corrected" / "pm-ujjwala-yojana.json", "r", encoding="utf-8") as f:
        ruleset_dict = json.load(f)
    normalized = validate_and_normalize_ruleset(ExtractedRuleSet.model_validate(ruleset_dict))

    set_layer_context("layer3-reasoning-engine")
    from app.graph_client import MockGraphClient
    from app.graph_builder import GraphBuilder
    from app.evaluation_engine import evaluate_citizen
    from app.schema import ExtractedRuleSetInput

    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    input_ruleset = ExtractedRuleSetInput.model_validate(normalized.model_dump())
    builder.ingest_ruleset(input_ruleset)

    # 1. Eligible BPL woman without LPG
    res_eligible = evaluate_citizen(client, "pm-ujjwala-yojana", {"gender": "female", "age_min": 25, "bpl_status": True, "has_lpg_connection": False})
    assert res_eligible.verdict.value == "eligible"

    # 2. Ineligible woman (already has LPG connection)
    res_ineligible = evaluate_citizen(client, "pm-ujjwala-yojana", {"gender": "female", "age_min": 25, "bpl_status": True, "has_lpg_connection": True})
    assert res_ineligible.verdict.value == "ineligible"


def test_e2e_pipeline_tamil_pudhumai_penn():
    """End-to-End Test for Tamil Scheme: Pudhumai Penn Higher Education Assistance."""
    set_layer_context("layer1-ingestion")
    from app.cleaner import clean_ocr_text

    raw_text = (ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "ta" / "02_pudhumai_penn_ta.txt").read_text(encoding="utf-8")
    cleaned = clean_ocr_text(raw_text)
    assert "புதுமைப் பெண்" in cleaned

    set_layer_context("layer2-semantic-extraction")
    from app.schema import ExtractedRuleSet
    from app.ontology_validation import validate_and_normalize_ruleset

    with open(ROOT / "data" / "rulesets" / "corrected" / "pudhumai-penn-scheme.json", "r", encoding="utf-8") as f:
        ruleset_dict = json.load(f)
    normalized = validate_and_normalize_ruleset(ExtractedRuleSet.model_validate(ruleset_dict))

    set_layer_context("layer3-reasoning-engine")
    from app.graph_client import MockGraphClient
    from app.graph_builder import GraphBuilder
    from app.evaluation_engine import evaluate_citizen
    from app.schema import ExtractedRuleSetInput

    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    input_ruleset = ExtractedRuleSetInput.model_validate(normalized.model_dump())
    builder.ingest_ruleset(input_ruleset)

    # 1. Eligible Tamil girl from govt school
    res_eligible = evaluate_citizen(client, "pudhumai-penn-scheme", {"gender": "female", "education_level": "12th", "school_type": "government", "residence_state": "Tamil Nadu"})
    assert res_eligible.verdict.value == "eligible"

    # 2. Ineligible girl from private school
    res_ineligible = evaluate_citizen(client, "pudhumai-penn-scheme", {"gender": "female", "education_level": "12th", "school_type": "private", "residence_state": "Tamil Nadu"})
    assert res_ineligible.verdict.value == "ineligible"


def test_e2e_pipeline_telugu_ysr_cheyutha():
    """End-to-End Test for Telugu Scheme: Andhra Pradesh YSR Cheyutha."""
    set_layer_context("layer1-ingestion")
    from app.cleaner import clean_ocr_text

    raw_text = (ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "te" / "02_cheyutha_te.txt").read_text(encoding="utf-8")
    cleaned = clean_ocr_text(raw_text)
    assert "చేయూత" in cleaned

    set_layer_context("layer2-semantic-extraction")
    from app.schema import ExtractedRuleSet
    from app.ontology_validation import validate_and_normalize_ruleset

    with open(ROOT / "data" / "rulesets" / "corrected" / "ap-cheyutha-thalliki-vandanam.json", "r", encoding="utf-8") as f:
        ruleset_dict = json.load(f)
    normalized = validate_and_normalize_ruleset(ExtractedRuleSet.model_validate(ruleset_dict))

    set_layer_context("layer3-reasoning-engine")
    from app.graph_client import MockGraphClient
    from app.graph_builder import GraphBuilder
    from app.evaluation_engine import evaluate_citizen
    from app.schema import ExtractedRuleSetInput

    client = MockGraphClient()
    builder = GraphBuilder(client=client)
    input_ruleset = ExtractedRuleSetInput.model_validate(normalized.model_dump())
    builder.ingest_ruleset(input_ruleset)

    # 1. Eligible BC woman in AP aged 50
    res_eligible = evaluate_citizen(client, "ap-cheyutha-thalliki-vandanam", {
        "gender": "female",
        "age_min": 50,
        "age_max": 50,
        "caste_category": "BC",
        "residence_state": "Andhra Pradesh",
        "government_employment_status": False,
        "owns_vehicle": False
    })
    assert res_eligible.verdict.value == "eligible"

    # 2. Ineligible (Govt employee)
    res_ineligible = evaluate_citizen(client, "ap-cheyutha-thalliki-vandanam", {
        "gender": "female",
        "age_min": 50,
        "age_max": 50,
        "caste_category": "BC",
        "residence_state": "Andhra Pradesh",
        "government_employment_status": True,
        "owns_vehicle": False
    })
    assert res_ineligible.verdict.value == "ineligible"


def test_all_39_gold_profiles_eval():
    """Assert all 39 hand-derived gold profiles evaluate to expected verdicts."""
    set_layer_context("layer3-reasoning-engine")
    from app.graph_client import MockGraphClient
    from app.graph_builder import GraphBuilder
    from app.evaluation_engine import evaluate_citizen
    from app.schema import ExtractedRuleSetInput

    client = MockGraphClient()
    builder = GraphBuilder(client=client)

    corrected_dir = ROOT / "data" / "rulesets" / "corrected"
    for rfile in corrected_dir.glob("*.json"):
        with open(rfile, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data.get("version"), str):
            data["version"] = 1
        builder.ingest_ruleset(ExtractedRuleSetInput.model_validate(data))

    with open(ROOT / "evaluation" / "gold_data" / "profiles.json", "r", encoding="utf-8") as f:
        profiles = json.load(f)

    assert len(profiles) == 39
    for p in profiles:
        res = evaluate_citizen(client, p["scheme_id"], p["facts"])
        assert res.verdict.value == p["expected_verdict"], f"Mismatch on {p['id']}: expected {p['expected_verdict']}, got {res.verdict.value}"
