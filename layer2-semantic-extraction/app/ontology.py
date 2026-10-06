from enum import Enum

class OntologyField(str, Enum):
    """Normalized ontology fields for eligibility conditions and exclusions."""
    AGE = "age"
    INCOME_THRESHOLD = "income_threshold"
    AGE_MIN = "age_min"
    AGE_MAX = "age_max"
    OCCUPATION = "occupation"
    GEOGRAPHY_STATE = "geography_state"
    GEOGRAPHY_DISTRICT = "geography_district"
    GENDER = "gender"
    CASTE_CATEGORY = "caste_category"
    LAND_OWNERSHIP = "land_ownership"
    DISABILITY_STATUS = "disability_status"
    FAMILY_SIZE = "family_size"
    MARITAL_STATUS = "marital_status"
    EDUCATION_LEVEL = "education_level"
    EXISTING_SCHEME_BENEFICIARY = "existing_scheme_beneficiary"
    GOVERNMENT_EMPLOYMENT_STATUS = "government_employment_status"
    INCOME_TAX_PAYER_STATUS = "income_tax_payer_status"
    RESIDENCE_STATE = "residence_state"
    CONSTITUTIONAL_POST_HOLDER = "constitutional_post_holder"
    INSTITUTIONAL_LANDHOLDER = "institutional_landholder"


class DocumentType(str, Enum):
    """Normalized document types required for welfare eligibility verification."""
    INCOME_CERTIFICATE = "income_certificate"
    AGE_PROOF = "age_proof"
    AADHAAR_CARD = "aadhaar_card"
    RESIDENCE_PROOF = "residence_proof"
    CASTE_CERTIFICATE = "caste_certificate"
    BANK_PASSBOOK = "bank_passbook"
    LAND_RECORD = "land_record"
    DISABILITY_CERTIFICATE = "disability_certificate"
    RATION_CARD = "ration_card"
    PHOTOGRAPH = "photograph"


class BenefitType(str, Enum):
    """Normalized benefit types provided by government welfare schemes."""
    CASH_TRANSFER = "cash_transfer"
    SUBSIDY = "subsidy"
    PENSION = "pension"
    LOAN_WAIVER = "loan_waiver"
    SCHOLARSHIP = "scholarship"
    INSURANCE = "insurance"
    IN_KIND_GOODS = "in_kind_goods"


class Operator(str, Enum):
    """Standard operators used in eligibility rule conditions and exclusions."""
    LT = "lt"
    LTE = "lte"
    GT = "gt"
    GTE = "gte"
    EQ = "eq"
    NE = "ne"
    IN_RANGE = "in_range"
    IN_LIST = "in_list"
