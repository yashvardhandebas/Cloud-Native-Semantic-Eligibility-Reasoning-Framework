import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  FileCheck, 
  AlertCircle, 
  Printer, 
  Sparkles,
  ShieldAlert,
  ExternalLink,
  UserCheck,
  Search,
  Filter,
  Check,
  Building,
  Landmark,
  Layers,
  FileText
} from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { evaluateSchemeLocally, evaluateEligibility } from '../api/client';
import { Scheme, CitizenFacts, EvaluationOutcome } from '../types';
import { RadialGauge } from '../components/RadialGauge';
import { Badge } from '../components/Badge';
import { CitizenCertificateModal } from '../components/CitizenCertificateModal';

interface UniversalProfile {
  age: string;
  gender: string;
  maritalStatus: string;
  state: string;
  caste: string;
  income: string;
  isBpl: string;
  occupation: string;
  educationLevel: string;
  landholding: string;
  housingStatus: string;
  hasBankAccount: string;
  maternityStatus: string;
  hasGirlChild: string;
  isTaxPayer: boolean;
  isGovtEmployee: boolean;
  hasExistingLpg: boolean;
  hasFourWheeler: boolean;
}

const DEFAULT_PROFILE: UniversalProfile = {
  age: '',
  gender: '',
  maritalStatus: 'Single',
  state: 'All',
  caste: '',
  income: '',
  isBpl: 'unknown',
  occupation: '',
  educationLevel: '',
  landholding: '',
  housingStatus: '',
  hasBankAccount: 'true',
  maternityStatus: 'none',
  hasGirlChild: 'false',
  isTaxPayer: false,
  isGovtEmployee: false,
  hasExistingLpg: false,
  hasFourWheeler: false,
};

const DEMO_PRESETS: { id: string; label: string; desc: string; profile: UniversalProfile }[] = [
  {
    id: 'farmer',
    label: '🌾 Small Farmer',
    desc: 'OBC · ₹90,000/yr · 1.2 Ha Land · AP / TN',
    profile: {
      age: '42',
      gender: 'Male',
      maritalStatus: 'Married',
      state: 'Andhra Pradesh',
      caste: 'OBC',
      income: '90000',
      isBpl: 'true',
      occupation: 'farmer',
      educationLevel: '10th Pass',
      landholding: '1.2',
      housingStatus: 'Semi-Pucca',
      hasBankAccount: 'true',
      maternityStatus: 'none',
      hasGirlChild: 'false',
      isTaxPayer: false,
      isGovtEmployee: false,
      hasExistingLpg: false,
      hasFourWheeler: false,
    },
  },
  {
    id: 'sc_student',
    label: '🎓 SC College Student',
    desc: 'SC · ₹1,40,000/yr · 20 yrs · Graduate Student',
    profile: {
      age: '20',
      gender: 'Female',
      maritalStatus: 'Single',
      state: 'All',
      caste: 'SC',
      income: '140000',
      isBpl: 'false',
      occupation: 'student',
      educationLevel: 'Graduate',
      landholding: '0',
      housingStatus: 'Pucca',
      hasBankAccount: 'true',
      maternityStatus: 'none',
      hasGirlChild: 'false',
      isTaxPayer: false,
      isGovtEmployee: false,
      hasExistingLpg: true,
      hasFourWheeler: false,
    },
  },
  {
    id: 'bpl_mother',
    label: '👩 Rural BPL Mother',
    desc: 'OBC · ₹60,000/yr · BPL Card · Pregnant / Lactating',
    profile: {
      age: '24',
      gender: 'Female',
      maritalStatus: 'Married',
      state: 'Tamil Nadu',
      caste: 'OBC',
      income: '60000',
      isBpl: 'true',
      occupation: 'unorganized',
      educationLevel: '10th Pass',
      landholding: '0',
      housingStatus: 'Kutcha',
      hasBankAccount: 'true',
      maternityStatus: 'pregnant',
      hasGirlChild: 'true',
      isTaxPayer: false,
      isGovtEmployee: false,
      hasExistingLpg: false,
      hasFourWheeler: false,
    },
  },
  {
    id: 'artisan',
    label: '🔨 Artisan / Craftsperson',
    desc: 'OBC · ₹1,10,000/yr · 34 yrs · Traditional Artisan',
    profile: {
      age: '34',
      gender: 'Male',
      maritalStatus: 'Married',
      state: 'All',
      caste: 'OBC',
      income: '110000',
      isBpl: 'false',
      occupation: 'artisan',
      educationLevel: '8th Pass',
      landholding: '0',
      housingStatus: 'Semi-Pucca',
      hasBankAccount: 'true',
      maternityStatus: 'none',
      hasGirlChild: 'false',
      isTaxPayer: false,
      isGovtEmployee: false,
      hasExistingLpg: false,
      hasFourWheeler: false,
    },
  },
  {
    id: 'widow',
    label: '👵 Senior BPL Widow',
    desc: 'SC · 64 yrs · ₹45,000/yr · BPL Ration Card',
    profile: {
      age: '64',
      gender: 'Female',
      maritalStatus: 'Widow',
      state: 'All',
      caste: 'SC',
      income: '45000',
      isBpl: 'true',
      occupation: 'none',
      educationLevel: 'None',
      landholding: '0',
      housingStatus: 'Kutcha',
      hasBankAccount: 'true',
      maternityStatus: 'none',
      hasGirlChild: 'false',
      isTaxPayer: false,
      isGovtEmployee: false,
      hasExistingLpg: false,
      hasFourWheeler: false,
    },
  },
];

function normalizeUniversalFacts(form: UniversalProfile): CitizenFacts {
  const isFarmer = form.occupation === 'farmer';
  const isStudent = form.occupation === 'student';
  const isArtisan = form.occupation === 'artisan';
  const isVendor = form.occupation === 'vendor';
  const isUnorganized = form.occupation === 'unorganized' || isVendor || isArtisan;

  return {
    scheme_id: '',
    // Demographics & Social
    age: form.age ? Number(form.age) : undefined,
    gender: form.gender || undefined,
    community: form.caste || undefined,
    social_category: form.caste || undefined,
    state_of_residence: form.state === 'All' ? undefined : form.state,
    marital_status: form.maritalStatus || undefined,
    
    // Income & Economic
    annual_income: form.income ? Number(form.income) : undefined,
    annual_family_income: form.income ? Number(form.income) : undefined,
    monthly_income: form.income ? Math.round(Number(form.income) / 12) : undefined,
    is_bpl_or_secc: form.isBpl === 'true',
    is_bpl_cardholder: form.isBpl === 'true',
    is_bpl_or_priority: form.isBpl === 'true',
    deprivation_category: form.isBpl === 'true' ? 'Rural BPL' : undefined,
    has_ration_card: form.isBpl === 'true',
    
    // Housing & Land
    housing_status: form.housingStatus || undefined,
    has_pucca_house: form.housingStatus === 'Pucca',
    landholding_hectares: isFarmer ? (form.landholding ? Number(form.landholding) : 1.2) : undefined,
    is_farmer: isFarmer,
    farmer_category: isFarmer ? (Number(form.landholding) <= 1.0 ? 'Marginal Farmer' : 'Small Farmer') : undefined,
    
    // Occupation & Education
    occupation: isArtisan ? 'Artisan' : isVendor ? 'Street Vendor' : form.occupation,
    occupation_sector: isUnorganized ? 'Unorganized' : undefined,
    has_vending_certificate_or_id: isVendor,
    has_artisan_id_or_self_attest: isArtisan,
    course_level: isStudent ? form.educationLevel : undefined,
    education_level: form.educationLevel || undefined,
    enterprise_type: form.caste === 'SC' || form.caste === 'ST' || form.gender === 'Female' ? 'Greenfield' : undefined,

    // Banking & Verification
    has_savings_bank_account: form.hasBankAccount === 'true',
    has_aadhaar_bank_link: form.hasBankAccount === 'true',
    aadhaar_bank_linked: form.hasBankAccount === 'true',
    has_aadhaar: true,

    // Special Life Stage
    maternity_status: form.maternityStatus === 'pregnant' ? 'Pregnant' : form.maternityStatus === 'lactating' ? 'Lactating Mother' : undefined,
    child_gender: form.hasGirlChild === 'true' ? 'Female' : undefined,
    child_age: form.hasGirlChild === 'true' ? 6 : undefined,
    is_guardian: form.hasGirlChild === 'true',

    // Disqualifications (Statutory Exclusions)
    is_income_tax_payer: form.isTaxPayer,
    is_central_govt_employee: form.isGovtEmployee,
    is_regular_govt_employee: form.isGovtEmployee,
    is_govt_employee_or_pensioner: form.isGovtEmployee,
    is_govt_employee_pensioner: form.isGovtEmployee,
    govt_service_family_member: form.isGovtEmployee,
    is_psu_employee: form.isGovtEmployee,
    has_existing_lpg_connection: form.hasExistingLpg,
    family_four_wheeler: form.hasFourWheeler,
    family_motorized_vehicle: form.hasFourWheeler,
    is_bank_defaulter: false,
    is_epfo_esic_member: false,
    is_receiving_other_govt_pension: false,
  };
}

export const EligibilityCheckPage: React.FC = () => {
  const { t } = useTranslation();
  const { schemeId } = useParams<{ schemeId?: string }>();
  const navigate = useNavigate();

  // Mode: 'intake' (Citizen Universal Form & All-Scheme Discovery) or 'deep_dive' (Single Scheme Graph Reasoning)
  const [viewMode, setViewMode] = useState<'intake' | 'deep_dive'>(schemeId ? 'deep_dive' : 'intake');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemeId || MOCK_SCHEMES[0].id);

  // Universal Intake Form State
  const [profile, setProfile] = useState<UniversalProfile>(DEMO_PRESETS[0].profile);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ELIGIBLE' | 'NEEDS_MORE_INFO' | 'INELIGIBLE'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Deep-dive single scheme state
  const activeScheme = MOCK_SCHEMES.find((s) => s.id === selectedSchemeId) || MOCK_SCHEMES[0];
  const [deepFacts, setDeepFacts] = useState<Record<string, any>>({});
  const [unknownFlags, setUnknownFlags] = useState<Record<string, boolean>>({});
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationOutcome | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // Synchronize deep-dive facts when switching to deep dive or scheme
  const syncFactsForScheme = (targetScheme: Scheme, currentProfile: UniversalProfile) => {
    const normalized = normalizeUniversalFacts(currentProfile);
    const initial: CitizenFacts = { scheme_id: targetScheme.id };
    const flags: Record<string, boolean> = {};

    targetScheme.conditions.forEach((c) => {
      const val = normalized[c.field];
      if (val !== undefined && val !== null && val !== '') {
        initial[c.field] = val;
      } else {
        initial[c.field] = '';
      }
    });

    targetScheme.exclusions.forEach((exc) => {
      initial[exc.condition_field] = normalized[exc.condition_field] || false;
    });

    setDeepFacts(initial);
    setUnknownFlags(flags);
    const outcome = evaluateSchemeLocally(targetScheme, initial);
    setResult(outcome);
  };

  const handleSelectSchemeForDeepDive = (scheme: Scheme) => {
    setSelectedSchemeId(scheme.id);
    syncFactsForScheme(scheme, profile);
    setViewMode('deep_dive');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateProfileField = (field: keyof UniversalProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const applyDemoPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setProfile(preset.profile);
  };

  const resetIntakeForm = () => {
    setProfile(DEFAULT_PROFILE);
  };

  // Evaluate All 20 Schemes based on current Universal Profile
  const allEvaluations = useMemo(() => {
    const facts = normalizeUniversalFacts(profile);
    return MOCK_SCHEMES.map((scheme) => {
      const outcome = evaluateSchemeLocally(scheme, facts);
      return {
        scheme,
        outcome,
      };
    });
  }, [profile]);

  const summaryCounts = useMemo(() => {
    let eligible = 0;
    let needsInfo = 0;
    let ineligible = 0;

    allEvaluations.forEach(({ outcome }) => {
      if (outcome.verdict === 'ELIGIBLE') eligible++;
      else if (outcome.verdict === 'NEEDS_MORE_INFO') needsInfo++;
      else ineligible++;
    });

    return { eligible, needsInfo, ineligible, total: allEvaluations.length };
  }, [allEvaluations]);

  const filteredEvaluations = useMemo(() => {
    return allEvaluations.filter(({ scheme, outcome }) => {
      if (activeFilter !== 'all' && outcome.verdict !== activeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = scheme.title.toLowerCase().includes(q) || (scheme.short_name ? scheme.short_name.toLowerCase().includes(q) : false);
        const matchesCategory = scheme.category.toLowerCase().includes(q);
        const matchesBenefit = scheme.key_benefit ? scheme.key_benefit.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesCategory && !matchesBenefit) return false;
      }
      return true;
    });
  }, [allEvaluations, activeFilter, searchQuery]);

  // Handlers for single-scheme deep-dive mode
  const updateDeepFact = (field: string, value: any) => {
    setDeepFacts((prev) => ({ ...prev, [field]: value }));
    setUnknownFlags((prev) => ({ ...prev, [field]: false }));
  };

  const toggleDeepUnknown = (field: string) => {
    const isNowUnknown = !unknownFlags[field];
    setUnknownFlags((prev) => ({ ...prev, [field]: isNowUnknown }));
    setDeepFacts((prev) => ({ ...prev, [field]: isNowUnknown ? null : '' }));
  };

  const handleDeepEvaluate = async () => {
    setEvaluating(true);
    const preparedFacts: CitizenFacts = {
      ...deepFacts,
      scheme_id: activeScheme.id,
    };
    Object.keys(unknownFlags).forEach((field) => {
      if (unknownFlags[field]) {
        preparedFacts[field] = null;
      }
    });

    const outcome = await evaluateEligibility(preparedFacts);
    setResult(outcome);
    setEvaluating(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Disclaimer Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t('check.officialAdvisory')}</span>
        </div>
        {activeScheme.source_url && (
          <a
            href={activeScheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-cyan hover:underline flex items-center gap-1 font-semibold shrink-0"
          >
            {t('check.officialPortal')} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-cyan" />
            {viewMode === 'intake' ? t('check.intakeTitle') : activeScheme.title}
          </h1>
          <p className="text-xs text-dark-muted mt-1">
            {viewMode === 'intake' 
              ? t('check.intakeSub') 
              : `Point-in-time semantic clause audit and documentary evidence checklist for ${activeScheme.short_name || activeScheme.title}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setViewMode('intake')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'intake'
                ? 'bg-brand-gradient text-dark-bg shadow-md'
                : 'text-dark-muted hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Direct Intake (20 Schemes)
          </button>
          <button
            onClick={() => {
              syncFactsForScheme(activeScheme, profile);
              setViewMode('deep_dive');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'deep_dive'
                ? 'bg-brand-gradient text-dark-bg shadow-md'
                : 'text-dark-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Single Scheme Deep Dive
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: UNIVERSAL CITIZEN INTAKE & 20-SCHEME DISCOVERY */}
      {/* ========================================================================= */}
      {viewMode === 'intake' && (
        <div className="space-y-8">
          {/* 1-Click Demo Persona Bar */}
          <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                {t('check.quickPresets')}
              </span>
              <button
                onClick={resetIntakeForm}
                className="text-xs text-dark-muted hover:text-white flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset Form
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {DEMO_PRESETS.map((preset) => {
                const isActive = profile.occupation === preset.profile.occupation && profile.income === preset.profile.income;
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyDemoPreset(preset)}
                    className={`p-3 rounded-2xl text-left border transition ${
                      isActive
                        ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-dark-muted hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">{preset.label}</div>
                    <div className="text-[10px] text-dark-muted mt-1 line-clamp-1">{preset.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Citizen Details Form Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Section 1: Demographics */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> {t('check.personalDemographics')}
                </h3>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.age')}</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    placeholder="e.g. 28"
                    value={profile.age}
                    onChange={(e) => updateProfileField('age', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.gender')}</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => updateProfileField('gender', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="">Select Gender...</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Transgender">Transgender / Other</option>
                  </select>
                </div>

                {/* Marital Status */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.maritalStatus')}</label>
                  <select
                    value={profile.maritalStatus}
                    onChange={(e) => updateProfileField('maritalStatus', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="Single">Single / Unmarried</option>
                    <option value="Married">Married</option>
                    <option value="Widow">Widow</option>
                    <option value="Divorced">Divorced / Deserted</option>
                  </select>
                </div>

                {/* State of Residence */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.state')}</label>
                  <select
                    value={profile.state}
                    onChange={(e) => updateProfileField('state', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="All">All India / Central Applicable</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Other">Other State / UT</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Social & Economic Category */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4" /> {t('check.socialEconomic')}
                </h3>

                {/* Caste / Community */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.caste')}</label>
                  <select
                    value={profile.caste}
                    onChange={(e) => updateProfileField('caste', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="">Select Social Category...</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="OBC">Other Backward Class (OBC)</option>
                    <option value="General">General / Open Category</option>
                    <option value="EWS">Economically Weaker Section (EWS)</option>
                  </select>
                </div>

                {/* Annual Household Income */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.annualIncome')}</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={profile.income}
                    onChange={(e) => updateProfileField('income', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  />
                  <span className="text-[10px] text-dark-muted block">
                    {profile.income ? `≈ ₹${Math.round(Number(profile.income) / 12).toLocaleString()}/month` : 'Total family earnings per annum'}
                  </span>
                </div>

                {/* BPL Cardholder */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.bplStatus')}</label>
                  <select
                    value={profile.isBpl}
                    onChange={(e) => updateProfileField('isBpl', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="unknown">Not Specified / Unsure</option>
                    <option value="true">Yes (Possesses BPL / Priority PHH / Antyodaya Card)</option>
                    <option value="false">No (Non-BPL / Above Poverty Line)</option>
                  </select>
                </div>

                {/* Housing Status */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.houseType')}</label>
                  <select
                    value={profile.housingStatus}
                    onChange={(e) => updateProfileField('housingStatus', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="">Select Housing Type...</option>
                    <option value="Kutcha">Kutcha / Thatched / Mud House</option>
                    <option value="Semi-Pucca">Semi-Pucca Structure</option>
                    <option value="Pucca">Pucca (Permanent Concrete House)</option>
                    <option value="Houseless">Houseless / Homeless</option>
                  </select>
                </div>
              </div>

              {/* Section 3: Occupation & Livelihood */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" /> {t('check.occupationEducation')}
                </h3>

                {/* Primary Occupation */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.occupation')}</label>
                  <select
                    value={profile.occupation}
                    onChange={(e) => updateProfileField('occupation', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="">Select Occupation...</option>
                    <option value="farmer">Small / Marginal Farmer (Agriculture)</option>
                    <option value="student">Student / Scholar (Higher Education)</option>
                    <option value="artisan">Artisan / Traditional Craftsman</option>
                    <option value="vendor">Street Vendor / Hawker</option>
                    <option value="unorganized">Unorganized / Daily Wage / Domestic Worker</option>
                    <option value="salaried">Salaried / Private Employee</option>
                    <option value="none">Unemployed / Homemaker / Other</option>
                  </select>
                </div>

                {/* Education Level */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.education')}</label>
                  <select
                    value={profile.educationLevel}
                    onChange={(e) => updateProfileField('educationLevel', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="">Select Education Level...</option>
                    <option value="10th Pass">10th Class / Matriculate</option>
                    <option value="12th Pass">12th Class / Higher Secondary</option>
                    <option value="ITI">ITI / Technical Vocational</option>
                    <option value="Diploma">Diploma Holder</option>
                    <option value="Graduate">Graduate / Degree Holder</option>
                    <option value="Post-Graduate">Post-Graduate / Professional</option>
                    <option value="None">Literate / Non-Matriculate</option>
                  </select>
                </div>

                {/* Landholding (if farmer) */}
                {profile.occupation === 'farmer' && (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <label className="text-xs text-emerald-300 font-medium">{t('check.landholding')}</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 1.2"
                      value={profile.landholding}
                      onChange={(e) => updateProfileField('landholding', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <span className="text-[10px] text-emerald-400/80">Small farmer cutoff is &le; 2.0 Hectares (≈ 5 Acres)</span>
                  </div>
                )}

                {/* Bank Account */}
                <div className="space-y-1.5">
                  <label className="text-xs text-white font-medium">{t('check.bankAccount')}</label>
                  <select
                    value={profile.hasBankAccount}
                    onChange={(e) => updateProfileField('hasBankAccount', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="true">Yes (Active Bank Account linked to Aadhaar)</option>
                    <option value="false">No Bank Account linked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Special Declarations & Exclusions */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {t('check.declarationsDisqualifications')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Maternity Status */}
                <div className="space-y-1">
                  <label className="text-xs text-dark-muted font-medium block">{t('check.maternity')}</label>
                  <select
                    value={profile.maternityStatus}
                    onChange={(e) => updateProfileField('maternityStatus', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="none">Not Applicable</option>
                    <option value="pregnant">Pregnant Mother</option>
                    <option value="lactating">Lactating Mother (Infant)</option>
                  </select>
                </div>

                {/* Girl Child in Family */}
                <div className="space-y-1">
                  <label className="text-xs text-dark-muted font-medium block">Girl Child under 10 yrs</label>
                  <select
                    value={profile.hasGirlChild}
                    onChange={(e) => updateProfileField('hasGirlChild', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes (Qualifies for Sukanya Samriddhi)</option>
                  </select>
                </div>

                {/* Income Tax Payer */}
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="taxpayer"
                    checked={profile.isTaxPayer}
                    onChange={(e) => updateProfileField('isTaxPayer', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="taxpayer" className="text-xs text-white cursor-pointer">
                    {t('check.taxPayer')}
                  </label>
                </div>

                {/* Govt Employee */}
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="govtemp"
                    checked={profile.isGovtEmployee}
                    onChange={(e) => updateProfileField('isGovtEmployee', e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-rose-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="govtemp" className="text-xs text-white cursor-pointer">
                    {t('check.govtEmployee')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DISCOVERY RESULTS: REAL-TIME 20-SCHEME REASONING EVALUATION */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            {/* Scoreboard Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-fuchsia-500/10 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-brand-cyan">
                  20 Welfare Schemes Evaluated
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {summaryCounts.eligible} Schemes Immediately Available
                </h2>
                <p className="text-xs text-dark-muted mt-0.5">
                  {summaryCounts.needsInfo} require minor missing proofs; {summaryCounts.ineligible} excluded by statutory limits.
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> {summaryCounts.eligible} Eligible
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {summaryCounts.needsInfo} Needs Info
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> {summaryCounts.ineligible} Ineligible
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 w-full sm:w-auto">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeFilter === 'all'
                      ? 'bg-white/15 text-white shadow'
                      : 'text-dark-muted hover:text-white'
                  }`}
                >
                  All (20)
                </button>
                <button
                  onClick={() => setActiveFilter('ELIGIBLE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                    activeFilter === 'ELIGIBLE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-dark-muted hover:text-emerald-300'
                  }`}
                >
                  Eligible ({summaryCounts.eligible})
                </button>
                <button
                  onClick={() => setActiveFilter('NEEDS_MORE_INFO')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                    activeFilter === 'NEEDS_MORE_INFO'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-dark-muted hover:text-amber-300'
                  }`}
                >
                  Needs Info ({summaryCounts.needsInfo})
                </button>
                <button
                  onClick={() => setActiveFilter('INELIGIBLE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                    activeFilter === 'INELIGIBLE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-dark-muted hover:text-rose-300'
                  }`}
                >
                  Ineligible ({summaryCounts.ineligible})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search schemes or benefits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan placeholder:text-dark-muted/60"
                />
              </div>
            </div>

            {/* Scheme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvaluations.map(({ scheme, outcome }) => {
                const isEligible = outcome.verdict === 'ELIGIBLE';
                const isNeedsInfo = outcome.verdict === 'NEEDS_MORE_INFO';
                const isIneligible = outcome.verdict === 'INELIGIBLE';

                return (
                  <div
                    key={scheme.id}
                    className={`glass-card p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 hover:border-white/20 ${
                      isEligible
                        ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                        : isNeedsInfo
                        ? 'border-amber-500/30 bg-amber-500/[0.03]'
                        : 'border-white/10 bg-white/[0.02] opacity-80'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge value={scheme.category} />
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                            {scheme.language}
                          </span>
                        </div>
                        {isEligible ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3 h-3" /> Eligible
                          </span>
                        ) : isNeedsInfo ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0">
                            <AlertCircle className="w-3 h-3" /> Needs Info
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 shrink-0">
                            <XCircle className="w-3 h-3" /> Ineligible
                          </span>
                        )}
                      </div>

                      {/* Title & Key Benefit */}
                      <div>
                        <h3 className="font-bold text-sm text-white line-clamp-1">{scheme.short_name || scheme.title}</h3>
                        <p className="text-xs text-brand-cyan font-semibold mt-0.5 line-clamp-1">{scheme.key_benefit}</p>
                        <p className="text-[11px] text-dark-muted mt-1.5 line-clamp-2">{scheme.summary}</p>
                      </div>

                      {/* Clause Satisfaction Pills */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-dark-muted">Readiness Score:</span>
                          <span className="font-mono font-bold text-white">{outcome.readiness_score}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isEligible
                                ? 'bg-emerald-400'
                                : isNeedsInfo
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${outcome.readiness_score}%` }}
                          />
                        </div>

                        {/* Top failure or missing hint */}
                        {isIneligible && outcome.clause_details.find(c => c.status === 'FAILED') && (
                          <div className="text-[10px] text-rose-300/90 font-medium truncate pt-1">
                            &bull; Unmet: {outcome.clause_details.find(c => c.status === 'FAILED')?.failure_reason}
                          </div>
                        )}
                        {isNeedsInfo && outcome.missing_evidence[0] && (
                          <div className="text-[10px] text-amber-300/90 font-medium truncate pt-1">
                            &bull; Missing proof: {outcome.missing_evidence[0].missing_fact}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                      {scheme.source_url ? (
                        <a
                          href={scheme.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-dark-muted hover:text-white flex items-center gap-1 font-medium transition"
                        >
                          Official Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-dark-muted">Gov of India</span>
                      )}

                      <button
                        onClick={() => handleSelectSchemeForDeepDive(scheme)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition ${
                          isEligible
                            ? 'bg-emerald-500 text-dark-bg hover:bg-emerald-400 shadow-md'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Deep-Dive Graph &amp; Certificate <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredEvaluations.length === 0 && (
              <div className="glass-card p-12 text-center rounded-3xl border border-white/10 space-y-3">
                <AlertCircle className="w-8 h-8 text-dark-muted mx-auto" />
                <h3 className="font-bold text-white text-sm">No Matching Schemes Found</h3>
                <p className="text-xs text-dark-muted max-w-sm mx-auto">
                  Try clearing your search query or selecting another filter tab to view all 20 evaluated welfare programs.
                </p>
                <button
                  onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition"
                >
                  View All 20 Schemes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: SINGLE SCHEME DEEP-DIVE REASONING & CERTIFICATE GENERATION */}
      {/* ========================================================================= */}
      {viewMode === 'deep_dive' && (
        <div className="space-y-6">
          {/* Back to Intake Results Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => {
                setViewMode('intake');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1.5 font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> {t('check.backToMatches')}
            </button>

            {/* Scheme Switcher Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-dark-muted shrink-0">Switch Scheme:</span>
              <select
                value={selectedSchemeId}
                onChange={(e) => {
                  const s = MOCK_SCHEMES.find((item) => item.id === e.target.value);
                  if (s) {
                    setSelectedSchemeId(s.id);
                    syncFactsForScheme(s, profile);
                  }
                }}
                className="bg-white/10 border border-white/10 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-brand-cyan max-w-xs truncate"
              >
                {MOCK_SCHEMES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.short_name || s.title} ({s.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scheme Header Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Badge value={activeScheme.category} />
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                {activeScheme.language}
              </span>
              <span className="text-xs text-brand-cyan font-bold ml-auto">
                {activeScheme.key_benefit}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{activeScheme.title}</h2>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">{activeScheme.summary}</p>
            </div>
          </div>

          {/* Interactive Fact Inspector & Mutability Form */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">{t('check.conditionsHeader')}</h3>
                <p className="text-xs text-dark-muted">Verify or override specific facts to test 3-valued Open World reasoning.</p>
              </div>
              <button
                onClick={handleDeepEvaluate}
                disabled={evaluating}
                className="bg-brand-gradient text-dark-bg font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:opacity-95 transition flex items-center gap-1.5"
              >
                {evaluating ? t('check.evaluating') : t('check.runEngine')}
              </button>
            </div>

            <div className="space-y-4">
              {activeScheme.conditions.map((cond) => {
                const isUnknown = !!unknownFlags[cond.field];
                const val = deepFacts[cond.field];

                return (
                  <div key={cond.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        {cond.field_display}
                        {cond.unit && <span className="text-[10px] text-dark-muted">({cond.unit})</span>}
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          cond.mutability === 'IMMUTABLE' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {cond.mutability}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleDeepUnknown(cond.field)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition ${
                          isUnknown
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/5 text-dark-muted border-white/10 hover:text-white'
                        }`}
                      >
                        {isUnknown ? t('check.idkActive') : t('check.idkToggle')}
                      </button>
                    </div>

                    <p className="text-[11px] text-dark-muted italic">"{cond.original_clause}"</p>

                    {!isUnknown ? (
                      typeof cond.value === 'boolean' ? (
                        <select
                          value={val === true ? 'true' : val === false ? 'false' : ''}
                          onChange={(e) => updateDeepFact(cond.field, e.target.value === 'true')}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                        >
                          <option value="">Select option...</option>
                          <option value="true">Yes / True</option>
                          <option value="false">No / False</option>
                        </select>
                      ) : typeof cond.value === 'number' ? (
                        <input
                          type="number"
                          placeholder={`Enter value (Threshold: ${cond.operator} ${cond.value})`}
                          value={val ?? ''}
                          onChange={(e) => updateDeepFact(cond.field, e.target.value ? Number(e.target.value) : '')}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder={`Required: ${Array.isArray(cond.value) ? cond.value.join(', ') : cond.value}`}
                          value={val ?? ''}
                          onChange={(e) => updateDeepFact(cond.field, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                        />
                      )
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono">
                        [Fact Deferred: Evaluator will apply 3-valued Open-World logic producing UNKNOWN status]
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Exclusions */}
              {activeScheme.exclusions.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-rose-400 block">Disqualifying Statutory Exclusions:</span>
                  <div className="space-y-2">
                    {activeScheme.exclusions.map((exc) => (
                      <div key={exc.id} className="flex items-center justify-between text-xs">
                        <span className="text-dark-muted">{exc.title}:</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={deepFacts[exc.condition_field] === true}
                            onChange={(e) => updateDeepFact(exc.condition_field, e.target.checked)}
                            className="rounded border-white/20 text-rose-500 focus:ring-0"
                          />
                          <span className="text-[11px] text-white">Trigger this exclusion</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reasoning Results Card */}
          {result && (
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-8">
              {/* Verdict Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {result.verdict === 'ELIGIBLE' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                        <CheckCircle className="w-4 h-4" /> {t('check.fullyQualified')}
                      </span>
                    )}
                    {result.verdict === 'NEEDS_MORE_INFO' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30">
                        <HelpCircle className="w-4 h-4" /> {t('check.needsInfoTitle')}
                      </span>
                    )}
                    {result.verdict === 'INELIGIBLE' && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30">
                        <XCircle className="w-4 h-4" /> {t('check.ineligibleTitle')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white">{result.scheme_title}</h3>
                  <p className="text-xs text-dark-muted">{result.citizen_summary}</p>
                </div>

                <div className="flex items-center gap-4">
                  <RadialGauge
                    score={result.readiness_score}
                    size={80}
                    label="Readiness"
                  />
                  <button
                    onClick={() => setIsCertificateOpen(true)}
                    className="bg-brand-gradient text-dark-bg font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 hover:opacity-95 transition"
                  >
                    <Printer className="w-4 h-4" /> {t('check.certificateBtn')}
                  </button>
                </div>
              </div>

              {/* Clause Explainability Subgraph Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t('check.explainability')}
                </h4>
                <div className="space-y-2">
                  {result.clause_details.map((c) => (
                    <div
                      key={c.clause_id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{c.field_display}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-dark-muted">
                            {c.mutability}
                          </span>
                        </div>
                        <p className="text-[11px] text-dark-muted italic">"{c.original_clause}"</p>
                        {c.failure_reason && (
                          <p className="text-[11px] text-rose-400 font-medium">{c.failure_reason}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right text-[11px]">
                          <span className="text-dark-muted block">Citizen Value:</span>
                          <span className="font-mono font-bold text-white">{c.citizen_value}</span>
                        </div>
                        {c.status === 'PASSED' && (
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                            PASSED
                          </span>
                        )}
                        {c.status === 'FAILED' && (
                          <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                            FAILED
                          </span>
                        )}
                        {c.status === 'UNKNOWN' && (
                          <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px]">
                            UNKNOWN
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Evidence Required for 100% */}
              {result.missing_evidence.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> {t('check.missingEvidence')}
                  </h4>
                  <div className="space-y-2">
                    {result.missing_evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-200">{ev.missing_fact}</span>
                          <span className="text-[10px] font-mono text-dark-muted">Authority: {ev.issuing_authority}</span>
                        </div>
                        <p className="text-dark-muted text-[11px]">{ev.citizen_action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              {result.actionable_recommendations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t('check.remediesTitle')}
                  </h4>
                  <div className="space-y-2">
                    {result.actionable_recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 text-xs"
                      >
                        <span className="text-dark-muted">{rec.recommendation}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                          rec.difficulty === 'Easy'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : rec.difficulty === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {rec.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Certificate Modal */}
          {result && (
            <CitizenCertificateModal
              isOpen={isCertificateOpen}
              onClose={() => setIsCertificateOpen(false)}
              outcome={result}
              scheme={activeScheme}
              citizenFacts={deepFacts}
            />
          )}
        </div>
      )}
    </div>
  );
};
