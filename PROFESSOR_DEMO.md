# Professor Demonstration Script

## 1. Explain the problem

Government welfare notifications are often scanned documents or multilingual text. The system converts them into structured, explainable eligibility rules and helps identify what a citizen must provide or change.

## 2. Show the architecture

```text
OCR input -> semantic extraction -> rule graph -> citizen guidance
```

Use these folders while explaining the layers:

- `layer1-ingestion`: reads scanned images and PDFs with Tesseract.
- `layer2-semantic-extraction`: uses Groq to extract normalized rules.
- `layer3-reasoning-engine`: stores rules as a Neo4j-compatible graph.
- `layer4-delivery/layer4-service`: analyzes evidence and readiness.

## 3. Run the reliable offline demo

From PowerShell at the repository root:

```powershell
cd layer3-reasoning-engine
python -m pip install -r requirements.txt
python tests\test_sample_graph.py

cd ..\layer4-delivery\layer4-service
python -m pip install -r requirements.txt
python tests\run_sample_cases.py
python -m pytest tests -q
```

The Layer 3 script loads `tests/sample_data/sample_ruleset.json`, which describes the Post-Matric SC Scholarship Scheme. It creates Scheme, Condition, Document, Benefit, and Exclusion nodes. It then loads the same ruleset again to demonstrate idempotency: duplicate nodes are not created.

The Layer 4 script demonstrates three cases:

1. Eligible: all three conditions pass and the readiness score is `100/100`.
2. Needs more information: income is missing, confidence is `0.67`, and an income certificate is recommended.
3. Ineligible but close: income is `Rs. 320,000` against a `Rs. 250,000` ceiling, producing actionable guidance and a `90.7/100` readiness score.

The expected final test result is:

```text
8 passed
```

## 4. Optional OCR demonstration

Install Layer 1 dependencies and ensure the Tesseract executable is installed:

```powershell
cd ..\..\layer1-ingestion
python -m pip install -r requirements.txt
python tests\test_sample_ocr.py
```

Point out that the output preserves raw OCR text, page count, confidence, detected language, and a deterministic notification ID.

## 5. Optional live AI demonstration

Layer 2 requires a Groq API key:

```powershell
cd ..\layer2-semantic-extraction
python -m pip install -r requirements.txt
copy .env.example .env
python run_sample_extraction.py
```

The extractor returns a validated JSON ruleset containing conditions, documents, benefits, exclusions, source language, and original clause text. Do not present the API key on screen.

## 6. Honest limitation to mention

The current repository demonstrates the individual implementation layers and their data contracts. The final production wiring is not yet present: there is no frontend/API delivery application, and the Layer 3 citizen-fact comparison algorithm still needs to be connected before the system can accept a citizen profile end to end.