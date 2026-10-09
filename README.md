# Cloud-Native Semantic Eligibility Reasoning Framework (BITE412L)

Multilingual government welfare notifications are converted into explainable eligibility decisions across four layers.

## Pipeline Architecture

`Notification (image/PDF)` → **Layer 1** (Tesseract OCR + Noise Cleaning) → **Layer 2** (Groq LLM + SentenceTransformer Multilingual Clause Mapping + Pydantic rules) → **Layer 3** (Neo4j / in-memory graph + citizen evaluation & point-in-time evolution) → **Layer 4** (evidence completion + readiness score)

---

## Fully Implemented & Verified Scope

| Component / Layer | Status | Verified Capabilities & Modules |
|-------------------|--------|---------------------------------|
| **Layer 1: Ingestion** | Complete | Tesseract OCR engine, PDF rendering, regex & noise OCR cleaner (`cleaner.py`), FastAPI service (`/api/v1/ocr/extract`). |
| **Layer 2: Extraction** | Complete | Groq LLM extraction, Pydantic schemas, ontology validation (`ontology_validation.py`), multilingual sentence embeddings (`SentenceTransformerClauseMapper` via LaBSE / MiniLM + `TfidfClauseMapper` baseline in `clause_mapper.py`), FastAPI service (`/api/v1/extraction/extract`). |
| **Layer 3: Reasoning** | Complete | Graph ingestion (Scheme, Condition, Document, Benefit, Exclusion), in-memory graph (`MockGraphClient`, verified) + live Neo4j AuraDB client (`Neo4jAuraClient`, verified when credentials present), citizen evaluation engine with missing fact handling, version-aware Cypher rule evolution & point-in-time historical queries (`as_of`), FastAPI service (`/api/v1/reasoning/evaluate`). |
| **Layer 4: Delivery** | Complete | Citizen readiness scorer (0-100), evidence completion plan & actionable guidance engine (`readiness_scorer.py`, `evidence_engine.py`), FastAPI service (`/api/v1/delivery/readiness`). |
| **API Gateway** | Complete | Unified FastAPI Gateway (`gateway/main.py`) orchestrating full pipeline execution (`/api/v1/pipeline/process-text`). |
| **Streamlit UI** | Complete | Interactive Web Dashboard (`dashboard/app.py`) for visual document upload, rule extraction, citizen graph evaluation, readiness scoring, and evaluation benchmarks. |
| **Docker Stack** | Complete | Microservice `Dockerfile` for each layer, health checks for all services, root `docker-compose.yml` stack with Neo4j container, and automated smoke test (`scripts/smoke_test.py`). |
| **Evaluation Suite** | Complete | Hand-derived gold rules & 12 gold citizen profile verdict benchmarks (100% accuracy), confusion matrix table, multilingual extraction precision/recall (100%), and incremental evolution timing comparison. Full report written to `docs/evaluation_results.md`. |

---

## Verification & Test Execution

From PowerShell at the repository root:

```powershell
# 1. Layer 1 Ingestion & OCR Cleaner Tests (3 passed)
cd layer1-ingestion
python -m pytest tests -q

# 2. Layer 2 Semantic Extraction & SentenceTransformer Multilingual Tests (12 passed)
cd ..\layer2-semantic-extraction
python -m pytest tests -q

# 3. Layer 3 Reasoning Engine & Amendment Evolution Tests (7 passed)
cd ..\layer3-reasoning-engine
python -m pytest tests -q

# 4. Layer 4 Delivery & Readiness Scorer Tests (8 passed)
cd ..\layer4-delivery\layer4-service
python -m pytest tests -q

# 5. Full End-to-End Integration & Benchmark Evaluation Suite (5 passed)
cd ..\..
python -m pytest tests -q

# 6. Run Benchmark Evaluation & Smoke Test
python evaluation/run_evaluation.py
python scripts/smoke_test.py
```

Total test count across all suites: **35 passed**.

---

## Benchmark & Evaluation Results Summary

See full metrics and confusion table in [`docs/evaluation_results.md`](docs/evaluation_results.md).

- **Multilingual Extraction Precision & Recall**: **100.0%** across EN, HI, TA, TE.
- **Hand-Derived Gold Profile Verdict Accuracy**: **100.0% (12 / 12 Profiles)** across boundary values, missing facts, and exclusion overrides.
- **Incremental Rule Evolution Speedup**: Verified on in-memory graph (**1.19x speedup**) and Cypher transaction support for live Neo4j.

---

## Running Microservices & Web Dashboard

### 1. Run Streamlit Dashboard locally:
```powershell
streamlit run dashboard/app.py
```

### 2. Run Full Stack with Docker Compose:
```powershell
docker-compose up --build
```
Access points:
- **Streamlit Dashboard**: http://localhost:8501
- **API Gateway**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474
