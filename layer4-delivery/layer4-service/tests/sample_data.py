"""
Sample Layer 3 eligibility evaluation outputs for testing Layer 4 pure functions.
Derived from the Post-Matric SC Scholarship ruleset.
"""

from app.schema import (
    ClauseEvaluation,
    ClauseType,
    EligibilityResult,
    EligibilityVerdict,
    EvaluationStatus,
)

SAMPLE_DOCUMENTS = [
    {
        "document_type": "caste_certificate",
        "required_for": "caste verification",
        "raw_text": "Caste Certificate issued by competent revenue authority.",
    },
    {
        "document_type": "income_certificate",
        "required_for": "income verification",
        "raw_text": "Income Certificate valid for current financial year.",
    },
    {
        "document_type": "residence_proof",
        "required_for": "domicile/residence verification",
        "raw_text": "Domicile / Residence certificate.",
    },
    {
        "document_type": "bank_passbook",
        "required_for": "bank account verification",
        "raw_text": "Bank passbook copy seeded with Aadhaar number.",
    },
]

SAMPLE_BENEFITS = [
    {
        "benefit_type": "cash_transfer",
        "amount": None,
        "frequency": "annual",
        "raw_text": "full reimbursement of compulsory non-refundable academic tuition fees",
    },
    {
        "benefit_type": "cash_transfer",
        "amount": 1200,
        "frequency": "monthly",
        "raw_text": "monthly maintenance allowance of Rs. 1200 for hostellers",
    },
]

# ============================================================================
# Case 1: High-Confidence Eligible
# All conditions satisfied, zero unknowns, no exclusions triggered
# ============================================================================
CASE_1_HIGH_CONFIDENCE_ELIGIBLE = EligibilityResult(
    scheme_id="post_matric_sc_scholarship_demo",
    scheme_name="Centrally Sponsored Post-Matric Scholarship Scheme for SC Students",
    verdict=EligibilityVerdict.ELIGIBLE,
    citizen_id="CITIZEN_001_SC_STUDENT",
    passed_conditions=[
        ClauseEvaluation(
            clause_id="post_matric_sc_caste_001",
            clause_type=ClauseType.CONDITION,
            field="caste_category",
            operator="eq",
            expected_value="SC",
            citizen_value="SC",
            status=EvaluationStatus.PASSED,
            raw_text="Candidate must belong to Scheduled Caste (SC) category of the state.",
            reason="Citizen caste 'SC' exactly matches scheme requirement 'SC'.",
            prerequisite_met=True,
        ),
        ClauseEvaluation(
            clause_id="post_matric_sc_edu_002",
            clause_type=ClauseType.CONDITION,
            field="education_level",
            operator="eq",
            expected_value="10th",
            citizen_value="10th",
            status=EvaluationStatus.PASSED,
            raw_text="Candidate must have successfully completed 10th standard (Matriculation) from a recognized secondary education board.",
            reason="Citizen completed 10th matriculation standard.",
            prerequisite_met=True,
        ),
        ClauseEvaluation(
            clause_id="post_matric_sc_income_003",
            clause_type=ClauseType.CONDITION,
            field="income_threshold",
            operator="lte",
            expected_value=250000,
            citizen_value=180000,
            status=EvaluationStatus.PASSED,
            raw_text="Total annual family income from all sources must not exceed Rs. 2,50,000 per annum.",
            reason="Citizen annual family income Rs. 1,80,000 <= threshold Rs. 2,50,000.",
            prerequisite_met=True,
        ),
    ],
    failed_conditions=[],
    unknown_conditions=[],
    matched_exclusions=[],
    required_documents=SAMPLE_DOCUMENTS,
    entitled_benefits=SAMPLE_BENEFITS,
    summary_explanation="Citizen qualifies for Centrally Sponsored Post-Matric Scholarship Scheme for SC Students.",
    audit_trail=[
        "Evaluated caste_category: SC == SC (PASSED)",
        "Evaluated education_level: 10th == 10th (PASSED)",
        "Evaluated income_threshold: 180000 <= 250000 (PASSED)",
        "Verified no exclusion clauses matched.",
    ],
)

# ============================================================================
# Case 2: Low-Confidence with Missing Facts (Needs More Info)
# Caste and education known, but annual income was omitted from submission
# ============================================================================
CASE_2_LOW_CONFIDENCE_MISSING_FACTS = EligibilityResult(
    scheme_id="post_matric_sc_scholarship_demo",
    scheme_name="Centrally Sponsored Post-Matric Scholarship Scheme for SC Students",
    verdict=EligibilityVerdict.NEEDS_MORE_INFO,
    citizen_id="CITIZEN_004_MISSING_INCOME",
    passed_conditions=[
        ClauseEvaluation(
            clause_id="post_matric_sc_caste_001",
            clause_type=ClauseType.CONDITION,
            field="caste_category",
            operator="eq",
            expected_value="SC",
            citizen_value="SC",
            status=EvaluationStatus.PASSED,
            raw_text="Candidate must belong to Scheduled Caste (SC) category of the state.",
            reason="Citizen caste 'SC' matches scheme requirement 'SC'.",
            prerequisite_met=True,
        ),
        ClauseEvaluation(
            clause_id="post_matric_sc_edu_002",
            clause_type=ClauseType.CONDITION,
            field="education_level",
            operator="eq",
            expected_value="10th",
            citizen_value="10th",
            status=EvaluationStatus.PASSED,
            raw_text="Candidate must have successfully completed 10th standard (Matriculation) from a recognized secondary education board.",
            reason="Citizen completed 10th matriculation standard.",
            prerequisite_met=True,
        ),
    ],
    failed_conditions=[],
    unknown_conditions=[
        ClauseEvaluation(
            clause_id="post_matric_sc_income_003",
            clause_type=ClauseType.CONDITION,
            field="income_threshold",
            operator="lte",
            expected_value=250000,
            citizen_value=None,
            status=EvaluationStatus.UNKNOWN,
            raw_text="Total annual family income from all sources must not exceed Rs. 2,50,000 per annum.",
            reason="Missing citizen fact 'income_threshold'. Verification cannot proceed.",
            prerequisite_met=True,
        )
    ],
    matched_exclusions=[],
    required_documents=SAMPLE_DOCUMENTS,
    entitled_benefits=[],
    summary_explanation="Citizen profile incomplete: missing annual family income.",
    audit_trail=[
        "Evaluated caste_category: SC == SC (PASSED)",
        "Evaluated education_level: 10th == 10th (PASSED)",
        "Evaluated income_threshold: [MISSING] -> Status UNKNOWN",
    ],
)

# ============================================================================
# Case 3: Clearly Ineligible-But-Close (Actionable / Flippable)
# Income is ₹3,20,000 against ceiling of ₹2,50,000 (gap of ₹70,000)
# ============================================================================
CASE_3_INELIGIBLE_BUT_CLOSE = EligibilityResult(
    scheme_id="post_matric_sc_scholarship_demo",
    scheme_name="Centrally Sponsored Post-Matric Scholarship Scheme for SC Students",
    verdict=EligibilityVerdict.INELIGIBLE,
    citizen_id="CITIZEN_002_HIGH_INCOME",
    passed_conditions=[
        ClauseEvaluation(
            clause_id="post_matric_sc_caste_001",
            clause_type=ClauseType.CONDITION,
            field="caste_category",
            operator="eq",
            expected_value="SC",
            citizen_value="SC",
            status=EvaluationStatus.PASSED,
            raw_text="Candidate must belong to Scheduled Caste (SC) category of the state.",
            reason="Citizen caste 'SC' matches requirement.",
            prerequisite_met=True,
        ),
        ClauseEvaluation(
            clause_id="post_matric_sc_edu_002",
            clause_type=ClauseType.CONDITION,
            field="education_level",
            operator="eq",
            expected_value="10th",
            citizen_value="10th",
            status=EvaluationStatus.PASSED,
            raw_text="Candidate must have successfully completed 10th standard (Matriculation) from a recognized secondary education board.",
            reason="Citizen completed 10th matriculation standard.",
            prerequisite_met=True,
        ),
    ],
    failed_conditions=[
        ClauseEvaluation(
            clause_id="post_matric_sc_income_003",
            clause_type=ClauseType.CONDITION,
            field="income_threshold",
            operator="lte",
            expected_value=250000,
            citizen_value=320000,
            status=EvaluationStatus.FAILED,
            raw_text="Total annual family income from all sources must not exceed Rs. 2,50,000 per annum.",
            reason="Citizen income Rs. 3,20,000 exceeds maximum allowable ceiling of Rs. 2,50,000.",
            prerequisite_met=True,
        )
    ],
    unknown_conditions=[],
    matched_exclusions=[],
    required_documents=SAMPLE_DOCUMENTS,
    entitled_benefits=[],
    summary_explanation="Citizen is ineligible due to annual family income exceeding threshold.",
    audit_trail=[
        "Evaluated caste_category: SC == SC (PASSED)",
        "Evaluated education_level: 10th == 10th (PASSED)",
        "Evaluated income_threshold: 320000 <= 250000 (FAILED)",
    ],
)
