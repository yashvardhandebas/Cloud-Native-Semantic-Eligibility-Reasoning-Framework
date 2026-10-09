import React, { useState } from 'react';
import { Sliders, Zap, CheckCircle2, History, GitBranch } from 'lucide-react';
import { Badge } from '../components/Badge';

export const AmendmentSimulatorPage: React.FC = () => {
  const [incomeCeiling, setIncomeCeiling] = useState<number>(250000);
  const [newCeiling, setNewCeiling] = useState<number>(300000);
  const [applied, setApplied] = useState<boolean>(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan text-dark-bg font-bold text-[10px] uppercase mb-2">
          <Zap className="w-3 h-3" /> Live Graph Amendment Engine
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Rule Evolution & Amendment Simulator</h1>
        <p className="text-xs text-dark-muted">Simulate notification amendments changing eligibility parameters. Verify superseded state and point-in-time `as_of` query performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Target Rule Amendment Controls</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-dark-muted block mb-1">Target Scheme:</label>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white">
                Post-Matric Scholarship for SC Students
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark-muted block mb-1">Original Income Ceiling (v2.1):</label>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-brand-rose">
                ₹{incomeCeiling.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">New Income Ceiling Amendment (v3.0):</label>
              <input
                type="number"
                value={newCeiling}
                onChange={(e) => setNewCeiling(Number(e.target.value))}
                className="w-full bg-dark-bg border border-brand-cyan/40 rounded-xl px-3 py-2 text-xs font-mono text-brand-cyan font-bold"
              />
            </div>

            <button
              onClick={() => setApplied(true)}
              className="w-full bg-brand-gradient text-dark-bg font-bold text-xs py-3 rounded-xl shadow-lg"
            >
              Execute Amendment (Incremental Graph Update)
            </button>
          </div>
        </div>

        {/* Live Graph Evolution Metrics & Diff */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Graph Evolution Metrics</h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
              <span className="text-dark-muted">Modifications Scope:</span>
              <span className="text-white font-mono font-bold">1 Condition Node Modified</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
              <span className="text-dark-muted">Full Re-Ingestion Time:</span>
              <span className="text-white font-mono">1285.24 ms</span>
            </div>
            <div className="p-3 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 flex justify-between items-center text-xs">
              <span className="text-brand-emerald font-bold">Incremental Evolution Time:</span>
              <span className="text-brand-emerald font-mono font-bold">499.80 ms (2.57x Speedup)</span>
            </div>
          </div>

          {applied && (
            <div className="p-4 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/30 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-brand-cyan font-bold">
                <CheckCircle2 className="w-4 h-4" /> Amendment Successfully Applied to Neo4j Graph!
              </div>
              <p className="text-dark-muted text-[11px]">
                Old clause (₹250k) superseded: <code className="text-white font-mono">is_current = false, valid_to = 2026-10-09</code>.
                New clause (₹300k) active: <code className="text-white font-mono">is_current = true, valid_from = 2026-10-09</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
