# Professor Demonstration Guide (5-Minute Walkthrough)

**Project:** Cloud-Native Semantic Eligibility Reasoning Framework (BITE412L)  
**Live Deployed Application:** [https://cloudreasoningengine.web.app](https://cloudreasoningengine.web.app)  
**Live Neo4j AuraDB Instance:** `neo4j+s://d7cf4786.databases.neo4j.io`

---

## 5-Minute Professor Demo Script

This structured 5-minute presentation demonstrates the cloud-native architecture, multilingual NLP extraction, knowledge graph reasoning, and open-world 3-valued logic.

```text
[Minute 1] Landing Page & Architectural Overview
[Minute 2] Scheme Catalogue & Multilingual Category Filtering
[Minute 3] Hindi Scheme Detail & Knowledge Graph Inspection
[Minute 4] 1-Click Interactive Eligibility Check (3-Valued Logic)
[Minute 5] "My Matches" Ranked Evaluation & Point-in-Time Amendment Simulator
```

---

### Minute 1: Landing Page & Problem Context (0:00 – 1:00)
1. **Open the live application:** [https://cloudreasoningengine.web.app](https://cloudreasoningengine.web.app).
2. **Explain the core problem:**
   - Government welfare notifications in India are published as unstructured, multilingual gazette PDFs (Hindi, Tamil, Telugu, English).
   - Citizens and village kiosk operators struggle to interpret complex income caps, caste categories, and statutory exclusion clauses.
3. **Show the Metrics Bar:**
   - **100% Verdict Accuracy:** 39 hand-derived gold profiles verified.
   - **2.57x Live AuraDB Speedup:** Incremental clause evolution vs full graph re-ingestion.
   - **4 Languages:** English, Hindi, Tamil, Telugu.
   - **41 / 41 Verified Tests:** Across all 4 microservice layers.
4. **Show the 6 Featured Welfare Schemes:** Point out concrete key benefits (e.g. ₹5,00,000/yr health cover, Free LPG stove + cylinder, ₹1,000/mo cash support).

---

### Minute 2: Scheme Catalogue & Filter Chips (1:00 – 2:00)
1. **Navigate to "Schemes" (`/schemes`):**
2. **Demonstrate Category Filtering:**
   - Click **Health** → shows Ayushman Bharat PM-JAY.
   - Click **Women & Child** → shows PM Ujjwala Yojana, KMUT, AP YSR Cheyutha, and Sukanya Samriddhi.
   - Click **Pension** → shows Atal Pension Yojana and IGNOAPS.
   - Click **Education** → shows Post-Matric SC, NMMSS, and Pudhumai Penn.
   - Click **Livelihood** → shows PM Vishwakarma Scheme.
3. **Demonstrate Language Filtering:**
   - Click **Hindi** filter chip → isolates PM Ujjwala and IGNOAPS.
   - Click **Tamil** filter chip → isolates KMUT and Pudhumai Penn.
   - Click **Telugu** filter chip → isolates AP YSR Cheyutha.
4. **Highlight Visual Polish:**
   - Note that cards wrap cleanly, show short display names, full titles on hover tooltip, language badges, and concrete benefit badges.
   - Point out the **Official Advisory Banner**: *"Demo built from public guidelines. Not an official eligibility decision. Verify on the official portal."*

---

### Minute 3: Multilingual Scheme Detail & Graph (2:00 – 3:00)
1. **Click into PM Ujjwala Yojana (`/schemes/pm-ujjwala-yojana`):**
   - Point out the `Hindi` source badge, verified date, and official portal link (`https://pmuy.gov.in`).
2. **Inspect the Tabs:**
   - **Overview:** Concrete benefit (Free LPG connection + 1st cylinder + stove) and Ministry of Petroleum governance metadata.
   - **Eligibility Rules:** Extracted conditions: Adult Female (`age >= 18`, `gender == female`), `bpl_status == true`, `has_lpg_connection == false`.
   - **Exclusions:** Disqualifying override: Prior LPG connection in family.
   - **Rule Graph (Neo4j):** Show the Cypher schema node linking `(:Scheme) -[:HAS_CONDITION]-> (:Condition)` and `(:Exclusion) -[:OVERRIDES]-> (:Condition)`.
   - **Version History:** Point-in-time `as_of` temporal query preview.

---

### Minute 4: Eligibility Check with 1-Click Demo Profiles (3:00 – 4:00)
1. **Click "Check My Eligibility" or go to `/check/pm-jay-ayushman-bharat`:**
2. **Demonstrate Open-World 3-Valued Semantic Reasoning:**
   - **Click "Eligible Preset":**
     * Pre-fills citizen facts (BPL cardholder, age 72, non-taxpayer).
     * Click **Review Answers** → **Run Semantic Reasoning Engine**.
     * **Result:** **ELIGIBLE** (Score: 100%, Green Shield, all clauses PASSED).
   - **Click "Needs Info Preset":**
     * Automatically sets BPL status or Senior status to *"I don't know / Missing"*.
     * Click **Run Semantic Reasoning Engine**.
     * **Result:** **NEEDS_MORE_INFO** (Amber Badge, Readiness Score: 66%, lists specific missing evidence to produce).
   - **Click "Ineligible Preset":**
     * Sets Income Tax Payer status to `true`.
     * Click **Run Semantic Reasoning Engine**.
     * **Result:** **INELIGIBLE** (Rose Badge, highlights the statutory exclusion override: *Applicant is an active Income Tax Payer*).

---

### Minute 5: "My Matches" & Point-in-Time Amendment Sim (4:00 – 5:00)
1. **Navigate to "My Matches" (`/matches`):**
   - Click **"Load Persona: Rural Artisan"**:
     * Unified citizen profile populated with artisan occupation, carpentry trade, BPL status, non-government employee.
     * Evaluates across **ALL 13 SCHEMES simultaneously**.
     * Ranked output:
       1. **PM Vishwakarma Scheme** (ELIGIBLE - 100% Readiness, ₹15,000 toolkit voucher).
       2. **PMAY-G Housing** (ELIGIBLE - 100% Readiness, ₹1,20,000 grant).
       3. **PM-JAY Health Cover** (ELIGIBLE - 100% Readiness, ₹5 Lakh cover).
       4. Other schemes marked **INELIGIBLE** or **NEEDS_MORE_INFO** with expandable *"Why?"* clause explanations.
   - Click **"Export CSV"** to demonstrate downloadable citizen eligibility report.
2. **Navigate to "Amendment Simulator" (`/amend`):**
   - Demonstrate temporal point-in-time queries (`as_of`):
     * Explain that welfare rules evolve (e.g. Post-Matric SC income threshold amended from ₹2,50,000 to ₹3,00,000).
     * Show how a citizen with ₹2,80,000 income was **INELIGIBLE** under the 2023 rule version, but becomes **ELIGIBLE** under the 2024 rule version.

---

## Technical Proof Points to Mention to Professor

1. **True Pipeline Provenance (No Hand-Written Rulesets):**
   - Every scheme follows: `Official Notification -> Layer 1 OCR Cleaner -> Layer 2 Groq Semantic Extractor -> Controlled Ontology Validation -> Layer 3 Graph Builder -> Live Neo4j AuraDB & Frontend Catalog`.
   - Raw extractions stored in `data/rulesets/raw/*.json`.
   - Reviewed gold rules stored in `data/rulesets/corrected/*.json`.
2. **Idempotent Seed Script:**
   - Single command to re-seed graph and catalogue: `python scripts/seed_schemes.py`.
3. **Rigorous Benchmark Suite:**
   - `python evaluation/run_evaluation.py` outputs per-scheme and per-language metrics, confusion matrix, and extraction precision/recall.
4. **41 Passed Unit/Integration Tests:**
   - Verified across all 4 layers with `pytest`.