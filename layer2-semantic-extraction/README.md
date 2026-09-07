# Layer 2: Semantic Rule Extraction Service

Part of the **Cloud-Native Semantic Eligibility Reasoning Framework** (VIT Cloud Computing, BITE412L).

Layer 2 ingests cleaned multilingual government welfare notifications (English, Hindi, Tamil, Telugu) produced by Layer 1, and utilizes high-performance Large Language Models (via Groq API) to extract structured, machine-reasonable eligibility clauses normalized into a shared ontology. 

The extracted rule sets are formatted as well-typed JSON for direct consumption by Layer 3 (Graph Database & Semantic Reasoning Engine).

---

## Architecture & Features

- **Pydantic Clause Schemas**:
  - `Condition`: Minimum/maximum age, income thresholds, caste, domicile, land holding requirements.
  - `Document`: Required verification proofs (Aadhaar, income certificate, land records, etc.).
  - `Benefit`: Monetary transfers, pensions, subsidies, frequency, and amounts.
  - `Exclusion`: Disqualifying conditions (e.g., income taxpayers, institutional landholders, government employees).
- **Normalized Ontology**: Shared enums (`OntologyField`, `DocumentType`, `BenefitType`, `Operator`) ensure cross-lingual consistency across notifications.
- **Explainability & Traceability**: Every extracted clause preserves its exact `raw_text` substring from the original government notification.
- **Groq API Acceleration**: Uses high-throughput inference with schema enforcement (`response_format={"type": "json_object"}`) and automated 1-step corrective retry on validation failure.

---

## Directory Structure

```
layer2-semantic-extraction/
├── .env.example              # Environment variables template
├── requirements.txt          # Python dependencies
├── run_sample_extraction.py  # Standalone CLI script to test live extraction
├── sample_extracted_output.json # Sample validated JSON output
├── app/
│   ├── __init__.py
│   ├── config.py             # Settings loading from .env via pydantic-settings
│   ├── ontology.py           # Fixed vocabulary Enums for normalization
│   ├── schema.py             # Pydantic models for clause schemas & ExtractedRuleSet
│   ├── extractor.py          # Groq API client with few-shot prompt & JSON retry logic
│   ├── normalizer.py         # Value normalization onto ontology fields
│   └── main.py               # FastAPI application with /extract and /health
└── tests/
    ├── __init__.py
    ├── test_extractor.py     # Unit tests with mocked Groq completions
    └── sample_notifications/ # Real notification samples
        ├── en/               # English notifications (PM-KISAN, Scholarship, Widow Pension)
        ├── hi/               # Hindi notifications
        ├── ta/               # Tamil notifications
        └── te/               # Telugu notifications
```

---

## Quick Start

### 1. Installation

Create a virtual environment (optional) and install dependencies:
```bash
python -m pip install -r requirements.txt
```

### 2. Configure Environment

1. Get an API key from [Groq Console](https://console.groq.com).
2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
3. Set your `GROQ_API_KEY` and preferred model:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
APP_ENV=development
LOG_LEVEL=INFO
```

### 3. Run Sample Extraction

Run the sample extractor on the included PM-KISAN notification:
```bash
python run_sample_extraction.py
```
Or specify a custom notification file:
```bash
python run_sample_extraction.py tests/sample_notifications/en/02_post_matric_scholarship.txt
```

### 4. Run Unit Tests

Execute test suite with pytest (runs with mocked responses, no API usage):
```bash
pytest tests/test_extractor.py -v
```

---

## Output Contract (Layer 3 Interface)

```json
{
  "notification_id": "pm_kisan_2024_001",
  "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
  "source_language": "en",
  "conditions": [
    {
      "field": "occupation",
      "operator": "eq",
      "value": "farmer",
      "unit": null,
      "raw_text": "All landholding farmer families who hold cultivable land in their names as per state land records are eligible"
    }
  ],
  "documents": [
    {
      "document_type": "aadhaar_card",
      "required_for": "identity verification",
      "raw_text": "Valid Aadhaar Card"
    }
  ],
  "benefits": [
    {
      "benefit_type": "cash_transfer",
      "amount": 6000,
      "frequency": "annual",
      "raw_text": "The beneficiary family will receive an income support benefit of Rs. 6000 per annum"
    }
  ],
  "exclusions": [
    {
      "field": "income_threshold",
      "operator": "eq",
      "value": "taxpayer",
      "unit": null,
      "raw_text": "All persons who paid Income Tax in the last assessment year."
    }
  ]
}
```
