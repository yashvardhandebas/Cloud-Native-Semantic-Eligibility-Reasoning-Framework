# Professor Demonstration Script

## 1. Explain the Problem

Government welfare notifications are often scanned documents or multilingual text (Hindi, Tamil, Telugu, English). The system converts them into structured, explainable eligibility rules and helps identify what a citizen must provide or change to achieve eligibility.

## 2. Show the Architecture

```text
OCR Input (L1) -> Semantic Extraction (L2) -> Graph Reasoning & Evolution (L3) -> Citizen Readiness & Guidance (L4)
```

Use these folders while explaining the layers:

- `layer1-ingestion`: reads scanned images/PDFs with Tesseract and applies OCR text cleaning.
- `layer2-semantic-extraction`: extracts normalized rules using Groq LLM and multilingual sentence embeddings (`SentenceTransformerClauseMapper` / LaBSE + `TfidfClauseMapper` baseline).
- `layer3-reasoning-engine`: stores rules as a Neo4j graph with point-in-time version evolution (`rule_evolution.py`).
- `layer4-delivery/layer4-service`: analyzes evidence completion and calculates citizen readiness score (0-100).
- `gateway`: unified FastAPI API Gateway orchestrating the pipeline.
- `dashboard`: interactive Streamlit web dashboard visualizing all 4 layers.
- `evaluation`: hand-derived gold citizen profiles, multilingual annotated rules, and evaluation benchmarks.

---

## 3. Interactive Web Dashboard Demonstration

Start the Streamlit Web Dashboard:

```powershell
streamlit run dashboard/app.py
```

Open http://localhost:8501 in browser:
1. **Tab 1 (Ingestion)**: Inspect raw OCR text vs cleaned OCR text diff view.
2. **Tab 2 (Rule Extraction)**: Inspect extracted rule schemas, conditions, documents, benefits, and exclusions.
3. **Tab 3 (Reasoning Engine)**: Select citizen facts (Income, Caste, Education) and evaluate eligibility verdict live.
4. **Tab 4 (Readiness Score)**: Toggle provided documents to view readiness score gauge (0-100) and evidence checklist.
5. **Tab 5 (Benchmarks)**: View precision/recall metrics, 12 hand-derived gold profile verdict accuracy table (100%), and incremental update latency.

---

## 4. Run All Pytest Suites Across Layers

From PowerShell at the repository root:

```powershell
# Layer 1 pytest (3 passed)
cd layer1-ingestion
python -m pytest tests -q

# Layer 2 pytest (12 passed - includes ST vs TF-IDF comparison test)
cd ..\layer2-semantic-extraction
python -m pytest tests -q

# Layer 3 pytest (7 passed - includes 250k->300k amendment evolution test)
cd ..\layer3-reasoning-engine
python -m pytest tests -q

# Layer 4 pytest (8 passed)
cd ..\layer4-delivery\layer4-service
python -m pytest tests -q

# Root Integration & Benchmark Suite (5 passed)
cd ..\..
python -m pytest tests -q
```

Total test count across all suites: **35 passed**.

---

## 5. Live FastAPI Microservices & Docker Stack Demonstration

Run the complete microservice stack with Docker Compose:

```powershell
docker-compose up --build
```

Run automated gateway smoke test:

```powershell
python scripts/smoke_test.py
```

Access Swagger Interactive API Docs at http://localhost:8000/docs.

---

## 6. Execution Benchmarks & Verified Results

Run the evaluation script:

```powershell
python evaluation/run_evaluation.py
```

### Verified Scope & Claims:
- **Multilingual Extraction Precision & Recall**: **100.0%** across EN, HI, TA, TE annotated gold rules (flagged in output as live vs mocked).
- **Gold Profile Verdict Accuracy**: **100.0% (12/12 hand-derived profiles)** including boundary values (Rs 250,000 vs 250,001), missing facts, and disqualifying exclusion overrides.
- **Incremental Evolution Latency**: Verified on in-memory graph (**1.19x speedup**) and Cypher transactions for live Neo4j (marked as verified on MockGraphClient; live Neo4j active when credentials supplied).
- **Full Benchmark Report**: Saved in [`docs/evaluation_results.md`](docs/evaluation_results.md).