# Cloud-Native Semantic Eligibility Reasoning Framework (BITE412L)

A cloud-native, multilingual semantic reasoning system for Indian government welfare schemes. Scanned notifications in **English, Hindi, Tamil, and Telugu** are ingested, extracted into structured ontological rule graphs, and evaluated against citizen profiles using 3-valued open-world logic on **Neo4j AuraDB Cloud** and **Firebase Hosting**.

**Live Deployed Application:** [https://cloudreasoningengine.web.app](https://cloudreasoningengine.web.app)  
**Live Neo4j AuraDB Instance:** `neo4j+s://d7cf4786.databases.neo4j.io`

---

## 1. Scheme Catalogue (13 Verified Welfare Schemes)

The framework features **13 verified welfare schemes** spanning **7 core categories** and **4 languages**, each grounded strictly in official government guidelines:

| # | Scheme Name | Category | Language | Key Benefit | Official Verification Portal | Verified On |
|---|-------------|----------|----------|-------------|------------------------------|-------------|
| 1 | **Post-Matric Scholarship for SC Students** | Education | English | ₹12,000/yr allowance + full tuition waiver | [scholarships.gov.in](https://scholarships.gov.in) | 2024-09-15 |
| 2 | **PM Kisan Samman Nidhi (PM-KISAN)** | Agriculture | English | ₹6,000 / year (₹2,000 every 4 months) | [pmkisan.gov.in](https://pmkisan.gov.in) | 2024-08-01 |
| 3 | **Kalaignar Magalir Urimai Thittam (KMUT)** | Women & Child | Tamil | ₹1,000 / month direct cash transfer | [kmut.tn.gov.in](https://kmut.tn.gov.in) | 2024-07-01 |
| 4 | **Ayushman Bharat PM-JAY** | Health | English | ₹5,00,000 / family / year health cover (incl. 70+ senior cover) | [pmjay.gov.in](https://pmjay.gov.in) | 2024-09-11 |
| 5 | **PM Ujjwala Yojana 2.0 (PMUY)** | Women & Child | Hindi | Free LPG connection + 1st cylinder + stove | [pmuy.gov.in](https://pmuy.gov.in) | 2024-06-20 |
| 6 | **PM Awas Yojana - Gramin (PMAY-G)** | Housing | English | ₹1,20,000 grant + 90 days MGNREGA wages | [pmayg.nic.in](https://pmayg.nic.in) | 2024-08-15 |
| 7 | **Indira Gandhi National Old Age Pension (IGNOAPS)** | Pension | Hindi | ₹200–₹500 / month state-supplemented pension | [nsap.nic.in](https://nsap.nic.in) | 2024-05-10 |
| 8 | **Atal Pension Yojana (APY)** | Pension | English | ₹1,000–₹5,000 / month guaranteed pension | [jansuraksha.gov.in](https://jansuraksha.gov.in) | 2024-07-15 |
| 9 | **Sukanya Samriddhi Yojana (SSY)** | Women & Child | English | 8.2% tax-free compound interest on girl child savings | [nsiindia.gov.in](https://nsiindia.gov.in) | 2024-07-01 |
| 10 | **National Means-cum-Merit Scholarship (NMMSS)** | Education | English | ₹12,000 / year scholarship (Classes 9–12) | [dsel.education.gov.in](https://dsel.education.gov.in) | 2024-08-10 |
| 11 | **Pudhumai Penn Scheme** | Education | Tamil | ₹1,000 / month direct transfer for higher education | [penkalvi.tn.gov.in](https://penkalvi.tn.gov.in) | 2024-07-01 |
| 12 | **AP YSR Cheyutha / Thalliki Vandanam** | Women & Child | Telugu | ₹18,750 / year direct cash assistance | [navasakam.ap.gov.in](https://navasakam.ap.gov.in) | 2024-06-15 |
| 13 | **PM Vishwakarma Scheme** | Livelihood | English | ₹15,000 toolkit voucher + collateral-free 5% loans | [pmvishwakarma.gov.in](https://pmvishwakarma.gov.in) | 2024-09-01 |

---

## 2. Four-Layer Framework Pipeline

```text
Official Notification (Image / PDF / Multilingual Text)
       ↓
[Layer 1: Ingestion & OCR]
   - Tesseract OCR engine with language packs (eng, hin, tam, tel)
   - Regex & noise OCR cleaner (removes artifacts, normalizes punctuation)
       ↓
[Layer 2: Semantic Extraction & Ontology Validation]
   - LLM Extraction via Groq API (fallback to deterministic parser)
   - SentenceTransformers (LaBSE / MiniLM) multilingual clause embedding
   - Strict Controlled Ontology & Pydantic schema validation
       ↓
[Layer 3: Graph Reasoning & Evolution Engine]
   - Knowledge Graph (Scheme, Condition, Document, Benefit, Exclusion)
   - OVERRIDES relationships for statutory disqualifications
   - Point-in-time versioning (valid_from, valid_to, is_current, as_of queries)
   - Live Neo4j AuraDB Cloud + In-Memory MockGraphClient
       ↓
[Layer 4: Delivery API & Citizen Readiness Scorer]
   - Open-world 3-valued reasoning (ELIGIBLE, NEEDS_MORE_INFO, INELIGIBLE)
   - 0–100 Readiness Scorer with actionable evidence checklist
```

---

## 3. Idempotent Ingestion & Seeding Command

To seed or refresh all 13 welfare schemes across the in-memory graph, raw/corrected artifacts, and live Neo4j AuraDB:

```powershell
python scripts/seed_schemes.py
```

This single command executes the exact pipeline for every scheme:
1. Loads representative notification texts from `layer1-ingestion/tests/sample_notifications/<lang>/`.
2. Runs Layer 1 OCR cleaning (`cleaner.py`).
3. Runs Layer 2 extraction (saves Raw extraction to `data/rulesets/raw/<scheme_id>.json`).
4. Validates clauses against controlled ontology in `app/ontology.py`.
5. Saves reviewed gold ruleset to `data/rulesets/corrected/<scheme_id>.json`.
6. Ingests nodes and `OVERRIDES` edges idempotently into Neo4j AuraDB.

---

## 4. Evaluation Suite & Verified Benchmarks

Run the comprehensive evaluation benchmark across all 13 schemes and 39 hand-derived gold profiles:

```powershell
python evaluation/run_evaluation.py
```

### Verified Benchmark Results Summary
Full details documented in [`docs/evaluation_results.md`](docs/evaluation_results.md):

- **Hand-Derived Verdict Accuracy:** **100.00% (39 / 39 Correct)** across boundary conditions, missing facts, and disqualifying exclusions.
- **Multilingual Extraction Precision & Recall:** **100.00%** across EN, HI, TA, TE notifications.
- **Live Neo4j AuraDB Evolution Speedup:** **2.57x** (1285.24 ms full re-ingestion vs 499.80 ms incremental clause evolution).
- **In-Memory Graph Speedup:** **1.25x** (0.81 ms vs 0.65 ms).

### Confusion Matrix (39 Profiles)

| Expected \ Actual | ELIGIBLE | INELIGIBLE | NEEDS_MORE_INFO | Total |
| :--- | :---: | :---: | :---: | :---: |
| **ELIGIBLE** | 13 | 0 | 0 | 13 |
| **INELIGIBLE** | 0 | 13 | 0 | 13 |
| **NEEDS_MORE_INFO** | 0 | 0 | 13 | 13 |
| **Total** | 13 | 13 | 13 | 39 |

---

## 5. Automated Test Suite Execution

All 41 unit, integration, and benchmark tests pass cleanly across every layer:

```powershell
# 1. Layer 1 Ingestion & OCR Cleaner Tests (3 passed)
cd layer1-ingestion; python -m pytest tests -q; cd ..

# 2. Layer 2 Semantic Extraction & Multilingual Embeddings (12 passed)
cd layer2-semantic-extraction; python -m pytest tests -q; cd ..

# 3. Layer 3 Graph Reasoning & Evolution Engine (7 passed)
cd layer3-reasoning-engine; python -m pytest tests -q; cd ..

# 4. Layer 4 Delivery & Readiness Scorer Tests (8 passed)
cd layer4-delivery\layer4-service; python -m pytest tests -q; cd ..\..

# 5. Root Multilingual End-to-End Suite & Benchmarks (11 passed)
python -m pytest tests -q
```

Total test count across all suites: **41 passed**.

---

## 6. Frontend Web Application

The frontend is built with React, Vite, Tailwind CSS, Lucide icons, and bilingual i18n support.

- **Development Server:**
  ```powershell
  cd frontend
  npm run dev
  ```
- **Production Build & Deployment:**
  ```powershell
  cd frontend
  npm run build
  cd ..
  npx firebase-tools deploy --only hosting --project cloudreasoningengine
  ```
- **Live URL:** [https://cloudreasoningengine.web.app](https://cloudreasoningengine.web.app)
