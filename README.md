# Cloud-Native Semantic Eligibility Reasoning Framework

This project is a four-layer prototype for converting government welfare notifications into explainable eligibility decisions.

## Professor Demo

The fastest offline demonstration is Layer 3 followed by Layer 4:

```powershell
cd layer3-reasoning-engine
python -m pip install -r requirements.txt
python tests\test_sample_graph.py

cd ..\layer4-delivery\layer4-service
python -m pip install -r requirements.txt
python tests\run_sample_cases.py
python -m pytest tests -q
```

Layer 3 ingests the sample Post-Matric SC Scholarship ruleset into an in-memory graph and checks idempotent re-ingestion. Layer 4 consumes representative Layer 3 evaluation results and demonstrates:

- a fully eligible citizen with 100% evidence confidence;
- a citizen whose result is `needs_more_info`, including the missing income certificate;
- an ineligible citizen who is close to qualifying, including a readiness score and actionable income threshold.

## Full Architecture

```text
Notification image or PDF
	-> Layer 1: multilingual Tesseract OCR
	-> Layer 2: Groq semantic rule extraction
	-> Layer 3: Neo4j or in-memory graph ingestion
	-> Layer 4: evidence completion and readiness scoring
```

## Layer 1 Demo

Install its dependencies and run the included OCR sample:

```powershell
cd layer1-ingestion
python -m pip install -r requirements.txt
python tests\test_sample_ocr.py
```

This requires the Python `pytesseract` package and the Tesseract OCR executable. The sample image is at `tests\sample_notifications\en\sample_notification_en.png`.

## Layer 2 Demo

Layer 2 uses a Groq API key for live extraction:

```powershell
cd layer2-semantic-extraction
python -m pip install -r requirements.txt
copy .env.example .env
python run_sample_extraction.py
```

Set `GROQ_API_KEY` in `.env` before running the live extraction. Unit tests use mocked Groq responses and do not consume API credits:

```powershell
python -m pytest tests -q
```

## What Is Implemented

- Layer 1 image/PDF OCR contracts and multilingual Tesseract extraction
- Layer 2 normalized condition, document, benefit, and exclusion schemas
- Groq extraction with JSON validation and one corrective retry
- Layer 3 Neo4j AuraDB client and offline mock graph client
- Idempotent graph ingestion with versioned clause nodes and relationships
- Layer 4 evidence completion, missing-document guidance, and readiness scoring

## Current Scope

The repository is a modular prototype rather than a deployed end-to-end application. A FastAPI/UI delivery layer and the Layer 3 citizen-fact evaluation algorithm still need to be connected. Layer 4 currently consumes prepared `EligibilityResult` objects from Layer 3 and exposes tested Python functions.