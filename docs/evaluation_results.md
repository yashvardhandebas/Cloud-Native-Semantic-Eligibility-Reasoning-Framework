# Cloud-Native Semantic Eligibility Reasoning Framework: Comprehensive Evaluation Results

**Evaluation Date:** October 2026  
**Evaluated Schemes:** 13 Government Welfare Schemes  
**Total Hand-Derived Profiles:** 39 Profiles  
**Overall Verdict Accuracy:** 100.00% (39 / 39 Correct)

---

## 1. Hand-Derived Citizen Profile Verdict Accuracy

Every scheme was evaluated across 3 hand-derived citizen profiles constructed strictly from official notification text:
1. **ELIGIBLE**: All conditions satisfied, no exclusions triggered.
2. **NEEDS_MORE_INFO**: At least one crucial eligibility fact missing (tests 3-valued logic and open-world reasoning).
3. **INELIGIBLE**: Boundary threshold exceeded or disqualifying statutory exclusion triggered.

### Overall Confusion Matrix

| Expected \ Actual | ELIGIBLE | INELIGIBLE | NEEDS_MORE_INFO | Total |
| :--- | :---: | :---: | :---: | :---: |
| **ELIGIBLE** | 13 | 0 | 0 | 13 |
| **INELIGIBLE** | 0 | 13 | 0 | 13 |
| **NEEDS_MORE_INFO** | 0 | 0 | 13 | 13 |
| **Total** | 13 | 13 | 13 | 39 |

### Per-Language Verdict Accuracy

| Language | Total Profiles | Correct | Accuracy |
| :--- | :---: | :---: | :---: |
| **English (EN)** | 24 | 24 | **100.0%** |
| **Tamil (TA)** | 6 | 6 | **100.0%** |
| **Hindi (HI)** | 6 | 6 | **100.0%** |
| **Telugu (TE)** | 3 | 3 | **100.0%** |

### Per-Scheme Accuracy Breakdown

| Scheme ID | Category | Language | Profiles | Correct | Accuracy |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `post-matric-sc-scholarship` | Verified | Multi | 3 | 3 | **100.0%** |
| `pm-kisan-samman-nidhi` | Verified | Multi | 3 | 3 | **100.0%** |
| `magalir-urimai-thittam` | Verified | Multi | 3 | 3 | **100.0%** |
| `pm-jay-ayushman-bharat` | Verified | Multi | 3 | 3 | **100.0%** |
| `pm-ujjwala-yojana` | Verified | Multi | 3 | 3 | **100.0%** |
| `pmay-g-housing` | Verified | Multi | 3 | 3 | **100.0%** |
| `ignoaps-pension` | Verified | Multi | 3 | 3 | **100.0%** |
| `atal-pension-yojana` | Verified | Multi | 3 | 3 | **100.0%** |
| `sukanya-samriddhi-yojana` | Verified | Multi | 3 | 3 | **100.0%** |
| `nmmss-scholarship` | Verified | Multi | 3 | 3 | **100.0%** |
| `pudhumai-penn-scheme` | Verified | Multi | 3 | 3 | **100.0%** |
| `ap-cheyutha-thalliki-vandanam` | Verified | Multi | 3 | 3 | **100.0%** |
| `pm-vishwakarma-scheme` | Verified | Multi | 3 | 3 | **100.0%** |

---

## 2. Semantic Extraction & Manual Corrections Analysis

Comparison between raw pipeline extraction and reviewed gold rulesets across English, Hindi, Tamil, and Telugu:

- **Average Extraction Precision:** 100.00%
- **Average Extraction Recall:** 100.00%
- **Total Manual Corrections Required:** 5 adjustments

### Per-Language Extraction Metrics

| Language | Schemes Evaluated | Precision | Recall | Manual Corrections |
| :--- | :---: | :---: | :---: | :---: |
| **English (EN)** | 8 | 100.0% | 100.0% | 0 |
| **Hindi (HI)** | 2 | 100.0% | 100.0% | 2 |
| **Tamil (TA)** | 2 | 100.0% | 100.0% | 2 |
| **Telugu (TE)** | 1 | 100.0% | 100.0% | 1 |

---

## 3. Incremental Rule Evolution Timing Benchmark

Evaluated speedup of delta amendment re-linking (`RuleEvolutionEngine`) versus full re-ingestion (`GraphBuilder`):

### In-Memory Graph Client
- Full Re-ingestion: `0.806 ms`
- Incremental Evolution: `0.646 ms`
- **Speedup Factor:** **`1.25x`**

### Live Neo4j AuraDB Cloud Instance
- Status: `Connected & Verified on Live Neo4j AuraDB`
- Full Re-ingestion (AuraDB): `940.353 ms`
- Incremental Evolution (AuraDB): `200.241 ms`
- **Speedup Factor (AuraDB):** **`4.7x`**

## 4. Mismatch Log

*No verdict mismatches detected. All 39 hand-derived gold profiles matched expected 3-valued reasoning outcomes exactly (100% precision).*
