import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { evaluateEligibility } from '../api/client';
import { CitizenFacts, EvaluationOutcome } from '../types';
import { RadialGauge } from '../components/RadialGauge';
import { Badge } from '../components/Badge';

export const EligibilityCheckPage: React.FC = () => {
  const { schemeId } = useParams<{ schemeId?: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(schemeId ? 2 : 1);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(schemeId || MOCK_SCHEMES[0].id);

  // Form State
  const [casteCategory, setCasteCategory] = useState<string>('SC');
  const [educationLevel, setEducationLevel] = useState<string>('10th');
  const [incomeThreshold, setIncomeThreshold] = useState<string>('210000');
  const [incomeUnknown, setIncomeUnknown] = useState<boolean>(false);
  const [incomeTaxPayer, setIncomeTaxPayer] = useState<boolean>(false);

  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationOutcome | null>(null);

  const handleEvaluate = async () => {
    setEvaluating(true);
    const facts: CitizenFacts = {
      scheme_id: selectedSchemeId,
      caste_category: casteCategory,
      education_level: educationLevel,
      income_threshold: incomeUnknown ? null : Number(incomeThreshold),
      income_tax_payer_status: incomeTaxPayer,
    };

    const outcome = await evaluateEligibility(facts);
    setResult(outcome);
    setEvaluating(false);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setIncomeUnknown(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Wizard Step Indicator Header */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-dark-bg font-bold text-xs">
            {step}
          </span>
          <span className="text-xs font-semibold text-white">
            {step === 1 && 'Step 1: Choose Welfare Scheme'}
            {step === 2 && 'Step 2: Enter Citizen Facts'}
            {step === 3 && 'Step 3: Review Answers'}
            {step === 4 && 'Step 4: Explainable Verdict & Readiness'}
          </span>
        </div>
        {step < 4 && <span className="text-[11px] text-dark-muted font-mono">Step {step} of 4</span>}
      </div>

      {/* Step 1: Select Scheme */}
      {step === 1 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Select Welfare Scheme to Evaluate</h2>
            <p className="text-xs text-dark-muted">Choose a scheme from the ingested ontology registry.</p>
          </div>

          <div className="space-y-3">
            {MOCK_SCHEMES.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => setSelectedSchemeId(scheme.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedSchemeId === scheme.id
                    ? 'bg-brand-cyan/15 border-brand-cyan text-white'
                    : 'bg-white/5 border-white/10 text-dark-muted hover:text-white'
                }`}
              >
                <div>
                  <h3 className="font-bold text-sm text-white">{scheme.title}</h3>
                  <p className="text-xs text-dark-muted line-clamp-1">{scheme.summary}</p>
                </div>
                <Badge value={scheme.category} />
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-brand-gradient text-dark-bg font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            Continue to Citizen Facts <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Citizen Facts Form */}
      {step === 2 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Provide Citizen Facts</h2>
            <p className="text-xs text-dark-muted">Enter citizen parameters. Use "I don't know" to test UNKNOWN missing facts.</p>
          </div>

          <div className="space-y-4">
            {/* Caste Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Caste Category (Immutable Factor)</label>
              <select
                value={casteCategory}
                onChange={(e) => setCasteCategory(e.target.value)}
                className="w-full bg-dark-bg border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="OBC">Other Backward Classes (OBC)</option>
                <option value="General">General Category</option>
              </select>
            </div>

            {/* Qualification */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Education Qualification</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full bg-dark-bg border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="10th">10th Matriculation Pass</option>
                <option value="12th">12th Higher Secondary Pass</option>
                <option value="Graduate">Bachelor Degree / Graduate</option>
                <option value="Below 10th">Below 10th</option>
              </select>
            </div>

            {/* Income Threshold with "I don't know" option */}
            <div className="space-y-1 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-white">Annual Family Income (INR)</label>
                <button
                  type="button"
                  onClick={() => setIncomeUnknown(!incomeUnknown)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition ${
                    incomeUnknown
                      ? 'bg-brand-amber text-dark-bg border-brand-amber font-bold'
                      : 'bg-white/5 text-dark-muted border-white/15 hover:text-white'
                  }`}
                >
                  {incomeUnknown ? '✓ Fact Marked UNKNOWN' : 'I don\'t know'}
                </button>
              </div>

              {!incomeUnknown ? (
                <input
                  type="number"
                  value={incomeThreshold}
                  onChange={(e) => setIncomeThreshold(e.target.value)}
                  placeholder="e.g. 210000"
                  className="w-full bg-dark-bg border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                />
              ) : (
                <div className="p-3 rounded-xl bg-brand-amber/10 border border-brand-amber/30 text-xs text-brand-amber flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Fact will be submitted as MISSING (UNKNOWN). Reasoning engine will treat as non-disqualifying unknown.</span>
                </div>
              )}
            </div>

            {/* Preset Scenarios for Quick Testing */}
            <div className="pt-2">
              <span className="text-[11px] text-dark-muted font-semibold uppercase tracking-wider block mb-2">Quick Test Preset Scenarios:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setCasteCategory('SC'); setEducationLevel('10th'); setIncomeThreshold('210000'); setIncomeUnknown(false); }}
                  className="px-3 py-1 rounded-full bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald text-xs font-medium hover:bg-brand-emerald/25"
                >
                  Preset 1: Eligible Profile (₹2.1L)
                </button>
                <button
                  type="button"
                  onClick={() => { setCasteCategory('SC'); setEducationLevel('10th'); setIncomeUnknown(true); }}
                  className="px-3 py-1 rounded-full bg-brand-amber/15 border border-brand-amber/30 text-brand-amber text-xs font-medium hover:bg-brand-amber/25"
                >
                  Preset 2: Missing Income (Needs Info)
                </button>
                <button
                  type="button"
                  onClick={() => { setCasteCategory('SC'); setEducationLevel('10th'); setIncomeThreshold('320000'); setIncomeUnknown(false); }}
                  className="px-3 py-1 rounded-full bg-brand-rose/15 border border-brand-rose/30 text-brand-rose text-xs font-medium hover:bg-brand-rose/25"
                >
                  Preset 3: ₹3.2L High Income (Ineligible)
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="flex-1 bg-brand-gradient text-dark-bg font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
            >
              {evaluating ? 'Executing Graph RAG Evaluation...' : 'Evaluate Citizen Eligibility'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results & Explainability Outcome */}
      {step === 4 && result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Verdict Banner */}
          <div
            className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
              result.verdict === 'ELIGIBLE'
                ? 'bg-brand-emerald/15 border-brand-emerald/40 text-brand-emerald'
                : result.verdict === 'INELIGIBLE'
                ? 'bg-brand-rose/15 border-brand-rose/40 text-brand-rose'
                : 'bg-brand-amber/15 border-brand-amber/40 text-brand-amber'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge type="verdict" value={result.verdict} className="text-xs px-3 py-1" />
                <span className="text-xs font-mono font-medium text-white/80">Confidence: {(result.overall_confidence * 100).toFixed(0)}%</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-2">{result.scheme_title}</h2>
              <p className="text-xs text-white/90 leading-relaxed">{result.citizen_summary}</p>
            </div>

            <RadialGauge score={result.readiness_score} />
          </div>

          {/* Clause-by-Clause Explainability Table */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Clause-by-Clause Evaluation Table</h3>
            <div className="space-y-3">
              {result.clause_details.map((detail) => (
                <div key={detail.clause_id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge type="status" value={detail.status} />
                      <span className="font-bold text-xs text-white">{detail.field_display}</span>
                    </div>
                    <Badge type="mutability" value={detail.mutability} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-dark-bg/60 border border-white/5">
                      <span className="text-dark-muted block text-[10px]">REQUIRED RULE:</span>
                      <span className="text-white font-mono">{detail.expected_value}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-dark-bg/60 border border-white/5">
                      <span className="text-dark-muted block text-[10px]">CITIZEN FACT:</span>
                      <span className="text-white font-mono">{detail.citizen_value}</span>
                    </div>
                  </div>

                  <p className="text-xs text-dark-muted italic">"{detail.original_clause}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Evidence Section if UNKNOWN */}
          {result.missing_evidence.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-brand-amber/30 bg-brand-amber/5 space-y-4">
              <div className="flex items-center gap-2 text-brand-amber font-bold text-sm">
                <AlertCircle className="w-5 h-5" /> Required Missing Proof Documents
              </div>
              <div className="space-y-3">
                {result.missing_evidence.map((ev, i) => (
                  <div key={i} className="p-3 rounded-xl bg-dark-bg/80 border border-white/10 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{ev.required_document}</span>
                      <span className="text-brand-amber font-mono">{ev.issuing_authority}</span>
                    </div>
                    <p className="text-dark-muted">{ev.citizen_action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations to Flip Verdict */}
          {result.actionable_recommendations.length > 0 && (
            <div className="glass-card p-6 rounded-3xl border border-brand-cyan/30 bg-brand-cyan/5 space-y-4">
              <div className="flex items-center gap-2 text-brand-cyan font-bold text-sm">
                <Sparkles className="w-5 h-5" /> Actionable Recommendations to Reach Eligibility
              </div>
              <div className="space-y-3">
                {result.actionable_recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-dark-bg/80 border border-white/10 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Target Field: {rec.target_field}</span>
                      <Badge value={rec.difficulty} />
                    </div>
                    <p className="text-dark-muted">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Edit Answers
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" /> Download Report (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
