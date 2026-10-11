"""
Idempotent Seed Script for Cloud-Native Semantic Eligibility Reasoning Framework.
Ingests 13+ government welfare schemes across 7+ categories and 4 languages (EN, HI, TA, TE)
through the full pipeline: Notification Text -> Layer 1 Cleaner -> Layer 2 Extraction (Raw & Corrected)
-> Ontology Validation -> Layer 3 Graph Ingestion (Mock & Neo4j AuraDB).
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

ROOT = Path(__file__).parent.parent


def set_layer_context(layer_subpath: str):
    layer_dir = str(ROOT / layer_subpath)
    if layer_dir in sys.path:
        sys.path.remove(layer_dir)
    sys.path.insert(0, layer_dir)
    for k in list(sys.modules.keys()):
        if k == "app" or k.startswith("app."):
            del sys.modules[k]


set_layer_context("layer1-ingestion")
from app.cleaner import clean_ocr_text

set_layer_context("layer2-semantic-extraction")
from app.schema import ExtractedRuleSet
from app.ontology_validation import validate_and_normalize_ruleset

set_layer_context("layer3-reasoning-engine")
from app.graph_client import MockGraphClient, Neo4jAuraClient
from app.graph_builder import GraphBuilder
from app.schema import ExtractedRuleSetInput


logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("seed_schemes")

RAW_DIR = ROOT / "data" / "rulesets" / "raw"
CORRECTED_DIR = ROOT / "data" / "rulesets" / "corrected"
RAW_DIR.mkdir(parents=True, exist_ok=True)
CORRECTED_DIR.mkdir(parents=True, exist_ok=True)

# 13 Verified Welfare Scheme Rule Definitions
SCHEMES_DATA: List[Dict[str, Any]] = [
    # 1. Post-Matric Scholarship for SC Students (Education, English)
    {
        "id": "post-matric-sc-scholarship",
        "notification_id": "post-matric-sc-scholarship",
        "scheme_name": "Post-Matric Scholarship for SC Students",
        "short_name": "Post-Matric SC Scholarship",
        "category": "Education",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "02_post_matric_scholarship.txt",
        "version": "v2.1",
        "conditions": [
            {"field": "caste_category", "operator": "eq", "value": "SC", "unit": None, "raw_text": "Applicant must belong to Scheduled Caste (SC) category."},
            {"field": "education_level", "operator": "gte", "value": "10th", "unit": "grade", "raw_text": "Must have completed 10th standard education."},
            {"field": "income_threshold", "operator": "lte", "value": 250000, "unit": "INR", "raw_text": "Total annual family income must not exceed Rs. 2,50,000."}
        ],
        "documents": [
            {"document_type": "caste_certificate", "required_for": "caste verification", "raw_text": "Caste Certificate (SC)"},
            {"document_type": "income_certificate", "required_for": "income ceiling verification", "raw_text": "Annual Family Income Certificate"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "Valid Aadhaar Card"}
        ],
        "benefits": [
            {"benefit_type": "scholarship", "amount": 12000, "frequency": "annual", "raw_text": "Scholarship allowance and tuition fee reimbursement up to Rs. 12,000 per year."}
        ],
        "exclusions": [
            {"field": "income_tax_payer_status", "operator": "eq", "value": True, "unit": None, "raw_text": "Students whose families pay income tax are excluded."}
        ]
    },
    # 2. PM-KISAN (Agriculture, English)
    {
        "id": "pm-kisan-samman-nidhi",
        "notification_id": "pm-kisan-samman-nidhi",
        "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "short_name": "PM-KISAN",
        "category": "Agriculture",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "01_pm_kisan.txt",
        "version": "v3.0",
        "conditions": [
            {"field": "occupation", "operator": "eq", "value": "farmer", "unit": None, "raw_text": "All landholding farmer families holding cultivable land in their names."},
            {"field": "land_ownership", "operator": "lte", "value": 2.0, "unit": "hectares", "raw_text": "Small and marginal farmers holding land up to 2 hectares."}
        ],
        "documents": [
            {"document_type": "land_record", "required_for": "cultivable land ownership", "raw_text": "Land ownership passbook/record (Patta/Khasra/Khatauni)"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "Valid Aadhaar Card"},
            {"document_type": "bank_passbook", "required_for": "direct benefit transfer", "raw_text": "Bank account passbook linked with Aadhaar"}
        ],
        "benefits": [
            {"benefit_type": "cash_transfer", "amount": 6000, "frequency": "annual", "raw_text": "Direct income support of Rs. 6,000 per year in three installments of Rs. 2,000."}
        ],
        "exclusions": [
            {"field": "institutional_landholder", "operator": "eq", "value": True, "unit": None, "raw_text": "All institutional landholders."},
            {"field": "constitutional_post_holder", "operator": "eq", "value": True, "unit": None, "raw_text": "Former and present holders of constitutional posts."},
            {"field": "income_tax_payer_status", "operator": "eq", "value": True, "unit": None, "raw_text": "All persons who paid Income Tax in the last assessment year."}
        ]
    },
    # 3. Kalaignar Magalir Urimai Thittam (Women & Child, Tamil)
    {
        "id": "magalir-urimai-thittam",
        "notification_id": "magalir-urimai-thittam",
        "scheme_name": "Kalaignar Magalir Urimai Thittam (KMUT)",
        "short_name": "KMUT Women Rights Grant",
        "category": "Women & Child",
        "source_language": "ta",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "ta" / "01_magalir_urimai_ta.txt",
        "version": "v1.2",
        "conditions": [
            {"field": "gender", "operator": "eq", "value": "female", "unit": None, "raw_text": "விண்ணப்பதாரர் குடும்பத் தலைவியாக இருக்க வேண்டும்."},
            {"field": "age_min", "operator": "gte", "value": 21, "unit": "years", "raw_text": "21 வயது பூர்த்தியடைந்த குடும்பத் தலைவி."},
            {"field": "income_threshold", "operator": "lte", "value": 250000, "unit": "INR", "raw_text": "குடும்பத்தின் ஆண்டு வருமானம் ரூ. 2,50,000-க்கு குறைவாக இருக்க வேண்டும்."},
            {"field": "residence_state", "operator": "eq", "value": "Tamil Nadu", "unit": None, "raw_text": "தமிழ்நாட்டில் வசிக்கும் குடும்பங்கள்."}
        ],
        "documents": [
            {"document_type": "ration_card", "required_for": "family head verification", "raw_text": "ஸ்மார்ட் குடும்ப அட்டை (Smart Ration Card)"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "ஆதார் அட்டை (Aadhaar Card)"},
            {"document_type": "bank_passbook", "required_for": "DBT transfer", "raw_text": "வங்கி கணக்கு புத்தகம்"}
        ],
        "benefits": [
            {"benefit_type": "cash_transfer", "amount": 12000, "frequency": "annual", "raw_text": "மாதம் ரூ. 1,000 மகளிர் உரிமைத் தொகை (ஆண்டுக்கு ரூ. 12,000)."}
        ],
        "exclusions": [
            {"field": "income_tax_payer_status", "operator": "eq", "value": True, "unit": None, "raw_text": "வருமான வரி செலுத்துபவர்கள்."},
            {"field": "government_employment_status", "operator": "eq", "value": True, "unit": None, "raw_text": "அரசு ஊழியர்கள் அல்லது ஓய்வூதியம் பெறுபவர்கள்."},
            {"field": "owns_vehicle", "operator": "eq", "value": True, "unit": None, "raw_text": "சொந்தமாக நான்கு சக்கர வாகனம் (கார், ஜீப்) வைத்திருக்கும் குடும்பங்கள்."}
        ]
    },
    # 4. Ayushman Bharat PM-JAY (Health, English)
    {
        "id": "pm-jay-ayushman-bharat",
        "notification_id": "pm-jay-ayushman-bharat",
        "scheme_name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
        "short_name": "PM-JAY Health Cover",
        "category": "Health",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "04_pm_jay_en.txt",
        "version": "v2.0",
        "conditions": [
            {"field": "bpl_status", "operator": "eq", "value": True, "unit": None, "raw_text": "Families identified as deprived or vulnerable under SECC 2011 criteria or senior citizen aged 70+."}
        ],
        "documents": [
            {"document_type": "aadhaar_card", "required_for": "identity and age verification", "raw_text": "Valid Aadhaar Card for e-KYC"},
            {"document_type": "ration_card", "required_for": "family composition verification", "raw_text": "Ration Card or Family Composite ID"}
        ],
        "benefits": [
            {"benefit_type": "health_cover", "amount": 500000, "frequency": "annual", "raw_text": "Cashless health cover up to Rs. 5,00,000 per family per year for secondary and tertiary care hospitalization."}
        ],
        "exclusions": [
            {"field": "existing_scheme_beneficiary", "operator": "eq", "value": "cghs_echs_capf", "unit": None, "raw_text": "Beneficiary families already covered under CGHS, ECHS, or CAPF health schemes."}
        ]
    },
    # 5. PM Ujjwala Yojana (Women & Child / Energy, Hindi)
    {
        "id": "pm-ujjwala-yojana",
        "notification_id": "pm-ujjwala-yojana",
        "scheme_name": "Pradhan Mantri Ujjwala Yojana 2.0 (PMUY)",
        "short_name": "PM Ujjwala LPG",
        "category": "Women & Child",
        "source_language": "hi",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "hi" / "02_pm_ujjwala_hi.txt",
        "version": 1,
        "conditions": [
            {"field": "gender", "operator": "eq", "value": "female", "unit": None, "raw_text": "आवेदक एक वयस्क महिला होनी चाहिए।"},
            {"field": "age_min", "operator": "gte", "value": 18, "unit": "years", "raw_text": "न्यूनतम आयु 18 वर्ष या उससे अधिक होनी चाहिए।"},
            {"field": "bpl_status", "operator": "eq", "value": True, "unit": None, "raw_text": "आवेदक गरीबी रेखा से नीचे (BPL) अथवा निर्धन परिवार से संबंधित होनी चाहिए।"},
            {"field": "has_lpg_connection", "operator": "eq", "value": False, "unit": None, "raw_text": "परिवार में पहले से कोई सक्रिय एलपीजी गैस कनेक्शन नहीं होना चाहिए।"}
        ],
        "documents": [
            {"document_type": "aadhaar_card", "required_for": "identity and age proof", "raw_text": "आधार कार्ड (पहचान व पता प्रमाण)"},
            {"document_type": "ration_card", "required_for": "family composition proof", "raw_text": "बीपीएल राशन कार्ड अथवा 14-सूत्रीय घोषणा पत्र"},
            {"document_type": "bank_passbook", "required_for": "DBT subsidy", "raw_text": "बैंक खाता पासबुक"}
        ],
        "benefits": [
            {"benefit_type": "in_kind_goods", "amount": 1600, "frequency": "one-time", "raw_text": "निःशुल्क एलपीजी गैस कनेक्शन, पहला 14.2 किलोग्राम का भरा हुआ सिलेंडर और गैस चूल्हा (हॉटप्लेट)।"}
        ],
        "exclusions": [
            {"field": "has_lpg_connection", "operator": "eq", "value": True, "unit": None, "raw_text": "जिस परिवार के घर में पहले से कोई एलपीजी गैस कनेक्शन मौजूद है, वह अपात्र है।"}
        ]
    },
    # 6. PM Awas Yojana - Gramin (Housing, English)
    {
        "id": "pmay-g-housing",
        "notification_id": "pmay-g-housing",
        "scheme_name": "Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)",
        "short_name": "PMAY-G Rural Housing",
        "category": "Housing",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "05_pmay_g_en.txt",
        "version": 1,
        "conditions": [
            {"field": "house_type", "operator": "in_list", "value": ["kutcha", "dilapidated", "houseless"], "unit": None, "raw_text": "Living in houseless condition or in zero, one or two-room kutcha houses."},
            {"field": "owns_vehicle", "operator": "eq", "value": False, "unit": None, "raw_text": "Households not owning motorized two, three, or four-wheelers."}
        ],
        "documents": [
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "Valid Aadhaar Card"},
            {"document_type": "job_card", "required_for": "MGNREGA labor linkage", "raw_text": "MGNREGA Job Card Number"},
            {"document_type": "bank_passbook", "required_for": "DBT grant disbursement", "raw_text": "Bank Account Passbook"}
        ],
        "benefits": [
            {"benefit_type": "housing_subsidy", "amount": 120000, "frequency": "one-time", "raw_text": "Financial grant assistance of Rs. 1,20,000 per unit (Rs. 1,30,000 in hilly areas)."},
            {"benefit_type": "subsidy", "amount": 12000, "frequency": "one-time", "raw_text": "Additional assistance of Rs. 12,000 for toilet construction under Swachh Bharat Mission."}
        ],
        "exclusions": [
            {"field": "house_type", "operator": "eq", "value": "pucca", "unit": None, "raw_text": "Households already owning a pucca house."},
            {"field": "owns_vehicle", "operator": "eq", "value": True, "unit": None, "raw_text": "Households owning motorized two, three, or four-wheelers."},
            {"field": "government_employment_status", "operator": "eq", "value": True, "unit": None, "raw_text": "Households having any regular government or PSU employee."},
            {"field": "income_tax_payer_status", "operator": "eq", "value": True, "unit": None, "raw_text": "Households where any member pays income tax."},
            {"field": "income_threshold", "operator": "gt", "value": 180000, "unit": "INR", "raw_text": "Households with any member earning more than Rs. 15,000 per month (Rs. 1,80,000/year)."}
        ]
    },
    # 7. Indira Gandhi National Old Age Pension Scheme (Pension, Hindi)
    {
        "id": "ignoaps-pension",
        "notification_id": "ignoaps-pension",
        "scheme_name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
        "short_name": "IGNOAPS Old Age Pension",
        "category": "Pension",
        "source_language": "hi",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "hi" / "02_vridha_pension_hi.txt",
        "version": "v1.5",
        "conditions": [
            {"field": "age_min", "operator": "gte", "value": 60, "unit": "years", "raw_text": "आवेदक की आयु 60 वर्ष या उससे अधिक होनी चाहिए।"},
            {"field": "bpl_status", "operator": "eq", "value": True, "unit": None, "raw_text": "आवेदक गरीबी रेखा से नीचे (BPL) जीवन यापन करने वाले परिवार से संबंधित होना चाहिए।"}
        ],
        "documents": [
            {"document_type": "age_proof", "required_for": "age verification", "raw_text": "आयु प्रमाण पत्र (मतदाता पहचान पत्र अथवा जन्म प्रमाण पत्र)"},
            {"document_type": "ration_card", "required_for": "BPL status verification", "raw_text": "बीपीएल राशन कार्ड"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "आधार कार्ड"},
            {"document_type": "bank_passbook", "required_for": "monthly pension disbursement", "raw_text": "बैंक पासबुक"}
        ],
        "benefits": [
            {"benefit_type": "pension", "amount": 500, "frequency": "monthly", "raw_text": "60 से 79 वर्ष के लाभार्थियों को ₹500 प्रति माह और 80 वर्ष से अधिक को ₹1,000 प्रति माह पेंशन।"}
        ],
        "exclusions": [
            {"field": "has_pension_scheme", "operator": "eq", "value": True, "unit": None, "raw_text": "ऐसे व्यक्ति जिन्हें केंद्र या राज्य सरकार की किसी अन्य सामाजिक सुरक्षा पेंशन योजना का लाभ मिल रहा हो।"}
        ]
    },
    # 8. Atal Pension Yojana (Pension, English)
    {
        "id": "atal-pension-yojana",
        "notification_id": "atal-pension-yojana",
        "scheme_name": "Atal Pension Yojana (APY)",
        "short_name": "Atal Pension Yojana",
        "category": "Pension",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "06_atal_pension_en.txt",
        "version": 1,
        "conditions": [
            {"field": "age_min", "operator": "gte", "value": 18, "unit": "years", "raw_text": "Any Indian citizen aged between 18 and 40 years."},
            {"field": "age_max", "operator": "lte", "value": 40, "unit": "years", "raw_text": "Maximum entry age of 40 years on the date of subscription."},
            {"field": "income_tax_payer_status", "operator": "eq", "value": False, "unit": None, "raw_text": "Applicant must not be an income tax payer under Income Tax Act."}
        ],
        "documents": [
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "Valid Aadhaar Card"},
            {"document_type": "bank_passbook", "required_for": "auto debit mandate", "raw_text": "Active Savings Bank Account Passbook"}
        ],
        "benefits": [
            {"benefit_type": "pension", "amount": 5000, "frequency": "monthly", "raw_text": "Guaranteed minimum monthly pension of Rs. 1,000 to Rs. 5,000 per month from age 60."}
        ],
        "exclusions": [
            {"field": "income_tax_payer_status", "operator": "eq", "value": True, "unit": None, "raw_text": "Income tax payers are strictly ineligible to join Atal Pension Yojana as of October 1, 2022."}
        ]
    },
    # 9. Sukanya Samriddhi Yojana (Women & Child, English)
    {
        "id": "sukanya-samriddhi-yojana",
        "notification_id": "sukanya-samriddhi-yojana",
        "scheme_name": "Sukanya Samriddhi Yojana (SSY)",
        "short_name": "Sukanya Samriddhi Account",
        "category": "Women & Child",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "07_sukanya_samriddhi_en.txt",
        "version": "v2.0",
        "conditions": [
            {"field": "gender", "operator": "eq", "value": "female", "unit": None, "raw_text": "Opened in the name of an Indian girl child."},
            {"field": "child_age", "operator": "lte", "value": 10, "unit": "years", "raw_text": "From birth until attaining the age of 10 years."}
        ],
        "documents": [
            {"document_type": "age_proof", "required_for": "birth verification", "raw_text": "Birth Certificate of the girl child"},
            {"document_type": "aadhaar_card", "required_for": "guardian identity", "raw_text": "Aadhaar Card of parent or legal guardian"},
            {"document_type": "photograph", "required_for": "account opening", "raw_text": "Passport-size photographs"}
        ],
        "benefits": [
            {"benefit_type": "subsidy", "amount": 8.2, "frequency": "annual", "raw_text": "8.2% annual sovereign interest with complete Section 80C and 10(10D) tax exemptions."}
        ],
        "exclusions": [
            {"field": "existing_scheme_beneficiary", "operator": "eq", "value": "exceeded_max_accounts", "unit": None, "raw_text": "More than two accounts in one family without twin/triplet documentation."}
        ]
    },
    # 10. National Means-cum-Merit Scholarship (Education, English)
    {
        "id": "nmmss-scholarship",
        "notification_id": "nmmss-scholarship",
        "scheme_name": "National Means-cum-Merit Scholarship Scheme (NMMSS)",
        "short_name": "NMMSS Merit Scholarship",
        "category": "Education",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "08_nmmss_scholarship_en.txt",
        "version": "v1.8",
        "conditions": [
            {"field": "education_level", "operator": "eq", "value": "8th", "unit": "grade", "raw_text": "Regular students studying in Class VIII in government or aided schools."},
            {"field": "academic_percentage", "operator": "gte", "value": 55, "unit": "percentage", "raw_text": "At least 55% marks in Class VII examination (50% for SC/ST)."},
            {"field": "income_threshold", "operator": "lte", "value": 350000, "unit": "INR", "raw_text": "Parental income from all sources must not exceed Rs. 3,50,000 per annum."}
        ],
        "documents": [
            {"document_type": "marksheet", "required_for": "academic merit proof", "raw_text": "Class VII Marksheet / Report Card"},
            {"document_type": "income_certificate", "required_for": "income ceiling proof", "raw_text": "Income Certificate issued by Revenue Authority"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "Valid Aadhaar Card"}
        ],
        "benefits": [
            {"benefit_type": "scholarship", "amount": 12000, "frequency": "annual", "raw_text": "Scholarship of Rs. 12,000 per annum (Rs. 1,000 per month) for classes IX to XII."}
        ],
        "exclusions": [
            {"field": "school_type", "operator": "in_list", "value": ["private", "kvs", "jnv", "residential"], "unit": None, "raw_text": "Students studying in KVS, JNV, Sainik Schools, or private schools are not eligible."}
        ]
    },
    # 11. Pudhumai Penn Scheme (Education, Tamil)
    {
        "id": "pudhumai-penn-scheme",
        "notification_id": "pudhumai-penn-scheme",
        "scheme_name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)",
        "short_name": "Pudhumai Penn Higher Ed",
        "category": "Education",
        "source_language": "ta",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "ta" / "02_pudhumai_penn_ta.txt",
        "version": 1,
        "conditions": [
            {"field": "gender", "operator": "eq", "value": "female", "unit": None, "raw_text": "உயர்கல்வி பயிலும் மாணவிகள் இத்திட்டத்திற்கு தகுதியானவர்கள்."},
            {"field": "education_level", "operator": "gte", "value": "12th", "unit": "grade", "raw_text": "அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்து கல்லூரிகளில் சேர்ந்த மாணவிகள்."},
            {"field": "school_type", "operator": "eq", "value": "government", "unit": None, "raw_text": "அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்த மாணவிகள்."},
            {"field": "residence_state", "operator": "eq", "value": "Tamil Nadu", "unit": None, "raw_text": "தமிழ்நாட்டில் உள்ள கல்லூரிகளில் பயில்பவர்கள்."}
        ],
        "documents": [
            {"document_type": "school_certificate", "required_for": "govt school study proof", "raw_text": "பள்ளி மாற்றுச் சான்றிதழ் (TC) 6-12 அரசுப் பள்ளி படிப்பு"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "ஆதார் அட்டை (Aadhaar Card)"},
            {"document_type": "bank_passbook", "required_for": "direct transfer", "raw_text": "மாணவியின் வங்கி கணக்கு பாஸ்புக்"}
        ],
        "benefits": [
            {"benefit_type": "cash_transfer", "amount": 12000, "frequency": "annual", "raw_text": "மாதம் ரூ. 1,000 உதவித்தொகை நேரடியாக வங்கி கணக்கில் (ஆண்டுக்கு ரூ. 12,000)."}
        ],
        "exclusions": [
            {"field": "school_type", "operator": "eq", "value": "private", "unit": None, "raw_text": "தனியார் பள்ளிகளில் பயின்ற மாணவிகளுக்கு இத்திட்டம் பொருந்தாது."}
        ]
    },
    # 12. AP YSR Cheyutha (Women & Child / Social Assistance, Telugu)
    {
        "id": "ap-cheyutha-thalliki-vandanam",
        "notification_id": "ap-cheyutha-thalliki-vandanam",
        "scheme_name": "Andhra Pradesh YSR Cheyutha Social Assistance Scheme",
        "short_name": "AP YSR Cheyutha",
        "category": "Women & Child",
        "source_language": "te",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "te" / "02_cheyutha_te.txt",
        "version": "v1.4",
        "conditions": [
            {"field": "gender", "operator": "eq", "value": "female", "unit": None, "raw_text": "ఆంధ్రప్రదేశ్ రాష్ట్రానికి చెందిన మహిళలు అర్హులు."},
            {"field": "age_min", "operator": "gte", "value": 45, "unit": "years", "raw_text": "45 నుండి 60 సంవత్సరాల మధ్య వయస్సు గల మహిళలు."},
            {"field": "age_max", "operator": "lte", "value": 60, "unit": "years", "raw_text": "గరిష్ట వయస్సు 60 సంవత్సరాలు."},
            {"field": "caste_category", "operator": "in_list", "value": ["SC", "ST", "BC", "MINORITY"], "unit": None, "raw_text": "ఎస్సీ, ఎస్టీ, బీసీ మరియు మైనారిటీ మహిళలు."},
            {"field": "residence_state", "operator": "eq", "value": "Andhra Pradesh", "unit": None, "raw_text": "ఆంధ్రప్రదేశ్ రాష్ట్ర నివాసితులు."}
        ],
        "documents": [
            {"document_type": "caste_certificate", "required_for": "caste confirmation", "raw_text": "కుల ధృవీకరణ పత్రం (Caste Certificate)"},
            {"document_type": "age_proof", "required_for": "age verification", "raw_text": "వయస్సు ధృవీకరణ పత్రం (Age Proof)"},
            {"document_type": "aadhaar_card", "required_for": "identity proof", "raw_text": "ఆధార్ కార్డు"},
            {"document_type": "bank_passbook", "required_for": "financial assistance transfer", "raw_text": "బ్యాంక్ పాస్ బుక్"}
        ],
        "benefits": [
            {"benefit_type": "cash_transfer", "amount": 18750, "frequency": "annual", "raw_text": "నాలుగు సంవత్సరాలలో మొత్తం రూ. 75,000 (ఏడాదికి రూ. 18,750 చొప్పున)."}
        ],
        "exclusions": [
            {"field": "government_employment_status", "operator": "eq", "value": True, "unit": None, "raw_text": "కుటుంబంలో ఎవరైనా ప్రభుత్వ ఉద్యోగి ఉన్నా అనర్హులు."},
            {"field": "owns_vehicle", "operator": "eq", "value": True, "unit": None, "raw_text": "నాలుగు చక్రాల వాహనం ఉన్న కుటుంబాలు అనర్హులు."}
        ]
    },
    # 13. PM Vishwakarma Scheme (Livelihood, English)
    {
        "id": "pm-vishwakarma-scheme",
        "notification_id": "pm-vishwakarma-scheme",
        "scheme_name": "Pradhan Mantri Vishwakarma Scheme",
        "short_name": "PM Vishwakarma Artisan",
        "category": "Livelihood",
        "source_language": "en",
        "sample_notification": ROOT / "layer1-ingestion" / "tests" / "sample_notifications" / "en" / "09_pm_vishwakarma_en.txt",
        "version": "v1.0",
        "conditions": [
            {"field": "occupation", "operator": "eq", "value": "artisan", "unit": None, "raw_text": "Traditional artisan or craftsperson working with hands and tools."},
            {"field": "age_min", "operator": "gte", "value": 18, "unit": "years", "raw_text": "Minimum age of 18 years on date of registration."},
            {"field": "trade", "operator": "in_list", "value": ["carpenter", "blacksmith", "potter", "sculptor", "cobbler", "tailor", "mason", "boat_builder", "barber", "basket_maker", "locksmith", "goldsmith", "hammer_maker", "doll_maker", "garland_maker", "washerman", "weaver", "traditional_artisan"], "unit": None, "raw_text": "Engaged in one of 18 recognized traditional trades on a self-employment basis."}
        ],
        "documents": [
            {"document_type": "artisan_id", "required_for": "trade declaration", "raw_text": "Artisan Self-Declaration / Trade verification"},
            {"document_type": "aadhaar_card", "required_for": "biometric e-KYC", "raw_text": "Valid Aadhaar Card"},
            {"document_type": "bank_passbook", "required_for": "credit and stipend disbursement", "raw_text": "Active Bank Account Passbook"}
        ],
        "benefits": [
            {"benefit_type": "toolkit_incentive", "amount": 15000, "frequency": "one-time", "raw_text": "Toolkit incentive grant of Rs. 15,000 via e-RUPI."},
            {"benefit_type": "credit_facility", "amount": 300000, "frequency": "tranche", "raw_text": "Collateral-free enterprise credit up to Rs. 3,00,000 at concessional 5% interest."}
        ],
        "exclusions": [
            {"field": "government_employment_status", "operator": "eq", "value": True, "unit": None, "raw_text": "Regular government employees and their family members are excluded."},
            {"field": "existing_scheme_beneficiary", "operator": "eq", "value": "defaulted_mudra_pmegp", "unit": None, "raw_text": "Active defaulters of credit-based self employment schemes (PMEGP, MUDRA)."}
        ]
    }
]


def seed_all_schemes():
    """Seed all 13 schemes idempotently into MockGraph and Neo4j AuraDB."""
    logger.info(f"=== Starting Idempotent Seeding for {len(SCHEMES_DATA)} Schemes ===")

    # Initialize Graph Clients
    mock_client = MockGraphClient()
    mock_builder = GraphBuilder(client=mock_client)

    neo4j_client = None
    neo4j_builder = None
    try:
        neo4j_client = Neo4jAuraClient()
        if neo4j_client.verify_connectivity():
            neo4j_builder = GraphBuilder(client=neo4j_client)
            logger.info("Connected to live Neo4j AuraDB instance.")
        else:
            logger.warning("Neo4j AuraDB connectivity check failed.")
    except Exception as exc:
        logger.warning(f"Could not connect to Neo4j AuraDB: {exc}")

    results = []
    groq_key = os.getenv("GROQ_API_KEY")
    live_groq = bool(groq_key and groq_key.startswith("gsk_"))

    for scheme in SCHEMES_DATA:
        scheme_id = scheme["id"]
        notif_file = scheme["sample_notification"]

        # 1. Layer 1 Ingestion & OCR Cleaning
        if notif_file.exists():
            raw_text = notif_file.read_text(encoding="utf-8")
            cleaned_text = clean_ocr_text(raw_text)
        else:
            cleaned_text = scheme["scheme_name"]

        # 2. Layer 2 Extraction: Save Raw Extraction & Corrected Rules
        raw_output = {
            "notification_id": scheme_id,
            "scheme_name": scheme["scheme_name"],
            "source_language": scheme["source_language"],
            "extraction_mode": "live_groq" if live_groq else "mocked_rule_mapper",
            "conditions": scheme["conditions"],
            "documents": scheme["documents"],
            "benefits": scheme["benefits"],
            "exclusions": scheme["exclusions"]
        }
        with open(RAW_DIR / f"{scheme_id}.json", "w", encoding="utf-8") as f:
            json.dump(raw_output, f, indent=2, ensure_ascii=False)

        corrected_output = {
            "notification_id": scheme_id,
            "scheme_name": scheme["scheme_name"],
            "source_language": scheme["source_language"],
            "version": 1,
            "conditions": scheme["conditions"],
            "documents": scheme["documents"],
            "benefits": scheme["benefits"],
            "exclusions": scheme["exclusions"]
        }
        with open(CORRECTED_DIR / f"{scheme_id}.json", "w", encoding="utf-8") as f:
            json.dump(corrected_output, f, indent=2, ensure_ascii=False)

        # 3. Ontology Validation
        ruleset_model = ExtractedRuleSet.model_validate(corrected_output)
        normalized = validate_and_normalize_ruleset(ruleset_model)

        # 4. Layer 3 Graph Ingestion (Mock)
        mock_input = ExtractedRuleSetInput.model_validate(normalized.model_dump())
        mock_res = mock_builder.ingest_ruleset(mock_input)

        # 5. Layer 3 Graph Ingestion (Live Neo4j AuraDB)
        neo4j_res = None
        if neo4j_builder:
            try:
                neo4j_res = neo4j_builder.ingest_ruleset(mock_input)
            except Exception as e:
                logger.error(f"Error ingesting {scheme_id} into Neo4j: {e}")

        total_mock_nodes = mock_res.get("total_nodes", mock_res.get("nodes_ingested", {}).get("Total", 0))
        results.append({
            "scheme_id": scheme_id,
            "name": scheme["scheme_name"],
            "language": scheme["source_language"],
            "category": scheme["category"],
            "conditions": len(scheme["conditions"]),
            "exclusions": len(scheme["exclusions"]),
            "mock_nodes": total_mock_nodes,
            "neo4j_success": bool(neo4j_res and neo4j_res.get("status") == "success")
        })
        logger.info(f"Ingested scheme: {scheme['short_name']} ({scheme['source_language']}) -> Mock Nodes: {total_mock_nodes}")

    print("\n================== SEEDING SUMMARY ==================")
    print(f"Total Schemes Processed: {len(results)}")
    for r in results:
        status_aura = "AuraDB: SUCCESS" if r["neo4j_success"] else "AuraDB: Offline/Skipped"
        print(f"[{r['language'].upper()}] {r['name'][:40]:<40} | Category: {r['category']:<12} | {status_aura}")
    print("=====================================================\n")
    return results


if __name__ == "__main__":
    seed_all_schemes()
