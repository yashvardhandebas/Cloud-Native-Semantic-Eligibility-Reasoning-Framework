import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, ArrowLeft } from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { Badge } from '../components/Badge';

export const CompareSchemesPage: React.FC = () => {
  const navigate = useNavigate();
  const schemesToCompare = MOCK_SCHEMES.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <button
        onClick={() => navigate('/schemes')}
        className="flex items-center gap-2 text-xs text-dark-muted hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Schemes
      </button>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Side-by-Side Scheme Comparison</h1>
        <p className="text-xs text-dark-muted">Compare benefits, conditions, required documents, and disqualifying exclusions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schemesToCompare.map((scheme) => (
          <div key={scheme.id} className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
            <div>
              <Badge value={scheme.category} className="mb-2" />
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{scheme.title}</h3>
              <p className="text-xs text-dark-muted line-clamp-2">{scheme.summary}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <span className="text-[11px] text-dark-muted font-semibold uppercase block mb-1">Key Benefit</span>
                <span className="text-xs font-bold text-brand-emerald">
                  {scheme.benefits[0]?.amount ? `${scheme.benefits[0].amount} (${scheme.benefits[0].frequency})` : 'Tuition Support'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-dark-muted font-semibold uppercase block mb-1">Key Conditions ({scheme.conditions.length})</span>
                <div className="space-y-1">
                  {scheme.conditions.map((c) => (
                    <div key={c.id} className="text-[11px] font-mono text-white bg-dark-bg/60 p-1.5 rounded border border-white/5">
                      {c.field_display}: {String(c.value)}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-dark-muted font-semibold uppercase block mb-1">Required Proofs ({scheme.documents.length})</span>
                <div className="space-y-1">
                  {scheme.documents.map((d) => (
                    <div key={d.id} className="text-[11px] text-dark-muted">
                      • {d.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/check/${scheme.id}`)}
              className="w-full bg-brand-gradient text-dark-bg font-bold text-xs py-2.5 rounded-xl"
            >
              Evaluate This Scheme
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
