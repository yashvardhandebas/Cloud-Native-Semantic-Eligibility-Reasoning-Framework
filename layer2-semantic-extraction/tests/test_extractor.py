import json
from unittest.mock import MagicMock
import pytest
from app.extractor import RuleExtractor, clean_json_string
from app.ontology import OntologyField, DocumentType, BenefitType, Operator
from app.schema import ExtractedRuleSet, Condition, Document, Benefit, Exclusion


def test_clean_json_string():
    raw_with_markdown = "```json\n{\"key\": \"value\"}\n```"
    assert clean_json_string(raw_with_markdown) == '{"key": "value"}'

    plain = '{"key": "value"}'
    assert clean_json_string(plain) == '{"key": "value"}'


def test_extractor_empty_input():
    extractor = RuleExtractor(api_key="test_key")
    with pytest.raises(ValueError, match="Input notification text cannot be empty"):
        extractor.extract("")


def test_extractor_successful_mocked_call():
    mock_client = MagicMock()
    sample_rule_set = {
        "notification_id": "test_notif_123",
        "scheme_name": "Test Welfare Scheme",
        "source_language": "en",
        "conditions": [
            {
                "field": "age_min",
                "operator": "gte",
                "value": 18,
                "unit": "years",
                "raw_text": "Applicant must be at least 18 years of age"
            }
        ],
        "documents": [
            {
                "document_type": "aadhaar_card",
                "required_for": "identity proof",
                "raw_text": "Mandatory submission of Aadhaar card"
            }
        ],
        "benefits": [
            {
                "benefit_type": "cash_transfer",
                "amount": 2000,
                "frequency": "monthly",
                "raw_text": "Monthly allowance of Rs. 2000"
            }
        ],
        "exclusions": [
            {
                "field": "income_threshold",
                "operator": "gt",
                "value": 200000,
                "unit": "INR",
                "raw_text": "Families with income above 2 Lakhs are excluded"
            }
        ]
    }

    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(sample_rule_set)
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]
    mock_client.chat.completions.create.return_value = mock_response

    extractor = RuleExtractor(client=mock_client)
    result = extractor.extract("Applicant must be at least 18 years of age. Aadhaar required. Rs 2000 monthly.")

    assert isinstance(result, ExtractedRuleSet)
    assert result.scheme_name == "Test Welfare Scheme"
    assert len(result.conditions) == 1
    assert result.conditions[0].field == OntologyField.AGE_MIN
    assert result.conditions[0].operator == Operator.GTE
    assert result.conditions[0].raw_text == "Applicant must be at least 18 years of age"
    assert len(result.documents) == 1
    assert result.documents[0].document_type == DocumentType.AADHAAR_CARD
    assert len(result.benefits) == 1
    assert result.benefits[0].benefit_type == BenefitType.CASH_TRANSFER
    assert len(result.exclusions) == 1
    assert result.exclusions[0].field == OntologyField.INCOME_THRESHOLD


def test_extractor_retry_on_invalid_initial_json():
    mock_client = MagicMock()

    # First response is invalid JSON
    bad_choice = MagicMock()
    bad_choice.message.content = "Here is your JSON: { invalid json"
    bad_response = MagicMock()
    bad_response.choices = [bad_choice]

    # Second response (after retry) is valid
    good_rule_set = {
        "notification_id": "retry_notif_001",
        "scheme_name": "Recovered Scheme",
        "source_language": "en",
        "conditions": [],
        "documents": [],
        "benefits": [],
        "exclusions": []
    }
    good_choice = MagicMock()
    good_choice.message.content = json.dumps(good_rule_set)
    good_response = MagicMock()
    good_response.choices = [good_choice]

    mock_client.chat.completions.create.side_effect = [bad_response, good_response]

    extractor = RuleExtractor(client=mock_client)
    result = extractor.extract("Valid notification text but initial LLM stutter.")

    assert result.scheme_name == "Recovered Scheme"
    assert mock_client.chat.completions.create.call_count == 2
