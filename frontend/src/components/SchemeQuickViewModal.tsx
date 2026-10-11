import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Sparkles, FileCheck, Layers, AlertTriangle, ArrowRight, GitBranch } from 'lucide-react';
import { Scheme } from '../types';
import { Badge } from './Badge';

interface SchemeQuickViewModalProps {
  scheme: Scheme | null;
  onClose: () => void;
}

export const SchemeQuickViewModal: React.FC<SchemeQuickViewModalProps> = ({ scheme, onClose }) => {
  const navigate = useNavigate();
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="glass-card w-full max-w-2xl bg-[#0d0e12]/95 border border-white/15 p-6 rounded-3xl shadow-2xl relative my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2">
              <Badge value={scheme.category} />
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                {scheme.language}
              </span>
              <span className="text-[10px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20">
                {scheme.version}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{scheme.title}</h2>
            <p className="text-xs text-dark-muted font-medium">{scheme.state} • Verified: {scheme.verified_on}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-muted hover:text-white transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Concrete Benefit Callout */}
        {scheme.key_benefit && (
          <div className="p-3.5 rounded-2xl bg-brand-emerald/10 border border-brand-emerald/30 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-brand-emerald shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-brand-emerald block">Guaranteed Welfare Benefit:</span>
              <span className="text-white font-medium">{scheme.key_benefit}</span>
            </div>
          </div>
        )}

        {/* Summary */}
        <p className="text-xs text-dark-muted leading-relaxed">{scheme.summary}</p>

        {/* 2-Column: Conditions & Disqualifying Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Key Eligibility Conditions */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-cyan" />
              Eligibility Conditions ({scheme.conditions.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 font-mono text-[11px]">
              {scheme.conditions.map((c) => (
                <div key={c.id} className="p-2 rounded-lg bg-dark-bg/60 border border-white/5 space-y-0.5">
                  <div className="text-brand-cyan font-bold">{c.field_display}</div>
                  <div className="text-dark-muted">{c.operator.toUpperCase()} {String(c.value)} {c.unit || ''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="p-4 rounded-2xl bg-brand-rose/5 border border-brand-rose/20 space-y-2">
            <h4 className="font-bold text-brand-rose flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Exclusions ({scheme.exclusions.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-[11px]">
              {scheme.exclusions.map((e) => (
                <div key={e.id} className="p-2 rounded-lg bg-dark-bg/60 border border-brand-rose/15 text-rose-200">
                  <div className="font-bold">{e.title}</div>
                  <div className="text-dark-muted text-[10px] italic">"{e.original_clause}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-brand-emerald" />
            Required Documents ({scheme.documents.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {scheme.documents.map((d) => (
              <span key={d.id} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-zinc-300">
                {d.title}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
          {scheme.source_url ? (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Official Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/schemes/${scheme.id}`);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition"
            >
              Full Details & Graph
            </button>
            <button
              onClick={() => {
                onClose();
                navigate(`/check/${scheme.id}`);
              }}
              className="bg-brand-gradient text-dark-bg font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 hover:opacity-95 transition"
            >
              Evaluate Eligibility <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
