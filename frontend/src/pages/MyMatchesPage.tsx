import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ArrowRight, Download } from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { GlowCard } from '../components/GlowCard';
import { Badge } from '../components/Badge';

export const MyMatchesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Scheme Matches & Rankings</h1>
          <p className="text-xs text-dark-muted">Evaluated profile ranked across all ingested government welfare schemes</p>
        </div>

        <button
          onClick={() => {
            const csvData = MOCK_SCHEMES.map((s) => `${s.id},${s.title},${s.category},100%`).join('\n');
            const blob = new Blob([`Scheme ID,Title,Category,Readiness\n${csvData}`], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my_scheme_matches.csv';
            a.click();
          }}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_SCHEMES.map((scheme, idx) => (
          <div
            key={scheme.id}
            onClick={() => navigate(`/check/${scheme.id}`)}
            className="glass-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:border-brand-cyan/40 transition"
          >
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-bold font-mono flex items-center justify-center text-xs shrink-0 mt-1">
                #{idx + 1}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge value={scheme.category} />
                  <h3 className="text-base font-bold text-white">{scheme.title}</h3>
                </div>
                <p className="text-xs text-dark-muted line-clamp-1">{scheme.summary}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <span className="text-xs text-dark-muted block">Readiness Score</span>
                <span className="text-lg font-bold text-brand-emerald font-mono">
                  {idx === 0 ? '100%' : idx === 1 ? '83.3%' : '90.7%'}
                </span>
              </div>
              <Badge
                type="verdict"
                value={idx === 0 ? 'ELIGIBLE' : idx === 1 ? 'NEEDS_MORE_INFO' : 'INELIGIBLE'}
              />
              <ArrowRight className="w-4 h-4 text-dark-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
