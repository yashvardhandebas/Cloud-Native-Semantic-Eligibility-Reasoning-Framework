import json
import logging
import re
from typing import Optional, Dict, Any
from groq import Groq
from app.config import settings
from app.ontology import OntologyField, DocumentType, BenefitType, Operator
from app.schema import ExtractedRuleSet

logger = logging.getLogger(__name__)

# Compile ontology lists for prompt injection
VALID_ONTOLOGY_FIELDS = [f.value for f in OntologyField]
VALID_DOCUMENT_TYPES = [d.value for d in DocumentType]
VALID_BENEFIT_TYPES = [b.value for b in BenefitType]
VALID_OPERATORS = [o.value for o in Operator]

SYSTEM_PROMPT = f"""You are an expert NLP extraction engine for the Cloud-Native Semantic Eligibility Reasoning Framework.
Your task is to analyze government welfare notification text and extract structured eligibility clauses, required documents, benefits, and disqualifying exclusions.

You MUST strictly categorize extracted items into the normalized ontology vocabulary provided below. Do NOT invent new enum values.

### Allowed Ontology Vocabulary:
- Condition and Exclusion `field` values MUST be one of:
  {json.dumps(VALID_ONTOLOGY_FIELDS)}

- Operator values MUST be one of:
  {json.dumps(VALID_OPERATORS)}

- Document `document_type` values MUST be one of:
  {json.dumps(VALID_DOCUMENT_TYPES)}

- Benefit `benefit_type` values MUST be one of:
  {json.dumps(VALID_BENEFIT_TYPES)}

### Rules for Extraction:
1. `raw_text`: EVERY clause (condition, document, benefit, exclusion) MUST include the exact or near-exact substring from the source notification in `raw_text` for explainability.
2. `conditions`: Positive requirements the applicant must satisfy (e.g. age, income, caste, domicile).
3. `exclusions`: Negative or disqualifying criteria that disqualify an applicant if met (e.g. paying income tax, holding government job, owning land above limit).
4. `documents`: Required certificates, proofs, or documents needed for verification.
5. `benefits`: Entitlements, cash amounts, subsidies, pensions provided by the scheme.
6. `source_language`: The language of the notification text (en, hi, ta, te).
7. `scheme_name`: The identified title of the government scheme (or null if unknown).

### Output Format:
Return ONLY a valid JSON object matching this exact structure:
{{
  "notification_id": "<string or hash>",
  "scheme_name": "<string or null>",
  "source_language": "en|hi|ta|te",
  "conditions": [
    {{
      "field": "<from ontology>",
      "operator": "lt|lte|gt|gte|eq|ne|in_range|in_list",
      "value": <number, string, or array>,
      "unit": "<optional string, e.g. INR, years, acres or null>",
      "raw_text": "<exact clause text>"
    }}
  ],
  "documents": [
    {{
      "document_type": "<from ontology>",
      "required_for": "<reason or field, e.g. age verification, bank transfer>",
      "raw_text": "<exact clause text>"
    }}
  ],
  "benefits": [
    {{
      "benefit_type": "<from ontology>",
      "amount": <number or null>,
      "frequency": "<e.g. monthly, annual, one-time or null>",
      "raw_text": "<exact clause text>"
    }}
  ],
  "exclusions": [
    {{
      "field": "<from ontology>",
      "operator": "lt|lte|gt|gte|eq|ne|in_range|in_list",
      "value": <number, string, or array>,
      "unit": "<optional string or null>",
      "raw_text": "<exact clause text>"
    }}
  ]
}}
Do NOT wrap output in markdown codeblocks (no ```json). Do NOT add conversational commentary. Return ONLY the JSON object.
"""

FEW_SHOT_EXAMPLES = [
    {
        "role": "user",
        "content": """Extract eligibility rules from this notification:
Language: en
Notification:
PM-KISAN Samman Nidhi Scheme: All landholding farmer families across India having cultivable landholding in their names are eligible to receive income support. Financial benefit of Rs 6000 per year is transferred directly into bank accounts in three equal installments of Rs 2000 every 4 months. Beneficiaries must submit Aadhaar card and Land ownership records (Khasra/Khatauni). Institutional landholders, former and present holders of constitutional posts, and individuals who paid income tax in the last assessment year are strictly ineligible."""
    },
    {
        "role": "assistant",
        "content": json.dumps({
            "notification_id": "pm_kisan_demo",
            "scheme_name": "PM-KISAN Samman Nidhi Scheme",
            "source_language": "en",
            "conditions": [
                {
                    "field": "occupation",
                    "operator": "eq",
                    "value": "farmer",
                    "unit": None,
                    "raw_text": "landholding farmer families having cultivable landholding in their names"
                },
                {
                    "field": "land_ownership",
                    "operator": "gt",
                    "value": 0,
                    "unit": "acres",
                    "raw_text": "having cultivable landholding in their names"
                }
            ],
            "documents": [
                {
                    "document_type": "aadhaar_card",
                    "required_for": "identity verification",
                    "raw_text": "Beneficiaries must submit Aadhaar card"
                },
                {
                    "document_type": "land_record",
                    "required_for": "land ownership verification",
                    "raw_text": "Land ownership records (Khasra/Khatauni)"
                }
            ],
            "benefits": [
                {
                    "benefit_type": "cash_transfer",
                    "amount": 6000,
                    "frequency": "annual",
                    "raw_text": "Financial benefit of Rs 6000 per year is transferred directly into bank accounts in three equal installments of Rs 2000 every 4 months"
                }
            ],
            "exclusions": [
                {
                    "field": "occupation",
                    "operator": "eq",
                    "value": "institutional_landholder",
                    "unit": None,
                    "raw_text": "Institutional landholders"
                },
                {
                    "field": "income_threshold",
                    "operator": "gt",
                    "value": "income_tax_payer",
                    "unit": None,
                    "raw_text": "individuals who paid income tax in the last assessment year are strictly ineligible"
                }
            ]
        }, indent=2)
    },
    {
        "role": "user",
        "content": """Extract eligibility rules from this notification:
Language: en
Notification:
Indira Gandhi National Old Age Pension Scheme (IGNOAPS): Persons aged 60 years and above belonging to households living Below Poverty Line (BPL) as per central government criteria are eligible. Beneficiaries receive a monthly pension of Rs 500. For persons aged 80 years and above, the pension is Rs 1000 per month. Applicants must furnish Age Proof (Birth Certificate or Voter ID) and BPL Ration Card."""
    },
    {
        "role": "assistant",
        "content": json.dumps({
            "notification_id": "ignoaps_demo",
            "scheme_name": "Indira Gandhi National Old Age Pension Scheme",
            "source_language": "en",
            "conditions": [
                {
                    "field": "age_min",
                    "operator": "gte",
                    "value": 60,
                    "unit": "years",
                    "raw_text": "Persons aged 60 years and above"
                },
                {
                    "field": "income_threshold",
                    "operator": "eq",
                    "value": "BPL",
                    "unit": None,
                    "raw_text": "belonging to households living Below Poverty Line (BPL)"
                }
            ],
            "documents": [
                {
                    "document_type": "age_proof",
                    "required_for": "age verification",
                    "raw_text": "Applicants must furnish Age Proof (Birth Certificate or Voter ID)"
                },
                {
                    "document_type": "ration_card",
                    "required_for": "BPL status verification",
                    "raw_text": "BPL Ration Card"
                }
            ],
            "benefits": [
                {
                    "benefit_type": "pension",
                    "amount": 500,
                    "frequency": "monthly",
                    "raw_text": "Beneficiaries receive a monthly pension of Rs 500"
                },
                {
                    "benefit_type": "pension",
                    "amount": 1000,
                    "frequency": "monthly",
                    "raw_text": "For persons aged 80 years and above, the pension is Rs 1000 per month"
                }
            ],
            "exclusions": []
        }, indent=2)
    }
]


def clean_json_string(text: str) -> str:
    """Strip markdown backticks, prefixes, or trailing whitespace from LLM output."""
    text = text.strip()
    # Remove markdown ```json ... ``` wrapper if present
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text


class RuleExtractor:
    """Extracts structured eligibility rule sets from cleaned welfare notifications using Groq LLM."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        client: Optional[Groq] = None
    ):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        if client:
            self.client = client
        elif self.api_key:
            self.client = Groq(api_key=self.api_key)
        else:
            self.client = None

    def _build_messages(self, text: str, language: str) -> list:
        user_message = (
            f"Extract eligibility rules from this notification:\n"
            f"Language: {language}\n"
            f"Notification:\n{text.strip()}"
        )
        return [
            {"role": "system", "content": SYSTEM_PROMPT},
            *FEW_SHOT_EXAMPLES,
            {"role": "user", "content": user_message}
        ]

    def extract(
        self,
        text: str,
        language: str = "en",
        notification_id: Optional[str] = None
    ) -> ExtractedRuleSet:
        """
        Extract structured rules from notification text.
        Retries once with corrective feedback if initial response fails parsing/validation.
        """
        if not text or not text.strip():
            raise ValueError("Input notification text cannot be empty.")

        if not self.client:
            raise RuntimeError(
                "Groq client is not initialized. Please configure GROQ_API_KEY in .env or pass it to RuleExtractor."
            )

        notif_id = notification_id or ExtractedRuleSet.generate_hash_id(text)
        messages = self._build_messages(text, language)

        # First attempt
        raw_response = None
        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            raw_response = chat_completion.choices[0].message.content
            parsed_json = self._parse_and_validate(raw_response, notif_id, language)
            return parsed_json
        except Exception as first_error:
            logger.warning("First extraction attempt failed: %s. Retrying with corrective prompt...", first_error)

            # Retry once with strict corrective instruction
            retry_messages = list(messages)
            if raw_response:
                retry_messages.append({"role": "assistant", "content": raw_response})
            retry_messages.append({
                "role": "user",
                "content": (
                    f"Your previous response caused this validation/JSON error: {str(first_error)}. "
                    f"Fix this immediately. Return ONLY a valid JSON object strictly adhering to the schema and allowed ontology fields. "
                    f"Ensure notification_id is '{notif_id}' and source_language is '{language}'."
                )
            })

            try:
                retry_completion = self.client.chat.completions.create(
                    messages=retry_messages,
                    model=self.model,
                    temperature=0.0,
                    response_format={"type": "json_object"}
                )
                retry_content = retry_completion.choices[0].message.content
                return self._parse_and_validate(retry_content, notif_id, language)
            except Exception as retry_error:
                logger.error("Extraction failed after retry: %s", retry_error)
                raise RuntimeError(f"Extraction failed after retry: {retry_error}") from retry_error

    def _parse_and_validate(self, response_text: str, notif_id: str, language: str) -> ExtractedRuleSet:
        cleaned = clean_json_string(response_text)
        try:
            data: Dict[str, Any] = json.loads(cleaned)
        except json.JSONDecodeError as jde:
            raise ValueError(f"LLM returned invalid JSON: {jde}") from jde

        # Ensure essential top-level metadata exists
        if not data.get("notification_id"):
            data["notification_id"] = notif_id
        if not data.get("source_language"):
            data["source_language"] = language

        # Validate against Pydantic model
        return ExtractedRuleSet.model_validate(data)
