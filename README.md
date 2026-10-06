# Cloud-Native Semantic Eligibility Reasoning Framework (BITE412L)

Multilingual government welfare notifications are converted into explainable eligibility decisions across four layers.

## Pipeline

`Notification (image/PDF)` → **Layer 1** (Tesseract OCR) → **Layer 2** (Groq LLM + Pydantic rules) → **Layer 3** (Neo4j or in-memory graph + citizen evaluation) → **Layer 4** (evidence completion + readiness score)

## What is implemented (verified in repo)

| Layer | Status |
|-------|--------|
| **Layer 1** | Tesseract OCR for images/PDFs, sample OCR test |
| **Layer 2** | Groq extraction, ontology enums, post-parse validation/normalization, unit tests with mocked Groq |
| **Layer 3** | Graph ingest (Scheme/Condition/Document/Benefit/Exclusion), mock + Neo4j client, **citizen evaluation engine**, **version-aware rule evolution** (mock graph + point-in-time queries) |
| **Layer 4** | Evidence completion, readiness scorer; demo cases driven by real Layer 3 output |

## Offline demo (PowerShell, repo root)

See [PROFESSOR_DEMO.md](PROFESSOR_DEMO.md).

```powershell
cd layer3-reasoning-engine
python -m pip install -r requirements.txt
python tests\test_sample_graph.py
python -m pytest tests -q

cd ..\layer4-delivery\layer4-service
python -m pip install -r requirements.txt
python tests\run_sample_cases.py
python -m pytest tests -q
```

Expected Layer 4 pytest result: **8 passed**.

## Not implemented yet

FastAPI services, Docker Compose, Streamlit UI, OCR text cleaning, LaBSE field mapping, end-to-end integration test, evaluation metrics script, production Neo4j incremental evolution Cypher (mock graph supports full amendment test).

## Secrets

Copy each layer's `.env.example` to `.env`. Never commit API keys.
