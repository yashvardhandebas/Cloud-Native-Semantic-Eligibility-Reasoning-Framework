import json
from unittest.mock import MagicMock

from app.extractor import RuleExtractor
from app.ontology import OntologyField, Operator
from app.ontology_validation import validate_and_normalize_ruleset
from app.schema import ExtractedRuleSet, Exclusion


def test_remap_institutional_landholder_from_occupation():
    ruleset = ExtractedRuleSet(
        notification_id="pm_test",
        scheme_name="PM-KISAN",
        source_language="en",
        exclusions=[
            Exclusion(
                field=OntologyField.OCCUPATION,
                operator=Operator.EQ,
                value="institutional_landholder",
                raw_text="Institutional landholders are not eligible.",
            )
        ],
    )
    normalized = validate_and_normalize_ruleset(ruleset)
    exc = normalized.exclusions[0]
    assert exc.field == OntologyField.INSTITUTIONAL_LANDHOLDER
    assert exc.value is True


def test_remap_income_tax_misassignment():
    ruleset = ExtractedRuleSet(
        notification_id="pm_test",
        scheme_name="PM-KISAN",
        source_language="en",
        exclusions=[
            Exclusion(
                field=OntologyField.INCOME_THRESHOLD,
                operator=Operator.GT,
                value="income_tax_payer",
                raw_text="individuals who paid income tax in the last assessment year are ineligible",
            )
        ],
    )
    normalized = validate_and_normalize_ruleset(ruleset)
    exc = normalized.exclusions[0]
    assert exc.field == OntologyField.INCOME_TAX_PAYER_STATUS
    assert exc.operator == Operator.EQ
    assert exc.value is True


def test_extractor_applies_normalization_on_mocked_groq_response():
    mock_client = MagicMock()
    bad_rules = {
        "notification_id": "pm_kisan_bad_map",
        "scheme_name": "PM-KISAN",
        "source_language": "en",
        "conditions": [],
        "documents": [],
        "benefits": [],
        "exclusions": [
            {
                "field": "occupation",
                "operator": "eq",
                "value": "institutional_landholder",
                "raw_text": "Institutional landholders",
            },
            {
                "field": "income_threshold",
                "operator": "gt",
                "value": "income_tax_payer",
                "raw_text": "paid income tax in the last assessment year",
            },
        ],
    }
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(bad_rules)
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_response

    extractor = RuleExtractor(client=mock_client)
    result = extractor.extract("Institutional landholders and income tax payers excluded.")

    assert result.exclusions[0].field == OntologyField.INSTITUTIONAL_LANDHOLDER
    assert result.exclusions[1].field == OntologyField.INCOME_TAX_PAYER_STATUS
