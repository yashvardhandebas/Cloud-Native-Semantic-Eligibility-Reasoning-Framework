import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Share2, 
  Sparkles,
  ShieldAlert,
  ExternalLink,
  UserCheck,
  Building,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { evaluateEligibility } from '../api/client';
import { CitizenFacts, EvaluationOutcome } from '../types';
import { RadialGauge } from '../components/RadialGauge';
import { Badge } from '../components/Badge';
import { CitizenCertificateModal } from '../components/CitizenCertificateModal';

export const EligibilityCheckPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId?: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(schemeId ? 2 : 1);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemeId || MOCK_SCHEMES[0].id);

  const activeScheme = MOCK_SCHEMES.find((s) => s.id === selectedSchemeId) || MOCK_SCHEMES[0];

  // Citizen Fact State Object
  const [facts, setFacts] = useState<Record<string, any>>({});
  const [unknownFlags, setUnknownFlags] = useState<Record<string, boolean>>({});

  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationOutcome | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);

  // Sync facts when scheme changes or when loading presets
  useEffect(() => {
    if (activeScheme) {
      // Default to empty facts
      const initial: Record<string, any> = { scheme_id: activeScheme.id };
      activeScheme.conditions.forEach((c) => {
        initial[c.field] = '';
      });
      setFacts(initial);
      setUnknownFlags({});
    }
  }, [selectedSchemeId]);

  const loadDemoPersona = (personaType: 'eligible' | 'needs_info' | 'ineligible') => {
    if (!activeScheme.demo_profiles) return;
    const profile = activeScheme.demo_profiles[personaType];
    if (profile) {
      setFacts({ ...profile.facts, scheme_id: activeScheme.id });
      // Reset unknown toggles and set for null values
      const flags: Record<string, boolean> = {};
      Object.entries(profile.facts).forEach(([k, v]) => {
        if (v === null || v === undefined) {
          flags[k] = true;
        }
      });
      setUnknownFlags(flags);
    }
  };

  const updateFact = (field: string, value: any) => {
    setFacts((prev) => ({ ...prev, [field]: value }));
    setUnknownFlags((prev) => ({ ...prev, [field]: false }));
  };

  const toggleUnknown = (field: string) => {
    const isNowUnknown = !unknownFlags[field];
    setUnknownFlags((prev) => ({ ...prev, [field]: isNowUnknown }));
    setFacts((prev) => ({ ...prev, [field]: isNowUnknown ? null : '' }));
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    const preparedFacts: CitizenFacts = {
      ...facts,
      scheme_id: activeScheme.id,
    };

    // Apply explicit null for unknown toggled fields
    Object.keys(unknownFlags).forEach((field) => {
      if (unknownFlags[field]) {
        preparedFacts[field] = null;
      }
    });

    const outcome = await evaluateEligibility(preparedFacts);
    setResult(outcome);
    setEvaluating(false);
    setStep(4);
  };

  const handleReset = () => {
    setStep(schemeId ? 2 : 1);
    setResult(null);
    setUnknownFlags({});
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Official Advisory:</strong> Demo built from public guidelines. Not an official eligibility decision. Verify on the official portal.
          </span>
        </div>
        {activeScheme.source_url && (
          <a
            href={activeScheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-cyan hover:underline flex items-center gap-1 font-semibold shrink-0"
          >
            Official Portal <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Step Wizard Header */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-dark-bg font-bold text-xs">
            {step}
          </span>
          <span className="text-xs font-semibold text-white">
            {step === 1 && 'Step 1: Choose Welfare Scheme'}
            {step === 2 && `Step 2: Enter Facts for ${activeScheme.short_name || activeScheme.title}`}
            {step === 3 && 'Step 3: Review Answers'}
            {step === 4 && 'Step 4: Semantic Verdict & Readiness Plan'}
          </span>
        </div>
        <span className="text-[11px] text-dark-muted font-mono">Step {step} of 4</span>
      </div>

      {/* Step 1: Scheme Selector */}
      {step === 1 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Select Welfare Scheme to Reason Over</h2>
            <p className="text-xs text-dark-muted">Choose from the 13 verified public welfare schemes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {MOCK_SCHEMES.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => { setSelectedSchemeId(scheme.id); setStep(2); }}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedSchemeId === scheme.id
                    ? 'bg-brand-cyan/15 border-brand-cyan text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-dark-muted hover:text-white hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge value={scheme.category} />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white">
                      {scheme.language}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-white line-clamp-1">{scheme.short_name || scheme.title}</h3>
                  <p className="text-[11px] text-brand-cyan font-medium line-clamp-1">{scheme.key_benefit}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-dark-muted shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Citizen Facts Intake Form */}
      {step === 2 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          {/* Demo Preset Bar */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs font-semibold text-white">Load Demo Profile (1-Click Test):</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => loadDemoPersona('eligible')}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition"
              >
                Eligible Preset
              </button>
              <button
                onClick={() => loadDemoPersona('needs_info')}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition"
              >
                Needs Info Preset
              </button>
              <button
                onClick={() => loadDemoPersona('ineligible')}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition"
              >
                Ineligible Preset
              </button>
            </div>
          </div>

          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge value={activeScheme.category} />
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">{activeScheme.language}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{activeScheme.title}</h2>
            <p className="text-xs text-dark-muted mt-1">{activeScheme.summary}</p>
          </div>

          {/* Dynamic Condition Fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-dark-muted uppercase tracking-wider">
              Eligibility Conditions & Declarations
            </h3>

            {activeScheme.conditions.map((cond) => {
              const isUnknown = !!unknownFlags[cond.field];
              const val = facts[cond.field];

              return (
                <div key={cond.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      {cond.field_display}
                      {cond.unit && <span className="text-[10px] text-dark-muted">({cond.unit})</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleUnknown(cond.field)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono transition ${
                        isUnknown
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-white/5 text-dark-muted border-white/10 hover:text-white'
                      }`}
                    >
                      {isUnknown ? "Status: I Don't Know (Deferred)" : "I don't know / Missing"}
                    </button>
                  </div>

                  <p className="text-[11px] text-dark-muted italic">"{cond.original_clause}"</p>

                  {!isUnknown ? (
                    typeof cond.value === 'boolean' ? (
                      <select
                        value={val === true ? 'true' : val === false ? 'false' : ''}
                        onChange={(e) => updateFact(cond.field, e.target.value === 'true')}
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
                        onChange={(e) => updateFact(cond.field, e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                      />
                    ) : Array.isArray(cond.value) ? (
                      <input
                        type="text"
                        placeholder={`e.g. ${cond.value.join(', ')}`}
                        value={val ?? ''}
                        onChange={(e) => updateFact(cond.field, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={`Required value: ${cond.value}`}
                        value={val ?? ''}
                        onChange={(e) => updateFact(cond.field, e.target.value)}
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

            {/* Scheme Exclusions Disclaimers */}
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
                          checked={facts[exc.condition_field] === true}
                          onChange={(e) => updateFact(exc.condition_field, e.target.checked)}
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

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-dark-muted hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Schemes
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-brand-gradient text-dark-bg font-bold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
            >
              Review Answers <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review Answers */}
      {step === 3 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Review Citizen Fact Declaration</h2>
            <p className="text-xs text-dark-muted">Verify answers before dispatching to the Graph Reasoning Engine.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5">
            {activeScheme.conditions.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-dark-muted">{c.field_display}:</span>
                <span className="text-white font-mono font-semibold">
                  {unknownFlags[c.field] ? (
                    <span className="text-amber-400 font-bold">MISSING / UNKNOWN</span>
                  ) : facts[c.field] !== undefined && facts[c.field] !== '' ? (
                    String(facts[c.field])
                  ) : (
                    <span className="text-dark-muted">Not Provided</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setStep(2)}
              className="text-xs text-dark-muted hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Edit Facts
            </button>
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="bg-brand-gradient text-dark-bg font-bold text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2"
            >
              {evaluating ? (
                <>Evaluating on Graph...</>
              ) : (
                <>Run Semantic Reasoning Engine <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Semantic Verdict & Readiness Plan */}
      {step === 4 && result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Verdict Banner */}
          <div
            className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
              result.verdict === 'ELIGIBLE'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : result.verdict === 'NEEDS_MORE_INFO'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}
          >
            <div className="flex items-start gap-4">
              {result.verdict === 'ELIGIBLE' && <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />}
              {result.verdict === 'NEEDS_MORE_INFO' && <QuestionIcon className="w-8 h-8 text-amber-400 shrink-0" />}
              {result.verdict === 'INELIGIBLE' && <XCircle className="w-8 h-8 text-rose-400 shrink-0" />}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-dark-muted">Eligibility Verdict</span>
                  <Badge type="verdict" value={result.verdict} />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {result.verdict === 'ELIGIBLE' && 'Fully Qualified for Scheme Benefits'}
                  {result.verdict === 'NEEDS_MORE_INFO' && 'Profile Incomplete: Additional Evidence Required'}
                  {result.verdict === 'INELIGIBLE' && 'Citizen Ineligible for Scheme Entitlements'}
                </h2>
                <p className="text-xs text-dark-muted max-w-xl">
                  {result.verdict === 'ELIGIBLE' && `Citizen facts satisfy all governing clauses for ${activeScheme.short_name || activeScheme.title}.`}
                  {result.verdict === 'NEEDS_MORE_INFO' && 'Evaluation completed with open-world 3-valued logic. Key facts remain unverified.'}
                  {result.verdict === 'INELIGIBLE' && 'At least one mandatory condition was unmet or a statutory exclusion was triggered.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <RadialGauge score={result.readiness_score} size={84} strokeWidth={8} />
              <span className="text-[11px] text-dark-muted mt-1 font-mono">Readiness Score</span>
            </div>
          </div>

          {/* Clause-by-Clause Explainability Card */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-cyan" />
              Clause-by-Clause Subgraph Explainability
            </h3>

            <div className="space-y-3">
              {result.clause_details.map((clause, idx) => (
                <div
                  key={clause.clause_id || idx}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{clause.field_display}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-dark-muted">
                        {clause.mutability}
                      </span>
                    </div>
                    <p className="text-[11px] text-dark-muted italic">"{clause.original_clause}"</p>
                    {clause.failure_reason && (
                      <p className="text-[11px] text-rose-300 font-semibold">{clause.failure_reason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-[10px] text-dark-muted block">Expected / Given</span>
                      <span className="text-white font-mono text-[11px]">
                        {clause.expected_value} | {clause.citizen_value}
                      </span>
                    </div>
                    <Badge type="status" value={clause.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Evidence & Actionable Plan */}
          {result.missing_evidence.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 space-y-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Missing Evidence Required to Attain 100% Readiness
              </h3>
              <div className="space-y-2">
                {result.missing_evidence.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <span className="font-bold text-white block">{item.required_document}</span>
                    <p className="text-dark-muted text-[11px]">{item.citizen_action}</p>
                    <span className="text-[10px] text-dark-muted/80 font-mono">Authority: {item.issuing_authority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={handleReset}
              className="text-xs text-dark-muted hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-evaluate Scheme
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/schemes')}
                className="bg-white/5 border border-white/10 text-white text-xs px-4 py-2 rounded-xl hover:bg-white/10 transition"
              >
                Browse Other Schemes
              </button>
              <button
                onClick={() => setIsCertificateOpen(true)}
                className="bg-brand-gradient text-dark-bg font-bold text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 hover:opacity-95 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Official Certificate & Print
              </button>
            </div>
          </div>

          {/* Citizen Certificate Modal */}
          {result && (
            <CitizenCertificateModal
              isOpen={isCertificateOpen}
              onClose={() => setIsCertificateOpen(false)}
              outcome={result}
              scheme={activeScheme}
              citizenFacts={facts}
            />
          )}
        </div>
      )}
    </div>
  );
};
