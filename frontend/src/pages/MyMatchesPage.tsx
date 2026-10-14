import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  HelpCircle, 
  XCircle, 
  ArrowRight, 
  Download, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  User, 
  Filter, 
  FileText,
  ExternalLink
} from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { evaluateSchemeLocally } from '../api/client';
import { GlowCard } from '../components/GlowCard';
import { Badge } from '../components/Badge';
import { RadialGauge } from '../components/RadialGauge';

interface PersonaPreset {
  name: string;
  description: string;
  facts: Record<string, any>;
}

const DEMO_PERSONAS: PersonaPreset[] = [
  {
    name: 'Rural Small Farmer (Central)',
    description: 'Farmer with 1.2 ha land, non-taxpayer, BPL living in kutcha house',
    facts: {
      occupation: 'farmer',
      land_ownership: 1.2,
      bpl_status: true,
      house_type: 'kutcha',
      owns_vehicle: false,
      has_lpg_connection: false,
      income_tax_payer_status: false,
      institutional_landholder: false,
      constitutional_post_holder: false,
      government_employment_status: false,
      age_min: 42,
    }
  },
  {
    name: 'SC College Student (Tamil Nadu)',
    description: '12th pass SC student from TN government school, family income ₹1.8L',
    facts: {
      caste_category: 'SC',
      education_level: '12th',
      school_type: 'government',
      income_threshold: 180000,
      residence_state: 'Tamil Nadu',
      gender: 'female',
      age_min: 19,
      income_tax_payer_status: false,
      government_employment_status: false,
      owns_vehicle: false,
    }
  },
  {
    name: 'Traditional Carpenter Artisan',
    description: '36-year-old self-employed carpenter, non-taxpayer, no defaulted loans',
    facts: {
      occupation: 'artisan',
      trade: 'carpenter',
      age_min: 36,
      age_max: 36,
      government_employment_status: false,
      income_tax_payer_status: false,
      existing_scheme_beneficiary: 'none',
    }
  },
  {
    name: 'Senior Citizen BPL Resident (Hindi Belt)',
    description: '68-year-old BPL citizen, no existing social pension',
    facts: {
      age_min: 68,
      bpl_status: true,
      has_pension_scheme: false,
      income_tax_payer_status: false,
      gender: 'female',
      has_lpg_connection: false,
    }
  }
];

export const MyMatchesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Unified Citizen Profile Form State
  const [profile, setProfile] = useState<Record<string, any>>({
    gender: 'female',
    age_min: 32,
    caste_category: 'SC',
    residence_state: 'Tamil Nadu',
    income_threshold: 180000,
    occupation: 'farmer',
    education_level: '10th',
    bpl_status: true,
    house_type: 'kutcha',
    has_lpg_connection: false,
    owns_vehicle: false,
    income_tax_payer_status: false,
    government_employment_status: false,
  });

  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  const loadPreset = (preset: PersonaPreset) => {
    setProfile(preset.facts);
  };

  const toggleWhy = (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWhy((prev) => ({ ...prev, [schemeId]: !prev[schemeId] }));
  };

  // Evaluate profile across ALL schemes
  const evaluatedSchemes = useMemo(() => {
    return MOCK_SCHEMES.map((scheme) => {
      const outcome = evaluateSchemeLocally(scheme, { ...profile, scheme_id: scheme.id });
      return {
        scheme,
        outcome,
      };
    }).sort((a, b) => {
      // Sort priority: ELIGIBLE (100) -> NEEDS_MORE_INFO (50-99) -> INELIGIBLE (0)
      const rankOrder = { ELIGIBLE: 3, NEEDS_MORE_INFO: 2, INELIGIBLE: 1 };
      const rankDiff = rankOrder[b.outcome.verdict] - rankOrder[a.outcome.verdict];
      if (rankDiff !== 0) return rankDiff;
      return b.outcome.readiness_score - a.outcome.readiness_score;
    });
  }, [profile]);

  const filteredMatches = evaluatedSchemes.filter((item) => {
    if (filterVerdict === 'ALL') return true;
    return item.outcome.verdict === filterVerdict;
  });

  const eligibleCount = evaluatedSchemes.filter((i) => i.outcome.verdict === 'ELIGIBLE').length;
  const needsInfoCount = evaluatedSchemes.filter((i) => i.outcome.verdict === 'NEEDS_MORE_INFO').length;
  const ineligibleCount = evaluatedSchemes.filter((i) => i.outcome.verdict === 'INELIGIBLE').length;

  const exportCSV = () => {
    const header = 'Scheme ID,Title,Category,Language,Verdict,Readiness Score,Key Benefit\n';
    const rows = evaluatedSchemes.map(
      (item) => `"${item.scheme.id}","${item.scheme.title}","${item.scheme.category}","${item.scheme.language}","${item.outcome.verdict}","${item.outcome.readiness_score}%","${item.scheme.key_benefit || ''}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evaluated_scheme_matches.csv';
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {t('check.officialAdvisory')}
          </span>
        </div>
        <button
          onClick={exportCSV}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5" /> {t('matches.exportCsv')}
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('matches.title')}</h1>
        <p className="text-xs text-dark-muted">
          {t('matches.subtitle')}
        </p>
      </div>

      {/* Quick Load Persona Bar */}
      <div className="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Sparkles className="w-4 h-4 text-brand-cyan" />
          <span>{t('matches.loadPersona')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEMO_PERSONAS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset)}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-cyan/40 hover:bg-white/10 text-left transition space-y-1"
            >
              <span className="font-bold text-xs text-white block">{preset.name}</span>
              <p className="text-[11px] text-dark-muted line-clamp-2">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Scoreboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterVerdict('ALL')}
          className={`p-4 rounded-2xl glass-card border cursor-pointer transition text-center ${
            filterVerdict === 'ALL' ? 'border-brand-cyan bg-brand-cyan/10' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-xs text-dark-muted block">{t('matches.matchedSchemes')}</span>
          <span className="text-2xl font-bold text-white font-mono">{MOCK_SCHEMES.length}</span>
        </div>
        <div
          onClick={() => setFilterVerdict('ELIGIBLE')}
          className={`p-4 rounded-2xl glass-card border cursor-pointer transition text-center ${
            filterVerdict === 'ELIGIBLE' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-xs text-emerald-400 block">{t('verdicts.ELIGIBLE')}</span>
          <span className="text-2xl font-bold text-emerald-300 font-mono">{eligibleCount}</span>
        </div>
        <div
          onClick={() => setFilterVerdict('NEEDS_MORE_INFO')}
          className={`p-4 rounded-2xl glass-card border cursor-pointer transition text-center ${
            filterVerdict === 'NEEDS_MORE_INFO' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-xs text-amber-400 block">{t('verdicts.NEEDS_MORE_INFO')}</span>
          <span className="text-2xl font-bold text-amber-300 font-mono">{needsInfoCount}</span>
        </div>
        <div
          onClick={() => setFilterVerdict('INELIGIBLE')}
          className={`p-4 rounded-2xl glass-card border cursor-pointer transition text-center ${
            filterVerdict === 'INELIGIBLE' ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 hover:border-white/20'
          }`}
        >
          <span className="text-xs text-rose-400 block">{t('verdicts.INELIGIBLE')}</span>
          <span className="text-2xl font-bold text-rose-300 font-mono">{ineligibleCount}</span>
        </div>
      </div>

      {/* Evaluated Scheme Rankings List */}
      <div className="space-y-4">
        {filteredMatches.map(({ scheme, outcome }, idx) => {
          const isExpanded = !!expandedWhy[scheme.id];
          const missingFacts = outcome.clause_details.filter((c) => c.status === 'UNKNOWN');
          const failedFacts = outcome.clause_details.filter((c) => c.status === 'FAILED');

          return (
            <div
              key={scheme.id}
              className={`glass-card p-5 rounded-3xl border transition space-y-4 ${
                outcome.verdict === 'ELIGIBLE'
                  ? 'border-emerald-500/30 hover:border-emerald-500/50'
                  : outcome.verdict === 'NEEDS_MORE_INFO'
                  ? 'border-amber-500/30 hover:border-amber-500/50'
                  : 'border-rose-500/20 hover:border-rose-500/40'
              }`}
            >
              <div
                onClick={() => navigate(`/check/${scheme.id}`)}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-bold font-mono flex items-center justify-center text-xs shrink-0 mt-0.5">
                    #{idx + 1}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge value={scheme.category} />
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                        {scheme.language}
                      </span>
                      {scheme.key_benefit && (
                        <span className="text-xs font-semibold text-brand-cyan">
                          {scheme.key_benefit}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white hover:text-brand-cyan transition" title={scheme.title}>
                      {scheme.short_name || scheme.title}
                    </h3>
                    <p className="text-xs text-dark-muted line-clamp-1">{scheme.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[11px] text-dark-muted block">{t('matches.readinessScore')}</span>
                    <span className={`text-lg font-bold font-mono ${
                      outcome.verdict === 'ELIGIBLE' ? 'text-emerald-400' : outcome.verdict === 'NEEDS_MORE_INFO' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {outcome.readiness_score}%
                    </span>
                  </div>

                  <Badge type="verdict" value={outcome.verdict} />

                  <button
                    onClick={(e) => toggleWhy(scheme.id, e)}
                    className="flex items-center gap-1 text-xs text-brand-cyan hover:underline font-semibold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl"
                  >
                    {t('matches.whyBtn')} {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <ArrowRight className="w-4 h-4 text-dark-muted hidden md:block" />
                </div>
              </div>

              {/* Expandable "Why?" Semantic Reasoning Breakdown */}
              {isExpanded && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-white">Semantic Graph Decision Explanation:</span>
                    <span className="text-[11px] text-dark-muted font-mono">{scheme.conditions.length} Conditions Evaluated</span>
                  </div>

                  {outcome.verdict === 'ELIGIBLE' && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      ✓ All required conditions satisfied. No disqualifying statutory exclusions matched.
                    </div>
                  )}

                  {outcome.verdict === 'NEEDS_MORE_INFO' && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                      <span className="font-bold block">Missing Facts (Open-World UNKNOWN Status):</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {missingFacts.map((m, i) => (
                          <li key={i}>
                            <strong>{m.field_display}</strong>: {m.original_clause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {outcome.verdict === 'INELIGIBLE' && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                      <span className="font-bold block">Disqualification / Unmet Criteria:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                        {failedFacts.map((f, i) => (
                          <li key={i}>
                            <strong>{f.field_display}</strong>: {f.failure_reason || f.original_clause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-dark-muted uppercase">Evaluated Clauses:</span>
                    {outcome.clause_details.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5">
                        <span className="text-white">{c.field_display} ({c.expected_value})</span>
                        <Badge type="status" value={c.status} />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate(`/check/${scheme.id}`)}
                      className="text-xs text-brand-cyan hover:underline font-semibold flex items-center gap-1"
                    >
                      Open Full Interactive Wizard for this Scheme <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
