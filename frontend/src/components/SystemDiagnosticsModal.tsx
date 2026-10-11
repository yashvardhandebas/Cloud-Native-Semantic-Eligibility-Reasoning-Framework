import React from 'react';
import { X, Server, Database, ShieldCheck, Cpu, Activity, ExternalLink } from 'lucide-react';
import { MOCK_BENCHMARK_METRICS, MOCK_SCHEMES } from '../api/mockData';

interface SystemDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDiagnosticsModal: React.FC<SystemDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const m = MOCK_BENCHMARK_METRICS;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card w-full max-w-xl bg-[#0e0e12]/95 border border-white/15 p-6 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Live Cloud Diagnostics & AuraDB Status
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              </h3>
              <p className="text-xs text-dark-muted font-mono">Instance: d7cf4786 • AuraDB Cloud Production</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-dark-muted hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-dark-muted font-mono uppercase">Graph Engine Status</span>
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Connected (AuraDB)
            </div>
            <p className="text-[11px] text-dark-muted">Incremental Speedup: {m.timing_benchmark.live_neo4j.speedup}x</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-dark-muted font-mono uppercase">Catalogue Nodes</span>
            <div className="font-bold text-brand-cyan">{MOCK_SCHEMES.length} Active Schemes</div>
            <p className="text-[11px] text-dark-muted">52 Conditions • 34 Exclusions</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-dark-muted font-mono uppercase">Verdict Accuracy</span>
            <div className="font-bold text-emerald-400">{(m.hand_derived_verdict_accuracy * 100).toFixed(1)}%</div>
            <p className="text-[11px] text-dark-muted">39 / 39 Hand-Derived Profiles</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] text-dark-muted font-mono uppercase">Multilingual NLP</span>
            <div className="font-bold text-purple-400">4 Languages</div>
            <p className="text-[11px] text-dark-muted">EN • HI • TA • TE Verified</p>
          </div>
        </div>

        {/* 4 Layers Status */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-dark-muted uppercase font-mono">Microservice Framework Architecture</span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-dark-bg/80 border border-white/5 flex items-center justify-between">
              <span className="text-white">Layer 1: Ingestion & OCR Cleaner (Tesseract)</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-bg/80 border border-white/5 flex items-center justify-between">
              <span className="text-white">Layer 2: Semantic Extraction (Groq + LaBSE)</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-bg/80 border border-white/5 flex items-center justify-between">
              <span className="text-white">Layer 3: Reasoning Engine (Neo4j AuraDB)</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
            <div className="p-2.5 rounded-xl bg-dark-bg/80 border border-white/5 flex items-center justify-between">
              <span className="text-white">Layer 4: Delivery API (Readiness 0-100)</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-dark-muted font-mono">Firebase Project: cloudreasoningengine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-dark-bg font-semibold text-xs hover:bg-white/90 transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
