import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle, AlertCircle, XCircle, Award, ExternalLink, QrCode } from 'lucide-react';
import { EvaluationOutcome, Scheme } from '../types';

interface CitizenCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  outcome: EvaluationOutcome;
  scheme: Scheme;
  citizenFacts: Record<string, any>;
}

export const CitizenCertificateModal: React.FC<CitizenCertificateModalProps> = ({
  isOpen,
  onClose,
  outcome,
  scheme,
  citizenFacts
}) => {
  if (!isOpen) return null;

  const certificateId = `GOV-IN-${scheme.id.substring(0, 4).toUpperCase()}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#0b0c10] text-[#f5f5f4] border border-white/20 rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative my-8 print:border-none print:shadow-none print:m-0 print:p-6 print:bg-white print:text-black">
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="border-b-2 border-white/20 pb-6 mb-6 text-center space-y-2 print:border-black">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Official Semantic Verification Certificate
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase print:text-black">
            CITIZEN WELFARE ELIGIBILITY DECISION RECORD
          </h2>
          <p className="text-xs text-dark-muted print:text-gray-600 max-w-lg mx-auto">
            Cloud-Native Semantic Reasoning Framework • BITE412L Research Implementation • Ingested via Controlled Ontology & Graph RAG
          </p>

          <div className="flex flex-wrap items-center justify-between pt-3 text-xs font-mono text-dark-muted print:text-gray-700">
            <span>Certificate Ref: <strong className="text-white print:text-black">{certificateId}</strong></span>
            <span>Date: <strong>{formattedDate}</strong></span>
          </div>
        </div>

        {/* Scheme & Verdict Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 col-span-2 space-y-1 print:border-gray-300">
            <span className="text-[10px] font-mono uppercase text-dark-muted print:text-gray-600">Target Welfare Scheme</span>
            <h3 className="text-base font-bold text-white print:text-black">{scheme.title}</h3>
            <p className="text-xs text-brand-emerald font-semibold">{scheme.key_benefit || 'Statutory Welfare Benefit'}</p>
            <div className="text-[11px] text-dark-muted pt-1">
              Category: <strong>{scheme.category}</strong> • Jurisdiction: <strong>{scheme.state}</strong> • Version: <strong>{scheme.version}</strong>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex flex-col justify-between items-center text-center ${
            outcome.verdict === 'ELIGIBLE'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : outcome.verdict === 'NEEDS_MORE_INFO'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
          }`}>
            <span className="text-[10px] font-mono uppercase text-dark-muted print:text-gray-600">Decision Verdict</span>
            <div className="text-xl font-extrabold uppercase my-1">
              {outcome.verdict}
            </div>
            <span className="text-xs font-mono">
              Readiness: {outcome.readiness_score}%
            </span>
          </div>
        </div>

        {/* Clause Findings Table */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-dark-muted print:text-black">
            Ontological Subgraph Evaluation Findings
          </h4>
          <div className="border border-white/10 rounded-xl overflow-hidden print:border-gray-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/5 border-b border-white/10 text-dark-muted font-mono print:bg-gray-100 print:text-black print:border-gray-300">
                <tr>
                  <th className="p-2.5">Clause / Criterion</th>
                  <th className="p-2.5">Condition Rule</th>
                  <th className="p-2.5">Declared Value</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                {outcome.clause_details.map((c, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-medium text-white print:text-black">{c.field_display}</td>
                    <td className="p-2.5 font-mono text-dark-muted print:text-gray-700">{c.expected_value}</td>
                    <td className="p-2.5 font-mono text-white print:text-black">{c.citizen_value || 'Not Disclosed'}</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      <span className={
                        c.status === 'PASSED' ? 'text-emerald-400' :
                        c.status === 'UNKNOWN' ? 'text-amber-400' : 'text-rose-400'
                      }>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer & Official Verification Seal */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs mb-6 print:border-gray-300">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 print:text-black">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Statutory Demonstration Advisory
            </div>
            <p className="text-[11px] text-dark-muted print:text-gray-600 max-w-lg">
              This record is computed by the Cloud-Native Semantic Eligibility Reasoning Framework from publicly notified guidelines.
              It does not constitute a legally binding administrative order. Verify on official portal:
              {' '}<strong className="text-white print:text-black">{scheme.source_url}</strong>.
            </p>
          </div>
          <div className="text-center shrink-0 font-mono text-[10px] text-dark-muted border border-white/15 p-2 rounded-xl print:border-gray-400">
            <QrCode className="w-8 h-8 mx-auto text-white print:text-black mb-1" />
            <span>VERIFIED ON AURADB</span>
          </div>
        </div>

        {/* Footer Actions (Hidden on Print) */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 print:hidden">
          <button
            onClick={onClose}
            className="text-xs text-dark-muted hover:text-white transition"
          >
            Close Certificate
          </button>
          <div className="flex items-center gap-3">
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1"
            >
              Verify on Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => window.print()}
              className="bg-white text-dark-bg hover:bg-white/90 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
