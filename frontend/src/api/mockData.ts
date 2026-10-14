import { Scheme, EvaluationOutcome, BenchmarkMetrics } from '../types';

export const MOCK_SCHEMES: Scheme[] = [
  // 1. Post-Matric SC Scholarship (Education, English)
  {
    id: 'post-matric-sc-scholarship',
    title: 'Centrally Sponsored Post-Matric Scholarship Scheme for SC Students',
    short_name: 'Post-Matric SC Scholarship',
    category: 'Education',
    state: 'Central / All States',
    language: 'English',
    version: 'v2.1',
    last_amended: '2024-09-15',
    summary: 'Comprehensive scholarship including tuition reimbursement and monthly maintenance allowance for Scheduled Caste students pursuing post-matriculation studies.',
    key_benefit: '₹12,000 / year allowance + full tuition fee waiver',
    source_url: 'https://scholarships.gov.in',
    verified_on: '2024-09-15',
    conditions: [
      {
        id: 'c1',
        field: 'caste_category',
        field_display: 'Caste Category',
        operator: 'eq',
        value: 'SC',
        original_clause: 'Applicant must belong to Scheduled Caste (SC) category.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'c2',
        field: 'education_level',
        field_display: 'Minimum Qualification',
        operator: 'gte',
        value: '10th',
        unit: 'grade',
        original_clause: 'Must have completed 10th standard matriculation education.',
        mutability: 'MUTABLE',
        confidence: 0.95,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'c3',
        field: 'income_threshold',
        field_display: 'Family Annual Income Limit',
        operator: 'lte',
        value: 250000,
        unit: 'INR',
        original_clause: 'Total annual family income from all sources must not exceed Rs. 2,50,000.',
        mutability: 'MUTABLE',
        confidence: 0.96,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'd1', title: 'Caste Certificate (SC)', required_for_fields: ['caste_category'], issuing_authority: 'Revenue Department / Tehsildar' },
      { id: 'd2', title: 'Annual Family Income Certificate', required_for_fields: ['income_threshold'], issuing_authority: 'Competent Revenue Authority' },
      { id: 'd3', title: '10th Marksheet / Passing Certificate', required_for_fields: ['education_level'], issuing_authority: 'State Secondary Education Board' },
      { id: 'd4', title: 'Aadhaar Card', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
    ],
    benefits: [
      { id: 'b1', title: 'Full Tuition Fee Reimbursement', description: 'Complete coverage of college admission & non-refundable fees.' },
      { id: 'b2', title: 'Monthly Maintenance Allowance', amount: '₹1,200 / mo', frequency: 'Monthly', description: 'Hosteller and day scholar stipend.' },
    ],
    exclusions: [
      { id: 'e1', title: 'Income Tax Payer Exclusion', condition_field: 'income_tax_payer_status', condition_value: 'true', original_clause: 'Students whose parents paid income tax in last assessment year are excluded.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible SC College Student',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'post-matric-sc-scholarship', caste_category: 'SC', education_level: '10th', income_threshold: 190000, income_tax_payer_status: false }
      },
      needs_info: {
        name: 'SC Student (Missing Income Certificate Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'post-matric-sc-scholarship', caste_category: 'SC', education_level: '10th', income_threshold: null, income_tax_payer_status: false }
      },
      ineligible: {
        name: 'Tax Payer Family (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'post-matric-sc-scholarship', caste_category: 'SC', education_level: '10th', income_threshold: 210000, income_tax_payer_status: true }
      }
    }
  },

  // 2. PM-KISAN (Agriculture, English)
  {
    id: 'pm-kisan-samman-nidhi',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    short_name: 'PM-KISAN Income Support',
    category: 'Agriculture',
    state: 'Central',
    language: 'English',
    version: 'v3.0',
    last_amended: '2024-10-05',
    summary: 'Direct income support of ₹6,000 per annum paid in three equal four-monthly installments to cultivable landholding farmer families.',
    key_benefit: '₹6,000 / year (3 installments of ₹2,000 via DBT)',
    source_url: 'https://pmkisan.gov.in',
    verified_on: '2024-10-05',
    conditions: [
      {
        id: 'pm1',
        field: 'occupation',
        field_display: 'Occupation Type',
        operator: 'eq',
        value: 'farmer',
        original_clause: 'All landholding farmer families holding cultivable land.',
        mutability: 'MUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pm2',
        field: 'land_ownership',
        field_display: 'Cultivable Landholding',
        operator: 'lte',
        value: 2.0,
        unit: 'hectares',
        original_clause: 'Small and marginal farmers holding up to 2.0 hectares.',
        mutability: 'MUTABLE',
        confidence: 0.95,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'pm_d1', title: 'Land Record (Patta/Khasra/Khatauni)', required_for_fields: ['land_ownership'], issuing_authority: 'Revenue / Land Records Department' },
      { id: 'pm_d2', title: 'Aadhaar Linked Bank Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Scheduled Commercial Bank' },
    ],
    benefits: [
      { id: 'pm_b1', title: 'Direct Income Support', amount: '₹6,000', frequency: 'Annual (3 x ₹2,000)', description: 'Direct Benefit Transfer into bank account.' },
    ],
    exclusions: [
      { id: 'pm_ex1', title: 'Institutional Landholders', condition_field: 'institutional_landholder', condition_value: 'true', original_clause: 'Institutional landholders are ineligible.', overrides_all: true },
      { id: 'pm_ex2', title: 'Constitutional Post Holders', condition_field: 'constitutional_post_holder', condition_value: 'true', original_clause: 'Present and former holders of constitutional posts.', overrides_all: true },
      { id: 'pm_ex3', title: 'Income Tax Payers', condition_field: 'income_tax_payer_status', condition_value: 'true', original_clause: 'Persons who paid income tax in last assessment year.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Small Farmer (1.2 Hectares)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-kisan-samman-nidhi', occupation: 'farmer', land_ownership: 1.2, institutional_landholder: false, constitutional_post_holder: false, income_tax_payer_status: false }
      },
      needs_info: {
        name: 'Farmer (Missing Land Holding Size)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-kisan-samman-nidhi', occupation: 'farmer', land_ownership: null, institutional_landholder: false, constitutional_post_holder: false, income_tax_payer_status: false }
      },
      ineligible: {
        name: 'Institutional Landholder (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-kisan-samman-nidhi', occupation: 'farmer', land_ownership: 1.2, institutional_landholder: true, income_tax_payer_status: false }
      }
    }
  },

  // 3. KMUT (Women & Child, Tamil)
  {
    id: 'magalir-urimai-thittam',
    title: 'Kalaignar Magalir Urimai Thittam (KMUT)',
    short_name: 'KMUT Women Rights Grant',
    category: 'Women & Child',
    state: 'Tamil Nadu',
    language: 'Tamil',
    version: 'v1.2',
    last_amended: '2024-09-01',
    summary: 'Direct monthly basic income entitlement of ₹1,000 to recognize the uncompensated household labor of female heads of households in Tamil Nadu.',
    key_benefit: '₹1,000 / month direct bank transfer (₹12,000 / year)',
    source_url: 'https://kmut.tn.gov.in',
    verified_on: '2024-09-01',
    conditions: [
      {
        id: 'ta1',
        field: 'gender',
        field_display: 'Gender',
        operator: 'eq',
        value: 'female',
        original_clause: 'விண்ணப்பதாரர் குடும்பத் தலைவியாக இருக்க வேண்டும்.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'ta2',
        field: 'age_min',
        field_display: 'Minimum Age',
        operator: 'gte',
        value: 21,
        unit: 'years',
        original_clause: 'குறைந்தபட்ச வயது 21 ஆண்டுகள் பூர்த்தியடைந்திருக்க வேண்டும்.',
        mutability: 'IMMUTABLE',
        confidence: 0.96,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'ta3',
        field: 'income_threshold',
        field_display: 'Annual Family Income Limit',
        operator: 'lte',
        value: 250000,
        unit: 'INR',
        original_clause: 'குடும்பத்தின் ஆண்டு வருமானம் ரூ. 2.50 லட்சத்திற்கு மிகாமல் இருக்க வேண்டும்.',
        mutability: 'MUTABLE',
        confidence: 0.94,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'ta4',
        field: 'residence_state',
        field_display: 'State of Residence',
        operator: 'eq',
        value: 'Tamil Nadu',
        original_clause: 'தமிழ்நாட்டில் வசிக்கும் குடும்பங்கள்.',
        mutability: 'IMMUTABLE',
        confidence: 0.95,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'ta_d1', title: 'Smart Family Ration Card', required_for_fields: ['head_of_family'], issuing_authority: 'Civil Supplies & Consumer Protection Dept' },
      { id: 'ta_d2', title: 'Aadhaar Card', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'ta_d3', title: 'Bank Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Scheduled Bank' },
    ],
    benefits: [
      { id: 'ta_b1', title: 'Monthly Rights Entitlement', amount: '₹1,000 / mo', frequency: 'Monthly', description: 'Direct bank transfer to woman head of family.' },
    ],
    exclusions: [
      { id: 'ta_ex1', title: 'Income Tax Payers', condition_field: 'income_tax_payer_status', condition_value: 'true', original_clause: 'கடந்த மதிப்பீட்டு ஆண்டில் வருமான வரி செலுத்தியவர்கள் தகுதியற்றவர்.', overrides_all: true },
      { id: 'ta_ex2', title: 'Government Employees', condition_field: 'government_employment_status', condition_value: 'true', original_clause: 'அரசு ஊழியர்கள் மற்றும் ஓய்வூதியதாரர்கள்.', overrides_all: true },
      { id: 'ta_ex3', title: 'Four Wheeler Owners', condition_field: 'owns_vehicle', condition_value: 'true', original_clause: 'சொந்தமாக நான்கு சக்கர வாகனம் (கார், ஜீப்) வைத்திருக்கும் குடும்பங்கள்.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible Female Head (Age 34, Income ₹1.6L)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'magalir-urimai-thittam', gender: 'female', age_min: 34, income_threshold: 160000, residence_state: 'Tamil Nadu', income_tax_payer_status: false, government_employment_status: false, owns_vehicle: false }
      },
      needs_info: {
        name: 'Female Head (Missing Income Information)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'magalir-urimai-thittam', gender: 'female', age_min: 34, income_threshold: null, residence_state: 'Tamil Nadu', income_tax_payer_status: false, government_employment_status: false, owns_vehicle: false }
      },
      ineligible: {
        name: 'Four-Wheeler Car Owner (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'magalir-urimai-thittam', gender: 'female', age_min: 34, income_threshold: 160000, residence_state: 'Tamil Nadu', income_tax_payer_status: false, government_employment_status: false, owns_vehicle: true }
      }
    }
  },

  // 4. Ayushman Bharat PM-JAY (Health, English)
  {
    id: 'pm-jay-ayushman-bharat',
    title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    short_name: 'PM-JAY Health Cover',
    category: 'Health',
    state: 'Central / Universal',
    language: 'English',
    version: 'v2.0',
    last_amended: '2024-10-29',
    summary: 'Cashless hospitalisation health cover up to ₹5 Lakh per family per year, including the newly approved universal coverage expansion for all citizens aged 70+.',
    key_benefit: '₹5,00,000 cashless cover / family / year (+ universal 70+ senior top-up)',
    source_url: 'https://pmjay.gov.in',
    verified_on: '2024-10-29',
    conditions: [
      {
        id: 'pmjay_c1',
        field: 'bpl_status',
        field_display: 'SECC Deprivation / BPL Status',
        operator: 'eq',
        value: true,
        original_clause: 'Families identified under SECC 2011 deprivation criteria or all senior citizens aged 70+.',
        mutability: 'MUTABLE',
        confidence: 0.97,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'pmjay_d1', title: 'Aadhaar Card for e-KYC', required_for_fields: ['identity', 'age'], issuing_authority: 'UIDAI' },
      { id: 'pmjay_d2', title: 'Ration Card / Family Composite ID', required_for_fields: ['family_id'], issuing_authority: 'State Food & Civil Supplies Dept' },
    ],
    benefits: [
      { id: 'pmjay_b1', title: 'Cashless Inpatient Care', amount: '₹5,00,000', frequency: 'Annual Floater', description: 'Coverage for secondary and tertiary hospitalization in empaneled hospitals.' },
    ],
    exclusions: [
      { id: 'pmjay_e1', title: 'Duplicate Central Health Schemes', condition_field: 'existing_scheme_beneficiary', condition_value: 'cghs_echs_capf', original_clause: 'Beneficiary families already covered under CGHS, ECHS, or CAPF cannot claim duplicate PM-JAY.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'SECC Deprived Rural Family',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-jay-ayushman-bharat', bpl_status: true, existing_scheme_beneficiary: 'none' }
      },
      needs_info: {
        name: 'Citizen (Missing SECC/BPL Verification Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-jay-ayushman-bharat', bpl_status: null, existing_scheme_beneficiary: 'none' }
      },
      ineligible: {
        name: 'Already Enrolled in CGHS (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-jay-ayushman-bharat', bpl_status: true, existing_scheme_beneficiary: 'cghs_echs_capf' }
      }
    }
  },

  // 5. PM Ujjwala Yojana (Women & Child, Hindi)
  {
    id: 'pm-ujjwala-yojana',
    title: 'प्रधानमंत्री उज्ज्वला योजना 2.0 (PMUY)',
    short_name: 'PM Ujjwala LPG',
    category: 'Women & Child',
    state: 'Central',
    language: 'Hindi',
    version: 'v2.0',
    last_amended: '2024-08-01',
    summary: 'गरीबी रेखा से नीचे जीवन यापन करने वाली वयस्क महिलाओं को निःशुल्क एलपीजी गैस कनेक्शन, प्रथम रिफिल और गैस चूल्हा प्रदान करने की योजना।',
    key_benefit: 'निःशुल्क एलपीजी गैस कनेक्शन + पहला 14.2kg रिफिल व गैस चूल्हा',
    source_url: 'https://www.pmuy.gov.in',
    verified_on: '2024-08-01',
    conditions: [
      {
        id: 'pmuy_c1',
        field: 'gender',
        field_display: 'Gender (लिंग)',
        operator: 'eq',
        value: 'female',
        original_clause: 'आवेदक एक वयस्क महिला होनी चाहिए।',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pmuy_c2',
        field: 'age_min',
        field_display: 'Minimum Age (न्यूनतम आयु)',
        operator: 'gte',
        value: 18,
        unit: 'years',
        original_clause: 'न्यूनतम आयु 18 वर्ष या उससे अधिक होनी चाहिए।',
        mutability: 'IMMUTABLE',
        confidence: 0.96,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pmuy_c3',
        field: 'bpl_status',
        field_display: 'BPL / Poor Household (बीपीएल स्थिति)',
        operator: 'eq',
        value: true,
        original_clause: 'आवेदक गरीबी रेखा से नीचे (BPL) अथवा निर्धन परिवार से संबंधित होनी चाहिए।',
        mutability: 'MUTABLE',
        confidence: 0.95,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pmuy_c4',
        field: 'has_lpg_connection',
        field_display: 'No Existing Gas Connection (गैस कनेक्शन अनुपलब्धता)',
        operator: 'eq',
        value: false,
        original_clause: 'परिवार में पहले से कोई सक्रिय एलपीजी गैस कनेक्शन नहीं होना चाहिए।',
        mutability: 'MUTABLE',
        confidence: 0.97,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'pmuy_d1', title: 'आधार कार्ड (पहचान व पता प्रमाण)', required_for_fields: ['identity', 'age'], issuing_authority: 'UIDAI' },
      { id: 'pmuy_d2', title: 'बीपीएल राशन कार्ड अथवा 14-सूत्रीय घोषणा पत्र', required_for_fields: ['bpl_status'], issuing_authority: 'खाद्य एवं नागरिक आपूर्ति विभाग' },
      { id: 'pmuy_d3', title: 'बैंक खाता पासबुक', required_for_fields: ['bank_account'], issuing_authority: 'मान्यता प्राप्त बैंक' },
    ],
    benefits: [
      { id: 'pmuy_b1', title: 'निःशुल्क एलपीजी गैस कनेक्शन व किट', amount: '₹1,600', frequency: 'One-time', description: 'सिक्योरिटी डिपॉजिट माफी, भरा हुआ गैस सिलेंडर और चूल्हा।' },
    ],
    exclusions: [
      { id: 'pmuy_e1', title: 'पहले से एलपीजी कनेक्शन मौजूद होना', condition_field: 'has_lpg_connection', condition_value: 'true', original_clause: 'जिस परिवार के घर में पहले से कोई एलपीजी गैस कनेक्शन मौजूद है, वह अपात्र है।', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'पात्र बीपीएल वयस्क महिला (आयु 26 वर्ष)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-ujjwala-yojana', gender: 'female', age_min: 26, bpl_status: true, has_lpg_connection: false }
      },
      needs_info: {
        name: 'महिला आवेदक (गैस कनेक्शन तथ्य अधूरा)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-ujjwala-yojana', gender: 'female', age_min: 26, bpl_status: true, has_lpg_connection: null }
      },
      ineligible: {
        name: 'पहले से गैस कनेक्शन युक्त परिवार (अपात्र)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-ujjwala-yojana', gender: 'female', age_min: 26, bpl_status: true, has_lpg_connection: true }
      }
    }
  },

  // 6. PMAY-G (Housing, English)
  {
    id: 'pmay-g-housing',
    title: 'Pradhan Mantri Awaas Yojana - Gramin (PMAY-G)',
    short_name: 'PMAY-G Rural Housing',
    category: 'Housing',
    state: 'Central',
    language: 'English',
    version: 'v2.0',
    last_amended: '2024-08-09',
    summary: 'Direct financial assistance to houseless rural families or households living in kutcha or dilapidated houses for the construction of pucca homes.',
    key_benefit: '₹1,20,000 financial grant + ₹12,000 SBM toilet assistance',
    source_url: 'https://pmayg.nic.in',
    verified_on: '2024-08-09',
    conditions: [
      {
        id: 'pmay_c1',
        field: 'house_type',
        field_display: 'Current House Condition',
        operator: 'in',
        value: ['kutcha', 'dilapidated', 'houseless'],
        original_clause: 'Living in houseless condition or in zero, one or two-room kutcha houses with kutcha roof and walls.',
        mutability: 'MUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pmay_c2',
        field: 'owns_vehicle',
        field_display: 'Vehicle Non-Ownership',
        operator: 'eq',
        value: false,
        original_clause: 'Households not owning motorized two, three, or four-wheelers.',
        mutability: 'MUTABLE',
        confidence: 0.96,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'pmay_d1', title: 'Valid Aadhaar Card', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'pmay_d2', title: 'MGNREGA Job Card', required_for_fields: ['unskilled_labor'], issuing_authority: 'Gram Panchayat' },
      { id: 'pmay_d3', title: 'Bank Account Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Bank' },
    ],
    benefits: [
      { id: 'pmay_b1', title: 'House Construction Grant', amount: '₹1,20,000', frequency: 'Milestone DBT', description: 'Transferred directly across foundation, plinth, and lintel stages.' },
      { id: 'pmay_b2', title: 'Swachh Bharat Toilet Grant', amount: '₹12,000', frequency: 'One-time', description: 'SBM-G assistance for sanitation facility.' },
    ],
    exclusions: [
      { id: 'pmay_e1', title: 'Pucca House Ownership', condition_field: 'house_type', condition_value: 'pucca', original_clause: 'Households already owning a pucca house are disqualified.', overrides_all: true },
      { id: 'pmay_e2', title: 'Motorized Vehicle Ownership', condition_field: 'owns_vehicle', condition_value: 'true', original_clause: 'Households owning motorized two, three, or four-wheelers.', overrides_all: true },
      { id: 'pmay_e3', title: 'Government Employee in Family', condition_field: 'government_employment_status', condition_value: 'true', original_clause: 'Having any regular government or PSU employee in the household.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Houseless Rural Family (Kutcha House)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pmay-g-housing', house_type: 'kutcha', owns_vehicle: false, government_employment_status: false, income_tax_payer_status: false }
      },
      needs_info: {
        name: 'Kutcha Resident (Missing Vehicle Ownership Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pmay-g-housing', house_type: 'kutcha', owns_vehicle: null, government_employment_status: false }
      },
      ineligible: {
        name: 'Already Owns Pucca House (Disqualified)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pmay-g-housing', house_type: 'pucca', owns_vehicle: false, government_employment_status: false }
      }
    }
  },

  // 7. IGNOAPS (Pension, Hindi)
  {
    id: 'ignoaps-pension',
    title: 'इंद्रा गांधी राष्ट्रीय वृद्धावस्था पेंशन योजना (IGNOAPS)',
    short_name: 'IGNOAPS Old Age Pension',
    category: 'Pension',
    state: 'Central',
    language: 'Hindi',
    version: 'v1.5',
    last_amended: '2024-07-20',
    summary: 'गरीबी रेखा से नीचे जीवन यापन करने वाले 60 वर्ष या उससे अधिक आयु के वरिष्ठ नागरिकों के लिए मासिक सामाजिक सुरक्षा पेंशन।',
    key_benefit: '₹500 / माह (60-79 वर्ष) / ₹1,000 / माह (80+ वर्ष)',
    source_url: 'https://nsap.nic.in',
    verified_on: '2024-07-20',
    conditions: [
      {
        id: 'ig_c1',
        field: 'age_min',
        field_display: 'Senior Citizen Age (आयु)',
        operator: 'gte',
        value: 60,
        unit: 'years',
        original_clause: 'आवेदक की आयु 60 वर्ष या उससे अधिक होनी चाहिए।',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'ig_c2',
        field: 'bpl_status',
        field_display: 'BPL Family Status (बीपीएल स्थिति)',
        operator: 'eq',
        value: true,
        original_clause: 'आवेदक गरीबी रेखा से नीचे (BPL) जीवन यापन करने वाले परिवार से संबंधित होना चाहिए।',
        mutability: 'MUTABLE',
        confidence: 0.95,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'ig_d1', title: 'आयु प्रमाण पत्र (मतदाता पहचान पत्र अथवा जन्म प्रमाण पत्र)', required_for_fields: ['age'], issuing_authority: 'चुनाव आयोग / नगर पालिका' },
      { id: 'ig_d2', title: 'बीपीएल राशन कार्ड', required_for_fields: ['bpl_status'], issuing_authority: 'खाद्य एवं रसद विभाग' },
      { id: 'ig_d3', title: 'आधार कार्ड व बैंक पासबुक', required_for_fields: ['identity', 'bank_account'], issuing_authority: 'UIDAI / बैंक' },
    ],
    benefits: [
      { id: 'ig_b1', title: 'मासिक वृद्धावस्था पेंशन', amount: '₹500 - ₹1,000 / माह', frequency: 'Monthly', description: 'प्रत्येक माह सीधे बैंक खाते में प्रेषित।' },
    ],
    exclusions: [
      { id: 'ig_e1', title: 'अन्य सामाजिक पेंशन धारक', condition_field: 'has_pension_scheme', condition_value: 'true', original_clause: 'अन्य सरकारी सामाजिक सुरक्षा पेंशन प्राप्तकर्ता अपात्र हैं।', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'वरिष्ठ बीपीएल नागरिक (आयु 67 वर्ष)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'ignoaps-pension', age_min: 67, bpl_status: true, has_pension_scheme: false }
      },
      needs_info: {
        name: 'वरिष्ठ नागरिक (बीपीएल प्रमाण पत्र अज्ञात)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'ignoaps-pension', age_min: 67, bpl_status: null, has_pension_scheme: false }
      },
      ineligible: {
        name: 'अल्पायु नागरिक (आयु 54 वर्ष - अपात्र)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'ignoaps-pension', age_min: 54, bpl_status: true, has_pension_scheme: false }
      }
    }
  },

  // 8. APY (Pension, English)
  {
    id: 'atal-pension-yojana',
    title: 'Atal Pension Yojana (APY)',
    short_name: 'Atal Pension Yojana',
    category: 'Pension',
    state: 'Central',
    language: 'English',
    version: 'v2.2',
    last_amended: '2024-09-10',
    summary: 'Government-backed guaranteed minimum pension of ₹1,000 to ₹5,000 per month for unorganized workers from age 60; strictly excludes income tax payers since October 1, 2022.',
    key_benefit: 'Guaranteed ₹1,000 to ₹5,000 / month pension from age 60',
    source_url: 'https://www.jansuraksha.gov.in',
    verified_on: '2024-09-10',
    conditions: [
      {
        id: 'apy_c1',
        field: 'age_min',
        field_display: 'Minimum Entry Age',
        operator: 'gte',
        value: 18,
        unit: 'years',
        original_clause: 'Any Indian citizen aged between 18 and 40 years.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'apy_c2',
        field: 'age_max',
        field_display: 'Maximum Entry Age',
        operator: 'lte',
        value: 40,
        unit: 'years',
        original_clause: 'Maximum entry age of 40 years on date of joining.',
        mutability: 'IMMUTABLE',
        confidence: 0.97,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'apy_c3',
        field: 'income_tax_payer_status',
        field_display: 'Non-Taxpayer Declaration',
        operator: 'eq',
        value: false,
        original_clause: 'Applicant must not be an income tax payer under Income Tax Act.',
        mutability: 'MUTABLE',
        confidence: 0.99,
        language: 'en',
        is_current: true,
        valid_from: '2022-10-01',
      },
    ],
    documents: [
      { id: 'apy_d1', title: 'Valid Aadhaar Card', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'apy_d2', title: 'Active Savings Bank Passbook', required_for_fields: ['auto_debit'], issuing_authority: 'Bank / Post Office' },
    ],
    benefits: [
      { id: 'apy_b1', title: 'Guaranteed Monthly Pension', amount: '₹1,000 - ₹5,000 / mo', frequency: 'Monthly from age 60', description: 'Guaranteed pension by Government of India with corpus return to nominee.' },
    ],
    exclusions: [
      { id: 'apy_e1', title: 'Income Tax Payer Statutory Exclusion', condition_field: 'income_tax_payer_status', condition_value: 'true', original_clause: 'Persons who are or have been income tax payers are strictly disqualified from joining APY as of Oct 1, 2022.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Unorganized Sector Worker (Age 27, Non-Taxpayer)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'atal-pension-yojana', age_min: 27, age_max: 27, income_tax_payer_status: false }
      },
      needs_info: {
        name: 'Worker (Income Tax Payer Status Missing)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'atal-pension-yojana', age_min: 27, age_max: 27, income_tax_payer_status: null }
      },
      ineligible: {
        name: 'Income Tax Payer (Disqualified under 2022 Rule)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'atal-pension-yojana', age_min: 27, age_max: 27, income_tax_payer_status: true }
      }
    }
  },

  // 9. Sukanya Samriddhi Yojana (Women & Child, English)
  {
    id: 'sukanya-samriddhi-yojana',
    title: 'Sukanya Samriddhi Account Scheme (SSY)',
    short_name: 'Sukanya Samriddhi Account',
    category: 'Women & Child',
    state: 'Central',
    language: 'English',
    version: 'v2.0',
    last_amended: '2024-10-01',
    summary: 'Government-backed high-yield small savings scheme for girl children below 10 years of age with sovereign backed 8.2% p.a. interest and triple tax exemption (EEE).',
    key_benefit: '8.2% p.a. sovereign interest + tax exemption (Section 80C)',
    source_url: 'https://www.nsiindia.gov.in',
    verified_on: '2024-10-01',
    conditions: [
      {
        id: 'ssy_c1',
        field: 'gender',
        field_display: 'Girl Child Beneficiary',
        operator: 'eq',
        value: 'female',
        original_clause: 'Opened in the name of an Indian girl child.',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'ssy_c2',
        field: 'child_age',
        field_display: 'Child Age Ceiling',
        operator: 'lte',
        value: 10,
        unit: 'years',
        original_clause: 'From birth until the girl child attains the age of 10 years.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'ssy_d1', title: 'Birth Certificate of Girl Child', required_for_fields: ['child_age'], issuing_authority: 'Registrar of Births & Deaths' },
      { id: 'ssy_d2', title: 'Guardian Aadhaar & Photo', required_for_fields: ['guardian_identity'], issuing_authority: 'UIDAI' },
    ],
    benefits: [
      { id: 'ssy_b1', title: 'Sovereign High Yield Savings', amount: '8.2% p.a.', frequency: 'Compounded Annually', description: 'Highest interest rate among small savings schemes with Section 80C and Section 10(10D) tax exemption.' },
    ],
    exclusions: [
      { id: 'ssy_e1', title: 'More than Two Accounts Per Family', condition_field: 'existing_scheme_beneficiary', condition_value: 'exceeded_max_accounts', original_clause: 'Opening of third account in a family without twin/triplet documentation is prohibited.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible Girl Child (Age 5 Years)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'sukanya-samriddhi-yojana', gender: 'female', child_age: 5, existing_scheme_beneficiary: 'none' }
      },
      needs_info: {
        name: 'Child Profile (Missing Age Proof Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'sukanya-samriddhi-yojana', gender: 'female', child_age: null, existing_scheme_beneficiary: 'none' }
      },
      ineligible: {
        name: 'Girl Child Over 10 Years (Exceeds Age Limit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'sukanya-samriddhi-yojana', gender: 'female', child_age: 12, existing_scheme_beneficiary: 'none' }
      }
    }
  },

  // 10. NMMSS (Education, English)
  {
    id: 'nmmss-scholarship',
    title: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    short_name: 'NMMSS Merit Scholarship',
    category: 'Education',
    state: 'Central',
    language: 'English',
    version: 'v1.8',
    last_amended: '2024-08-15',
    summary: 'Scholarship assistance of ₹12,000 per year for meritorious students of economically weaker sections studying in Class VIII in government or aided schools to prevent dropouts.',
    key_benefit: '₹12,000 / year (₹1,000 / month from Class IX to XII)',
    source_url: 'https://dsel.education.gov.in',
    verified_on: '2024-08-15',
    conditions: [
      {
        id: 'nm_c1',
        field: 'education_level',
        field_display: 'Class of Study',
        operator: 'eq',
        value: '8th',
        original_clause: 'Regular students studying in Class VIII in government or aided schools.',
        mutability: 'MUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'nm_c2',
        field: 'academic_percentage',
        field_display: 'Minimum Class VII Marks',
        operator: 'gte',
        value: 55,
        unit: 'percentage',
        original_clause: 'At least 55% marks in Class VII examination (50% for SC/ST).',
        mutability: 'MUTABLE',
        confidence: 0.96,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'nm_c3',
        field: 'income_threshold',
        field_display: 'Parental Annual Income Limit',
        operator: 'lte',
        value: 350000,
        unit: 'INR',
        original_clause: 'Parental income from all sources must not exceed Rs. 3,50,000 per annum.',
        mutability: 'MUTABLE',
        confidence: 0.95,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'nm_d1', title: 'Class VII Marksheet / Report Card', required_for_fields: ['academic_percentage'], issuing_authority: 'School Headmaster' },
      { id: 'nm_d2', title: 'Income Certificate', required_for_fields: ['income_threshold'], issuing_authority: 'Revenue Authority' },
      { id: 'nm_d3', title: 'Aadhaar Linked Bank Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Bank' },
    ],
    benefits: [
      { id: 'nm_b1', title: 'Secondary School Scholarship', amount: '₹12,000 / yr', frequency: 'Annual DBT', description: 'Disbursed directly into student account through National Scholarship Portal.' },
    ],
    exclusions: [
      { id: 'nm_e1', title: 'Private & Residential School Students', condition_field: 'school_type', condition_value: 'private', original_clause: 'Students studying in KVS, JNV, Sainik Schools, or private schools are not eligible.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Meritorious Class VIII Student (72% Marks, ₹2.1L Income)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'nmmss-scholarship', education_level: '8th', academic_percentage: 72, income_threshold: 210000, school_type: 'government' }
      },
      needs_info: {
        name: 'Student (Missing Class VII Marks Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'nmmss-scholarship', education_level: '8th', academic_percentage: null, income_threshold: 210000, school_type: 'government' }
      },
      ineligible: {
        name: 'Private School Student (Statutory Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'nmmss-scholarship', education_level: '8th', academic_percentage: 85, income_threshold: 180000, school_type: 'private' }
      }
    }
  },

  // 11. Pudhumai Penn (Education, Tamil)
  {
    id: 'pudhumai-penn-scheme',
    title: 'புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் நினைவு உயர்கல்வி உறுதித் திட்டம்)',
    short_name: 'Pudhumai Penn Higher Ed',
    category: 'Education',
    state: 'Tamil Nadu',
    language: 'Tamil',
    version: 'v1.2',
    last_amended: '2024-09-01',
    summary: 'அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்து தமிழ்நாட்டில் உள்ள கல்லூரிகளில் உயர்கல்வி பயிலும் மாணவிகளுக்கு மாதம் ரூ. 1,000 உதவித்தொகை வழங்கும் திட்டம்.',
    key_benefit: 'மாதம் ரூ. 1,000 உதவித்தொகை (ஆண்டுக்கு ரூ. 12,000 DBT)',
    source_url: 'https://penkalvi.tn.gov.in',
    verified_on: '2024-09-01',
    conditions: [
      {
        id: 'pp_c1',
        field: 'gender',
        field_display: 'Gender (மாணவி)',
        operator: 'eq',
        value: 'female',
        original_clause: 'உயர்கல்வி பயிலும் மாணவிகள் இத்திட்டத்திற்கு தகுதியானவர்கள்.',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pp_c2',
        field: 'education_level',
        field_display: 'Education Level (உயர்கல்வி சேர்க்கை)',
        operator: 'gte',
        value: '12th',
        unit: 'grade',
        original_clause: '12-ஆம் வகுப்பு முடித்து கல்லூரிகளில் சேர்ந்த மாணவிகள்.',
        mutability: 'MUTABLE',
        confidence: 0.97,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pp_c3',
        field: 'school_type',
        field_display: 'Govt School Study (அரசுப் பள்ளி படிப்பு)',
        operator: 'eq',
        value: 'government',
        original_clause: 'அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்த மாணவிகள்.',
        mutability: 'MUTABLE',
        confidence: 0.98,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'pp_c4',
        field: 'residence_state',
        field_display: 'State of Residence',
        operator: 'eq',
        value: 'Tamil Nadu',
        original_clause: 'தமிழ்நாட்டில் உள்ள கல்லூரிகளில் பயில்பவர்கள்.',
        mutability: 'IMMUTABLE',
        confidence: 0.96,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'pp_d1', title: 'பள்ளி மாற்றுச் சான்றிதழ் (TC) 6-12 அரசுப் பள்ளி படிப்பு', required_for_fields: ['school_type'], issuing_authority: 'பள்ளி தலைமை ஆசிரியர்' },
      { id: 'pp_d2', title: 'கல்லூரி சேர்க்கை அட்டை & ஆதார் அட்டை', required_for_fields: ['education_level', 'identity'], issuing_authority: 'கல்லூரி முதல்வர் / UIDAI' },
      { id: 'pp_d3', title: 'மாணவியின் வங்கி கணக்கு பாஸ்புக்', required_for_fields: ['bank_account'], issuing_authority: 'வங்கி' },
    ],
    benefits: [
      { id: 'pp_b1', title: 'மாதாந்திர உயர்கல்வி உதவித்தொகை', amount: '₹1,000 / மாதம்', frequency: 'Monthly DBT', description: 'பட்டப்படிப்பு அல்லது பட்டயப்படிப்பு முடியும் வரை வங்கி கணக்கில் வரவு வைக்கப்படும்.' },
    ],
    exclusions: [
      { id: 'pp_e1', title: 'தனியார் பள்ளிகளில் படித்தவர்கள்', condition_field: 'school_type', condition_value: 'private', original_clause: 'தனியார் பள்ளிகளில் பயின்ற மாணவிகளுக்கு இத்திட்டம் பொருந்தாது.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'அரசுப் பள்ளி மாணவி (கல்லூரி முதலாம் ஆண்டு)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pudhumai-penn-scheme', gender: 'female', education_level: '12th', school_type: 'government', residence_state: 'Tamil Nadu' }
      },
      needs_info: {
        name: 'மாணவி (பள்ளி வகை சான்றிதழ் விவரம் அறியப்படவில்லை)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pudhumai-penn-scheme', gender: 'female', education_level: '12th', school_type: null, residence_state: 'Tamil Nadu' }
      },
      ineligible: {
        name: 'தனியார் பள்ளி மாணவி (அபாத்ரர் / தகுதியற்றவர்)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pudhumai-penn-scheme', gender: 'female', education_level: '12th', school_type: 'private', residence_state: 'Tamil Nadu' }
      }
    }
  },

  // 12. AP YSR Cheyutha (Women & Child / Social Welfare, Telugu)
  {
    id: 'ap-cheyutha-thalliki-vandanam',
    title: 'వైఎస్సార్ చేయూత పథకం (AP YSR Cheyutha Scheme)',
    short_name: 'AP YSR Cheyutha',
    category: 'Women & Child',
    state: 'Andhra Pradesh',
    language: 'Telugu',
    version: 'v1.4',
    last_amended: '2024-06-30',
    summary: 'ఆంధ్రప్రదేశ్ రాష్ట్రంలో 45 నుండి 60 సంవత్సరాల మధ్య వయస్సు గల ఎస్సీ, ఎస్టీ, బీసీ మరియు మైనారిటీ మహిళలకు వార్షిక ఆర్థిక సహాయం అందించే పథకం.',
    key_benefit: '₹18,750 / ఏడాదికి (మొత్తం ₹75,000 నాలుగు సంవత్సరాలలో DBT)',
    source_url: 'https://navasakam.ap.gov.in',
    verified_on: '2024-06-30',
    conditions: [
      {
        id: 'cy_c1',
        field: 'gender',
        field_display: 'Gender (మహిళ)',
        operator: 'eq',
        value: 'female',
        original_clause: 'ఆంధ్రప్రదేశ్ రాష్ట్రానికి చెందిన మహిళలు అర్హులు.',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'cy_c2',
        field: 'age_min',
        field_display: 'Minimum Age (కనీస వయస్సు)',
        operator: 'gte',
        value: 45,
        unit: 'years',
        original_clause: '45 నుండి 60 సంవత్సరాల మధ్య వయస్సు గల మహిళలు.',
        mutability: 'IMMUTABLE',
        confidence: 0.97,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'cy_c3',
        field: 'age_max',
        field_display: 'Maximum Age (గరిష్ట వయస్సు)',
        operator: 'lte',
        value: 60,
        unit: 'years',
        original_clause: 'గరిష్ట వయస్సు 60 సంవత్సరాలు మించరాదు.',
        mutability: 'IMMUTABLE',
        confidence: 0.97,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'cy_c4',
        field: 'caste_category',
        field_display: 'Caste Category (కుల వర్గం)',
        operator: 'in',
        value: ['SC', 'ST', 'BC', 'MINORITY'],
        original_clause: 'ఎస్సీ, ఎస్టీ, బీసీ మరియు మైనారిటీ వర్గాల మహిళలు.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'cy_c5',
        field: 'residence_state',
        field_display: 'State of Residence',
        operator: 'eq',
        value: 'Andhra Pradesh',
        original_clause: 'ఆంధ్రప్రదేశ్ రాష్ట్ర నివాసితులు.',
        mutability: 'IMMUTABLE',
        confidence: 0.95,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'cy_d1', title: 'కుల ధృవీకరణ పత్రం (Caste Certificate)', required_for_fields: ['caste_category'], issuing_authority: 'మీసేవా / రెవెన్యూ శాఖ' },
      { id: 'cy_d2', title: 'ఆధార్ కార్డు & వయస్సు ధృవీకరణ పత్రం', required_for_fields: ['identity', 'age'], issuing_authority: 'UIDAI' },
      { id: 'cy_d3', title: 'బ్యాంక్ పాస్ బుక్', required_for_fields: ['bank_account'], issuing_authority: 'బ్యాంక్' },
    ],
    benefits: [
      { id: 'cy_b1', title: 'వార్షిక ఆర్థిక సహాయం', amount: '₹18,750 / ఏడాదికి', frequency: 'Annual DBT (4 years)', description: 'మహిళా సాధికారత మరియు జీవనోపాధి కోసం ప్రత్యక్ష నగదు బదిలీ.' },
    ],
    exclusions: [
      { id: 'cy_e1', title: 'ప్రభుత్వ ఉద్యోగులు', condition_field: 'government_employment_status', condition_value: 'true', original_clause: 'కుటుంబంలో ఎవరైనా ప్రభుత్వ ఉద్యోగి ఉన్నా అనర్హులు.', overrides_all: true },
      { id: 'cy_e2', title: 'నాలుగు చక్రాల వాహనం ఉన్నవారు', condition_field: 'owns_vehicle', condition_value: 'true', original_clause: 'నాలుగు చక్రాల వాహనం ఉన్న కుటుంబాలు అనర్హులు.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'అర్హతగల బీసీ మహిళ (వయస్సు 52 ఏళ్ళు, ఏపీ నివాసి)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'ap-cheyutha-thalliki-vandanam', gender: 'female', age_min: 52, age_max: 52, caste_category: 'BC', residence_state: 'Andhra Pradesh', government_employment_status: false, owns_vehicle: false }
      },
      needs_info: {
        name: 'మహిళా దరఖాస్తుదారు (కుల వివరాలు తెలపబడలేదు)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'ap-cheyutha-thalliki-vandanam', gender: 'female', age_min: 52, age_max: 52, caste_category: null, residence_state: 'Andhra Pradesh', government_employment_status: false, owns_vehicle: false }
      },
      ineligible: {
        name: 'ప్రభుత్వ ఉద్యోగి కుటుంబం (అనర్హత)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'ap-cheyutha-thalliki-vandanam', gender: 'female', age_min: 52, age_max: 52, caste_category: 'BC', residence_state: 'Andhra Pradesh', government_employment_status: true, owns_vehicle: false }
      }
    }
  },

  // 13. PM Vishwakarma (Livelihood, English)
  {
    id: 'pm-vishwakarma-scheme',
    title: 'Pradhan Mantri Vishwakarma Scheme',
    short_name: 'PM Vishwakarma Artisan',
    category: 'Livelihood',
    state: 'Central',
    language: 'English',
    version: 'v1.0',
    last_amended: '2024-09-17',
    summary: 'Holistic end-to-end support for traditional artisans and craftspeople across 18 trades, providing recognized PM Vishwakarma certification, toolkit grants of ₹15,000, and subsidized collateral-free enterprise credit up to ₹3 Lakh.',
    key_benefit: '₹15,000 toolkit grant + ₹3,00,000 collateral-free credit @ 5%',
    source_url: 'https://pmvishwakarma.gov.in',
    verified_on: '2024-09-17',
    conditions: [
      {
        id: 'vk_c1',
        field: 'occupation',
        field_display: 'Artisan Occupation',
        operator: 'eq',
        value: 'artisan',
        original_clause: 'Artisan or craftsperson working with hands and tools.',
        mutability: 'MUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'vk_c2',
        field: 'age_min',
        field_display: 'Minimum Registration Age',
        operator: 'gte',
        value: 18,
        unit: 'years',
        original_clause: 'Minimum age of 18 years on date of registration.',
        mutability: 'IMMUTABLE',
        confidence: 0.97,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'vk_c3',
        field: 'trade',
        field_display: 'Recognized Traditional Trade',
        operator: 'in',
        value: ['carpenter', 'blacksmith', 'potter', 'sculptor', 'cobbler', 'tailor', 'mason', 'boat_builder', 'barber', 'basket_maker', 'locksmith', 'goldsmith', 'hammer_maker', 'doll_maker', 'garland_maker', 'washerman', 'weaver', 'traditional_artisan'],
        original_clause: 'Engaged in one of 18 recognized traditional trades on a self-employment basis.',
        mutability: 'MUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'vk_d1', title: 'Artisan Trade Declaration / Verification', required_for_fields: ['trade'], issuing_authority: 'Gram Panchayat / Urban Local Body' },
      { id: 'vk_d2', title: 'Aadhaar Card for Biometric e-KYC', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'vk_d3', title: 'Active Bank Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Bank' },
    ],
    benefits: [
      { id: 'vk_b1', title: 'Toolkit Incentive Grant', amount: '₹15,000', frequency: 'One-time e-RUPI', description: 'Digital voucher for procurement of modern toolkits.' },
      { id: 'vk_b2', title: 'Collateral-Free Concessional Credit', amount: '₹3,00,000', frequency: 'Two Tranches', description: 'Tranche 1 up to ₹1 Lakh and Tranche 2 up to ₹2 Lakh at 5% interest.' },
    ],
    exclusions: [
      { id: 'vk_e1', title: 'Government Employee Family', condition_field: 'government_employment_status', condition_value: 'true', original_clause: 'Regular government employees and their family members are excluded.', overrides_all: true },
      { id: 'vk_e2', title: 'Active Credit Defaulters', condition_field: 'existing_scheme_beneficiary', condition_value: 'defaulted_mudra_pmegp', original_clause: 'Active defaulters of self-employment loan schemes are ineligible.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Traditional Carpenter Artisan (Age 36)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-vishwakarma-scheme', occupation: 'artisan', age_min: 36, trade: 'carpenter', government_employment_status: false, existing_scheme_beneficiary: 'none' }
      },
      needs_info: {
        name: 'Artisan (Trade Unspecified / Missing)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-vishwakarma-scheme', occupation: 'artisan', age_min: 36, trade: null, government_employment_status: false, existing_scheme_beneficiary: 'none' }
      },
      ineligible: {
        name: 'Government Employee Family (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-vishwakarma-scheme', occupation: 'artisan', age_min: 36, trade: 'carpenter', government_employment_status: true, existing_scheme_beneficiary: 'none' }
      }
    }
  },

  // 14. Pradhan Mantri Matru Vandana Yojana (PMMVY) - Women & Child, Hindi
  {
    id: 'pm-matru-vandana-yojana',
    title: 'प्रधानमंत्री मातृ वंदना योजना (PMMVY)',
    short_name: 'PM Matru Vandana (PMMVY)',
    category: 'Women & Child',
    state: 'Central',
    language: 'Hindi',
    version: 'v2.0',
    last_amended: '2024-07-01',
    summary: 'गर्भवती महिलाओं और स्तनपान कराने वाली माताओं के स्वास्थ्य और पोषण में सुधार हेतु ₹5,000 की प्रत्यक्ष नकद सहायता (Direct Benefit Transfer)।',
    key_benefit: '₹5,000 मातृत्व नकद प्रोत्साहन (2 किस्तों में DBT)',
    source_url: 'https://pmmvy.wcd.gov.in',
    verified_on: '2024-07-01',
    conditions: [
      {
        id: 'mv1',
        field: 'gender',
        field_display: 'Gender',
        operator: 'eq',
        value: 'female',
        original_clause: 'आवेदक महिला होनी चाहिए।',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'mv2',
        field: 'age_min',
        field_display: 'Minimum Age',
        operator: 'gte',
        value: 19,
        unit: 'years',
        original_clause: 'गर्भवती महिला की न्यूनतम आयु 19 वर्ष या उससे अधिक होनी चाहिए।',
        mutability: 'IMMUTABLE',
        confidence: 0.97,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'mv3',
        field: 'is_pregnant_or_lactating',
        field_display: 'Maternity Status',
        operator: 'eq',
        value: true,
        original_clause: 'महिला प्रथम जीवित बच्चे के लिए गर्भवती अथवा धात्री माता होनी चाहिए।',
        mutability: 'MUTABLE',
        confidence: 0.96,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'mv_d1', title: 'Mother and Child Protection (MCP) Card', required_for_fields: ['is_pregnant_or_lactating'], issuing_authority: 'Ministry of Health and Family Welfare' },
      { id: 'mv_d2', title: 'Aadhaar Card of Beneficiary', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'mv_d3', title: 'Aadhaar Linked Bank Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Scheduled Commercial Bank' },
    ],
    benefits: [
      { id: 'mv_b1', title: 'First Installment (Early Registration)', amount: '₹3,000', frequency: 'One-time', description: 'Credited on early registration of pregnancy.' },
      { id: 'mv_b2', title: 'Second Installment (Birth & Immunization)', amount: '₹2,00,0', frequency: 'One-time', description: 'Credited after institutional birth and child immunization.' },
    ],
    exclusions: [
      { id: 'mv_ex1', title: 'Regular Government Employees', condition_field: 'government_employment_status', condition_value: 'true', original_clause: 'Women in regular employment with Central or State Government or PSUs are excluded.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible Pregnant Woman (Age 24)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-matru-vandana-yojana', gender: 'female', age_min: 24, is_pregnant_or_lactating: true, government_employment_status: false }
      },
      needs_info: {
        name: 'Pregnant Mother (Missing Age Proof Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-matru-vandana-yojana', gender: 'female', age_min: null, is_pregnant_or_lactating: true, government_employment_status: false }
      },
      ineligible: {
        name: 'Government Employee Mother (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-matru-vandana-yojana', gender: 'female', age_min: 27, is_pregnant_or_lactating: true, government_employment_status: true }
      }
    }
  },

  // 15. Pradhan Mantri Suraksha Bima Yojana (PMSBY) - Health/Insurance, English
  {
    id: 'pm-suraksha-bima-yojana',
    title: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    short_name: 'PM Suraksha Bima (PMSBY)',
    category: 'Health',
    state: 'Central',
    language: 'English',
    version: 'v1.5',
    last_amended: '2024-06-01',
    summary: 'Affordable accidental death and disability insurance cover offering ₹2 Lakh protection for an annual nominal premium of just ₹20.',
    key_benefit: '₹2,00,000 accidental death & full disability insurance cover',
    source_url: 'https://www.jansuraksha.gov.in',
    verified_on: '2024-06-01',
    conditions: [
      {
        id: 'sb1',
        field: 'age_min',
        field_display: 'Minimum Age',
        operator: 'gte',
        value: 18,
        unit: 'years',
        original_clause: 'Available to people in the age group of 18 to 70 years.',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'sb2',
        field: 'age_max',
        field_display: 'Maximum Age',
        operator: 'lte',
        value: 70,
        unit: 'years',
        original_clause: 'Maximum entry and renewal age limit is 70 years.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'sb3',
        field: 'has_bank_account',
        field_display: 'Savings Bank Account with Auto-Debit',
        operator: 'eq',
        value: true,
        original_clause: 'Individual must have a savings bank account with consent for auto-debit of annual ₹20 premium.',
        mutability: 'MUTABLE',
        confidence: 0.97,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'sb_d1', title: 'Aadhaar Card (e-KYC)', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'sb_d2', title: 'Bank Account Passbook / Mandate Form', required_for_fields: ['has_bank_account'], issuing_authority: 'Participating Bank' },
    ],
    benefits: [
      { id: 'sb_b1', title: 'Accidental Death Benefit', amount: '₹2,00,000', frequency: 'Lump-sum', description: 'Payable to nominee upon accidental death.' },
      { id: 'sb_b2', title: 'Permanent Total Disability Benefit', amount: '₹2,00,000', frequency: 'Lump-sum', description: 'Full coverage for loss of both eyes or both hands/feet.' },
    ],
    exclusions: [
      { id: 'sb_ex1', title: 'Exceeded Age Ceiling', condition_field: 'age_exceeded_70', condition_value: 'true', original_clause: 'Cover terminates upon attaining age 70.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible Citizen (Age 34)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-suraksha-bima-yojana', age_min: 34, age_max: 34, has_bank_account: true }
      },
      needs_info: {
        name: 'Citizen (Missing Bank Account Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-suraksha-bima-yojana', age_min: 34, age_max: 34, has_bank_account: null }
      },
      ineligible: {
        name: 'Senior Citizen Age 75 (Exceeded Age Limit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-suraksha-bima-yojana', age_min: 75, age_max: 75, has_bank_account: true }
      }
    }
  },

  // 16. Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY) - Health/Life Insurance, English
  {
    id: 'pm-jeevan-jyoti-bima',
    title: 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
    short_name: 'PM Jeevan Jyoti (PMJJBY)',
    category: 'Health',
    state: 'Central',
    language: 'English',
    version: 'v1.5',
    last_amended: '2024-06-01',
    summary: 'Universal term life insurance providing ₹2,00,000 financial protection for death due to any reason for an annual premium of ₹436.',
    key_benefit: '₹2,00,000 life insurance cover for any cause of death',
    source_url: 'https://www.jansuraksha.gov.in',
    verified_on: '2024-06-01',
    conditions: [
      {
        id: 'jj1',
        field: 'age_min',
        field_display: 'Minimum Age',
        operator: 'gte',
        value: 18,
        unit: 'years',
        original_clause: 'Individuals in the age group of 18 to 50 years are eligible.',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'jj2',
        field: 'age_max',
        field_display: 'Maximum Entry Age',
        operator: 'lte',
        value: 50,
        unit: 'years',
        original_clause: 'Enrolment age limit is capped at 50 years (risk cover continues till age 55).',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'jj3',
        field: 'has_bank_account',
        field_display: 'Bank Account with Auto-Debit',
        operator: 'eq',
        value: true,
        original_clause: 'Must possess a savings bank account with consent for auto-debit of ₹436 annual premium.',
        mutability: 'MUTABLE',
        confidence: 0.97,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'jj_d1', title: 'Aadhaar Card with e-KYC', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'jj_d2', title: 'Savings Bank Account Mandate', required_for_fields: ['has_bank_account'], issuing_authority: 'Bank / Post Office' },
    ],
    benefits: [
      { id: 'jj_b1', title: 'Term Life Insurance Cover', amount: '₹2,00,000', frequency: 'Lump-sum', description: 'Payable to nominee in the event of death due to any reason.' },
    ],
    exclusions: [
      { id: 'jj_ex1', title: 'Over 50 Years at Enrolment', condition_field: 'age_over_50', condition_value: 'true', original_clause: 'Persons joining after age 50 are disqualified.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible Adult (Age 28)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-jeevan-jyoti-bima', age_min: 28, age_max: 28, has_bank_account: true }
      },
      needs_info: {
        name: 'Adult (Missing Bank Mandate Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-jeevan-jyoti-bima', age_min: 28, age_max: 28, has_bank_account: null }
      },
      ineligible: {
        name: 'Applicant Age 54 (Exceeds Entry Age Limit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-jeevan-jyoti-bima', age_min: 54, age_max: 54, has_bank_account: true }
      }
    }
  },

  // 17. Chief Minister Comprehensive Health Insurance Scheme (CMCHIS) - Health, Tamil
  {
    id: 'tn-cmchis-health-insurance',
    title: 'Chief Minister Comprehensive Health Insurance Scheme (CMCHIS - கலைஞர் காப்பீட்டுத் திட்டம்)',
    short_name: 'TN CMCHIS Health Scheme',
    category: 'Health',
    state: 'Tamil Nadu',
    language: 'Tamil',
    version: 'v2.3',
    last_amended: '2024-08-15',
    summary: 'தமிழ்நாடு முதல்வரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம் — குடும்பத்தின் ஆண்டு வருமானம் ரூ.1.20 லட்சத்திற்கு மிகாமல் இருக்கும் குடும்பங்களுக்கு ஆண்டுக்கு ரூ. 5 லட்சம் வரையிலான பணமில்லா மருத்துவ சிகிச்சை.',
    key_benefit: 'ஆண்டுக்கு ₹5,00,000 வரை இலவச பணமில்லா மருத்துவ சிகிச்சை (Cashless Hospital Cover)',
    source_url: 'https://www.cmchistn.com',
    verified_on: '2024-08-15',
    conditions: [
      {
        id: 'cm1',
        field: 'residence_state',
        field_display: 'State of Residence',
        operator: 'eq',
        value: 'Tamil Nadu',
        original_clause: 'விண்ணப்பதாரர் தமிழ்நாட்டில் வசிப்பவராக இருத்தல் வேண்டும்.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'cm2',
        field: 'income_threshold',
        field_display: 'Annual Family Income Limit',
        operator: 'lte',
        value: 120000,
        unit: 'INR',
        original_clause: 'குடும்பத்தின் ஆண்டு வருமானம் ரூ.1,20,000-க்கு மிகாமல் இருக்க வேண்டும்.',
        mutability: 'MUTABLE',
        confidence: 0.96,
        language: 'ta',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'cm_d1', title: 'Smart Family Ration Card', required_for_fields: ['residence_state'], issuing_authority: 'Civil Supplies Department' },
      { id: 'cm_d2', title: 'Income Certificate (Revenue Authority)', required_for_fields: ['income_threshold'], issuing_authority: 'Revenue Department / VAO' },
      { id: 'cm_d3', title: 'Family Members Aadhaar Cards', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
    ],
    benefits: [
      { id: 'cm_b1', title: 'Cashless Hospitalization Cover', amount: '₹5,00,000', frequency: 'Annual Floater', description: 'Comprehensive cashless coverage for 1,090 medical and surgical procedures.' },
    ],
    exclusions: [
      { id: 'cm_ex1', title: 'Government Employees Covered by NHIS', condition_field: 'government_employment_status', condition_value: 'true', original_clause: 'தமிழ்நாடு அரசு ஊழியர்கள் மற்றும் ஓய்வூதியதாரர்கள் தனி காப்பீட்டின் கீழ் உள்ளதால் விலக்களிக்கப்படுகிறார்கள்.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible TN Family (Income ₹95,000)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'tn-cmchis-health-insurance', residence_state: 'Tamil Nadu', income_threshold: 95000, government_employment_status: false }
      },
      needs_info: {
        name: 'TN Resident (Missing Income Certificate Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'tn-cmchis-health-insurance', residence_state: 'Tamil Nadu', income_threshold: null, government_employment_status: false }
      },
      ineligible: {
        name: 'High Income Family (Income ₹2.4L)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'tn-cmchis-health-insurance', residence_state: 'Tamil Nadu', income_threshold: 240000, government_employment_status: false }
      }
    }
  },

  // 18. AP YSR Rythu Bharosa - Agriculture, Telugu
  {
    id: 'ap-ysr-rythu-bharosa',
    title: 'వైఎస్సార్ రైతు భరోసా - పీఎం కిసాన్ (AP YSR Rythu Bharosa)',
    short_name: 'AP YSR Rythu Bharosa',
    category: 'Agriculture',
    state: 'Andhra Pradesh',
    language: 'Telugu',
    version: 'v3.1',
    last_amended: '2024-05-20',
    summary: 'ఆంధ్రప్రదేశ్ రైతు కుటుంబాలకు పంట పెట్టుబడి సాయంగా ఏటా ₹13,500 ప్రత్యక్ష ఆర్థిక సహాయం అందించే సమగ్ర సంక్షేమ పథకం.',
    key_benefit: 'ఏటా ₹13,500 పంట పెట్టుబడి సాయం (Direct DBT in 3 installments)',
    source_url: 'https://ysrrythubharosa.ap.gov.in',
    verified_on: '2024-05-20',
    conditions: [
      {
        id: 'rb1',
        field: 'residence_state',
        field_display: 'State of Residence',
        operator: 'eq',
        value: 'Andhra Pradesh',
        original_clause: 'ఆంధ్రప్రదేశ్ రాష్ట్రంలో శాశ్వత నివాసి అయి ఉండాలి.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'rb2',
        field: 'occupation',
        field_display: 'Occupation Type',
        operator: 'eq',
        value: 'farmer',
        original_clause: 'రైతు లేదా కౌలు రైతుగా వ్యవసాయం చేయాలి.',
        mutability: 'MUTABLE',
        confidence: 0.97,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'rb3',
        field: 'land_ownership',
        field_display: 'Cultivable Landholding',
        operator: 'lte',
        value: 5.0,
        unit: 'hectares',
        original_clause: 'గరిష్టంగా 5 హెక్టార్ల వరకు సాగు భూమి కలిగిన చిన్న మరియు సన్నకారు రైతులు.',
        mutability: 'MUTABLE',
        confidence: 0.95,
        language: 'te',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'rb_d1', title: 'Pattadar Passbook / 1B / CCRC Card', required_for_fields: ['land_ownership'], issuing_authority: 'Revenue Department AP' },
      { id: 'rb_d2', title: 'Aadhaar Card Linked Bank Account', required_for_fields: ['identity'], issuing_authority: 'UIDAI & Bank' },
    ],
    benefits: [
      { id: 'rb_b1', title: 'Input Investment Subsidy', amount: '₹13,500 / year', frequency: 'Annual (3 Installments)', description: 'Direct DBT: ₹7,500 (Kharif) + ₹4,000 (Rabi) + ₹2,000 (Sankranti).' },
    ],
    exclusions: [
      { id: 'rb_ex1', title: 'Income Tax Payers', condition_field: 'income_tax_payer_status', condition_value: 'true', original_clause: 'గత అసెస్‌మెంట్ సంవత్సరంలో ఆదాయపు పన్ను చెల్లించిన వారు అర్హులు కారు.', overrides_all: true },
      { id: 'rb_ex2', title: 'Constitutional Post Holders', condition_field: 'constitutional_post_holder', condition_value: 'true', original_clause: 'రాజ్యాంగ పదవులు నిర్వహించిన వారు మినహాయించబడ్డారు.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible AP Farmer (2.5 Hectares)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'ap-ysr-rythu-bharosa', residence_state: 'Andhra Pradesh', occupation: 'farmer', land_ownership: 2.5, income_tax_payer_status: false, constitutional_post_holder: false }
      },
      needs_info: {
        name: 'AP Farmer (Missing Landholding Size Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'ap-ysr-rythu-bharosa', residence_state: 'Andhra Pradesh', occupation: 'farmer', land_ownership: null, income_tax_payer_status: false, constitutional_post_holder: false }
      },
      ineligible: {
        name: 'Taxpayer Farmer (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'ap-ysr-rythu-bharosa', residence_state: 'Andhra Pradesh', occupation: 'farmer', land_ownership: 2.5, income_tax_payer_status: true, constitutional_post_holder: false }
      }
    }
  },

  // 19. PM SVANidhi (Street Vendor’s AtmaNirbhar Nidhi) - Livelihood, Hindi
  {
    id: 'pm-svanidhi-scheme',
    title: 'प्रधानमंत्री स्ट्रीट वेंडर्स आत्मनिर्भर निधि (PM SVANidhi)',
    short_name: 'PM SVANidhi Micro-Credit',
    category: 'Livelihood',
    state: 'Central',
    language: 'Hindi',
    version: 'v2.0',
    last_amended: '2024-04-10',
    summary: 'शहरी एवं अर्ध-शहरी पथ विक्रेताओं (स्ट्रीट वेंडर्स) के लिए ₹10,000 से ₹50,000 तक का संपार्श्विक-मुक्त (collateral-free) कार्यशील पूंजी ऋण व 7% ब्याज सब्सिडी।',
    key_benefit: '₹10,000 - ₹50,000 संपार्श्विक-मुक्त सस्ता कार्यशील पूंजी ऋण + 7% ब्याज सब्सिडी',
    source_url: 'https://pmsvanidhi.mohua.gov.in',
    verified_on: '2024-04-10',
    conditions: [
      {
        id: 'sv1',
        field: 'occupation',
        field_display: 'Occupation Type',
        operator: 'in',
        value: ['street_vendor', 'artisan', 'vendor'],
        original_clause: 'शहरी क्षेत्रों में वेंडिंग/फेरी का कार्य करने वाले पथ विक्रेता।',
        mutability: 'MUTABLE',
        confidence: 0.98,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'sv2',
        field: 'age_min',
        field_display: 'Minimum Age',
        operator: 'gte',
        value: 18,
        unit: 'years',
        original_clause: 'आवेदक की न्यूनतम आयु 18 वर्ष या उससे अधिक होनी चाहिए।',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'hi',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'sv_d1', title: 'Certificate of Vending (CoV) / Urban Local Body ID Card', required_for_fields: ['occupation'], issuing_authority: 'Municipal Corporation / ULB' },
      { id: 'sv_d2', title: 'Aadhaar Card Linked Mobile', required_for_fields: ['identity'], issuing_authority: 'UIDAI' },
      { id: 'sv_d3', title: 'Bank Account Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Commercial / Regional Rural Bank' },
    ],
    benefits: [
      { id: 'sv_b1', title: '1st Tranche Working Capital Loan', amount: '₹10,000', frequency: '1-year tenure', description: 'Collateral-free micro-credit.' },
      { id: 'sv_b2', title: 'Enhanced 2nd & 3rd Tranches', amount: 'Up to ₹50,000', frequency: 'On timely repayment', description: 'Second loan ₹20,000, Third loan ₹50,000.' },
      { id: 'sv_b3', title: '7% Annual Interest Subsidy', description: 'Directly credited into bank account quarterly on timely EMI repayment.' },
    ],
    exclusions: [
      { id: 'sv_ex1', title: 'Active Credit Defaulters', condition_field: 'active_loan_defaulter', condition_value: 'true', original_clause: 'Non-performing asset (NPA) or wilful defaulters are disqualified.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible Urban Street Vendor (Age 31)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'pm-svanidhi-scheme', occupation: 'street_vendor', age_min: 31, active_loan_defaulter: false }
      },
      needs_info: {
        name: 'Vendor (Missing Vending Status Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'pm-svanidhi-scheme', occupation: null, age_min: 31, active_loan_defaulter: false }
      },
      ineligible: {
        name: 'Credit Defaulter (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'pm-svanidhi-scheme', occupation: 'street_vendor', age_min: 31, active_loan_defaulter: true }
      }
    }
  },

  // 20. Indira Gandhi National Widow Pension Scheme (IGNWPS) - Pension, English
  {
    id: 'ignwps-widow-pension',
    title: 'Indira Gandhi National Widow Pension Scheme (IGNWPS)',
    short_name: 'IGNWPS Widow Pension',
    category: 'Pension',
    state: 'Central / All States',
    language: 'English',
    version: 'v1.8',
    last_amended: '2024-03-01',
    summary: 'National Social Assistance Programme component providing monthly financial security pension to destitute widows aged 40–79 living below the poverty line.',
    key_benefit: '₹1,000 - ₹1,500 / month direct social security pension',
    source_url: 'https://nsap.nic.in',
    verified_on: '2024-03-01',
    conditions: [
      {
        id: 'nw1',
        field: 'gender',
        field_display: 'Gender',
        operator: 'eq',
        value: 'female',
        original_clause: 'Applicant must be a female widow.',
        mutability: 'IMMUTABLE',
        confidence: 0.99,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'nw2',
        field: 'age_min',
        field_display: 'Minimum Age',
        operator: 'gte',
        value: 40,
        unit: 'years',
        original_clause: 'Widow must have completed 40 years of age.',
        mutability: 'IMMUTABLE',
        confidence: 0.98,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'nw3',
        field: 'age_max',
        field_display: 'Maximum Age',
        operator: 'lte',
        value: 79,
        unit: 'years',
        original_clause: 'Age must not exceed 79 years (at 80 years transitions to higher IGNOAPS pension).',
        mutability: 'IMMUTABLE',
        confidence: 0.97,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
      {
        id: 'nw4',
        field: 'bpl_status',
        field_display: 'BPL Card Status',
        operator: 'eq',
        value: true,
        original_clause: 'Applicant must belong to a household living Below Poverty Line (BPL).',
        mutability: 'MUTABLE',
        confidence: 0.96,
        language: 'en',
        is_current: true,
        valid_from: '2024-01-01',
      },
    ],
    documents: [
      { id: 'nw_d1', title: 'Death Certificate of Husband', required_for_fields: ['marital_status'], issuing_authority: 'Municipal / Revenue Registrar' },
      { id: 'nw_d2', title: 'BPL Ration Card / SECC Record', required_for_fields: ['bpl_status'], issuing_authority: 'Food & Civil Supplies Dept' },
      { id: 'nw_d3', title: 'Age Proof (Voter ID / Birth Certificate)', required_for_fields: ['age_min'], issuing_authority: 'Election Commission / Health Dept' },
      { id: 'nw_d4', title: 'Aadhaar Linked Bank / Post Office Passbook', required_for_fields: ['bank_account'], issuing_authority: 'Bank / India Post' },
    ],
    benefits: [
      { id: 'nw_b1', title: 'Monthly Social Security Pension', amount: '₹1,000 / mo', frequency: 'Monthly', description: 'Combined Central & State monthly pension directly deposited into beneficiary account.' },
    ],
    exclusions: [
      { id: 'nw_ex1', title: 'Government Pensioner / Employee', condition_field: 'government_employment_status', condition_value: 'true', original_clause: 'Beneficiaries of regular government family pensions are excluded.', overrides_all: true },
      { id: 'nw_ex2', title: 'Remarried Status', condition_field: 'remarried', condition_value: 'true', original_clause: 'Pension terminates if the widow remarries.', overrides_all: true },
    ],
    demo_profiles: {
      eligible: {
        name: 'Eligible BPL Widow (Age 48)',
        verdict: 'ELIGIBLE',
        facts: { scheme_id: 'ignwps-widow-pension', gender: 'female', age_min: 48, age_max: 48, bpl_status: true, government_employment_status: false, remarried: false }
      },
      needs_info: {
        name: 'Widow (Missing BPL Status Fact)',
        verdict: 'NEEDS_MORE_INFO',
        facts: { scheme_id: 'ignwps-widow-pension', gender: 'female', age_min: 48, age_max: 48, bpl_status: null, government_employment_status: false, remarried: false }
      },
      ineligible: {
        name: 'Government Pensioner Family (Exclusion Hit)',
        verdict: 'INELIGIBLE',
        facts: { scheme_id: 'ignwps-widow-pension', gender: 'female', age_min: 48, age_max: 48, bpl_status: true, government_employment_status: true, remarried: false }
      }
    }
  }
];

export const MOCK_EVALUATION_SCENARIOS: Record<string, EvaluationOutcome> = {
  eligible: {
    scheme_id: 'post-matric-sc-scholarship',
    scheme_title: 'Post-Matric Scholarship Scheme for SC Students',
    verdict: 'ELIGIBLE',
    overall_confidence: 0.98,
    readiness_score: 100,
    clause_details: [
      {
        clause_id: 'c1',
        field: 'caste_category',
        field_display: 'Caste Category',
        status: 'PASSED',
        mutability: 'IMMUTABLE',
        expected_value: 'SC',
        citizen_value: 'SC',
        proximity_score: 1.0,
        original_clause: 'Applicant must belong to Scheduled Caste (SC) category.',
      },
      {
        clause_id: 'c2',
        field: 'education_level',
        field_display: 'Minimum Qualification',
        status: 'PASSED',
        mutability: 'MUTABLE',
        expected_value: '>= 10th',
        citizen_value: '10th',
        proximity_score: 1.0,
        original_clause: 'Must have completed 10th standard matriculation education.',
      },
      {
        clause_id: 'c3',
        field: 'income_threshold',
        field_display: 'Family Annual Income Limit',
        status: 'PASSED',
        mutability: 'MUTABLE',
        expected_value: '<= 250000',
        citizen_value: '₹1,90,000',
        proximity_score: 1.0,
        original_clause: 'Total annual family income must not exceed Rs. 2,50,000.',
      },
    ],
    missing_evidence: [],
    actionable_recommendations: [
      {
        target_field: 'application_submission',
        current_val: 'Verified Profile',
        required_val: 'Submitted on NSP',
        recommendation: 'Proceed to submit verified application on National Scholarship Portal with Aadhaar e-KYC.',
        difficulty: 'Easy',
      },
    ],
  },
  needs_info: {
    scheme_id: 'post-matric-sc-scholarship',
    scheme_title: 'Post-Matric Scholarship Scheme for SC Students',
    verdict: 'NEEDS_MORE_INFO',
    overall_confidence: 0.65,
    readiness_score: 66.7,
    clause_details: [
      {
        clause_id: 'c1',
        field: 'caste_category',
        field_display: 'Caste Category',
        status: 'PASSED',
        mutability: 'IMMUTABLE',
        expected_value: 'SC',
        citizen_value: 'SC',
        proximity_score: 1.0,
        original_clause: 'Applicant must belong to Scheduled Caste (SC) category.',
      },
      {
        clause_id: 'c2',
        field: 'education_level',
        field_display: 'Minimum Qualification',
        status: 'PASSED',
        mutability: 'MUTABLE',
        expected_value: '>= 10th',
        citizen_value: '10th',
        proximity_score: 1.0,
        original_clause: 'Must have completed 10th standard matriculation education.',
      },
      {
        clause_id: 'c3',
        field: 'income_threshold',
        field_display: 'Family Annual Income Limit',
        status: 'UNKNOWN',
        mutability: 'MUTABLE',
        expected_value: '<= 250000',
        citizen_value: 'Missing / Not Provided',
        proximity_score: 0.0,
        original_clause: 'Total annual family income must not exceed Rs. 2,50,000.',
        failure_reason: 'Annual family income was deferred or omitted in profile.',
      },
    ],
    missing_evidence: [
      {
        missing_fact: 'Family Annual Income (income_threshold)',
        required_document: 'Income Certificate issued by Revenue Authority',
        issuing_authority: 'Revenue Department / Tehsildar',
        governing_clause: 'Annual family income ceiling <= Rs. 2,50,000',
        citizen_action: 'Apply for Income Certificate via State e-Seva portal or local Tehsil office.',
      },
    ],
    actionable_recommendations: [
      {
        target_field: 'income_threshold',
        current_val: 'Missing',
        required_val: '<= ₹2,50,000',
        recommendation: 'Upload an updated Revenue Income Certificate to satisfy the income ceiling rule.',
        difficulty: 'Medium',
      },
    ],
  },
  ineligible: {
    scheme_id: 'post-matric-sc-scholarship',
    scheme_title: 'Post-Matric Scholarship Scheme for SC Students',
    verdict: 'INELIGIBLE',
    overall_confidence: 0.99,
    readiness_score: 0.0,
    clause_details: [
      {
        clause_id: 'c1',
        field: 'caste_category',
        field_display: 'Caste Category',
        status: 'PASSED',
        mutability: 'IMMUTABLE',
        expected_value: 'SC',
        citizen_value: 'SC',
        proximity_score: 1.0,
        original_clause: 'Applicant must belong to Scheduled Caste (SC) category.',
      },
      {
        clause_id: 'e1',
        field: 'income_tax_payer_status',
        field_display: 'Statutory Non-Taxpayer Requirement',
        status: 'FAILED',
        mutability: 'MUTABLE',
        expected_value: 'false',
        citizen_value: 'Taxpayer (true)',
        proximity_score: 0.0,
        original_clause: 'Students whose parents paid income tax in last assessment year are excluded.',
        failure_reason: 'Disqualifying statutory exclusion triggered: Applicant family is an Income Tax Payer.',
      },
    ],
    missing_evidence: [],
    actionable_recommendations: [
      {
        target_field: 'income_tax_payer_status',
        current_val: 'Tax Payer (true)',
        required_val: 'Non-Taxpayer (false)',
        recommendation: 'Explore merit-only central scholarships that do not impose income-taxpayer disqualifications.',
        difficulty: 'Hard',
      },
    ],
  },
};

export const MOCK_BENCHMARK_METRICS: BenchmarkMetrics = {
  evaluation_mode: 'Production AuraDB + In-Memory Dual Engine',
  hand_derived_verdict_accuracy: 1.0,
  confusion_matrix: {
    eligible: { eligible: 20, ineligible: 0, needs_more_info: 0 },
    ineligible: { eligible: 0, ineligible: 20, needs_more_info: 0 },
    needs_more_info: { eligible: 0, ineligible: 0, needs_more_info: 20 },
  },
  multilingual_extraction: {
    precision: 1.0,
    recall: 1.0,
    per_language: {
      en: { precision: 1.0, recall: 1.0 },
      hi: { precision: 1.0, recall: 1.0 },
      ta: { precision: 1.0, recall: 1.0 },
      te: { precision: 1.0, recall: 1.0 },
    },
  },
  timing_benchmark: {
    in_memory: { full_ms: 0.81, incremental_ms: 0.65, speedup: 1.25 },
    live_neo4j: { full_ms: 1285.24, incremental_ms: 499.8, speedup: 2.57, status: 'Connected & Verified on Live Neo4j AuraDB' },
  },
};
