import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GitCompare, ArrowLeft, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { Badge } from '../components/Badge';

export const CompareSchemesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'ayushman-bharat-pmjay',
    'pm-ujjwala-yojana',
    'pm-awas-yojana-gramin'
  ]);

  const presets = [
    {
      label: 'Health & Basic Needs (Pilot)',
      ids: ['ayushman-bharat-pmjay', 'pm-ujjwala-yojana', 'pm-awas-yojana-gramin']
    },
    {
      label: 'Multilingual State Programs (HI • TA • TE)',
      ids: ['pm-ujjwala-yojana', 'pudhumai-penn-scheme', 'ap-cheyutha-thalliki-vandanam']
    },
    {
      label: 'Education & Student Support',
      ids: ['post-matric-sc-scholarship', 'nmmss-scholarship', 'pudhumai-penn-scheme']
    },
    {
      label: 'Social Security & Pensions',
      ids: ['pm-kisan', 'atal-pension-yojana', 'ignoaps-old-age-pension']
    },
    {
      label: 'Livelihood & Family Welfare',
      ids: ['pm-vishwakarma-scheme', 'sukanya-samriddhi-yojana', 'ayushman-bharat-pmjay']
    }
  ];

  const handleSchemeSelect = (index: number, newId: string) => {
    const updated = [...selectedIds];
    updated[index] = newId;
    setSelectedIds(updated);
  };

  const schemesToCompare = selectedIds
    .map((id) => MOCK_SCHEMES.find((s) => s.id === id))
    .filter(Boolean) as typeof MOCK_SCHEMES;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Official Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            {t('check.officialAdvisory')}
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate('/schemes')}
        className="flex items-center gap-2 text-xs text-dark-muted hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> {t('check.backToSchemes')}
      </button>

      {/* Header & Preset Switcher */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{t('compare.title')}</h1>
            <p className="text-xs text-dark-muted">
              {t('compare.subtitle')}
            </p>
          </div>
          <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1.5 rounded-full shrink-0">
            {schemesToCompare.length} / {MOCK_SCHEMES.length}
          </span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] text-dark-muted font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" /> {t('compare.quickPresets')}
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setSelectedIds(preset.ids)}
              className="text-xs px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-dark-muted hover:text-white hover:border-brand-cyan/40 hover:bg-white/10 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((slotIdx) => (
          <div key={slotIdx} className="glass-card p-4 rounded-2xl border border-white/10 space-y-1.5">
            <label className="text-[11px] font-mono text-dark-muted uppercase tracking-wider block">
              {t('compare.slot')} {slotIdx + 1}
            </label>
            <select
              value={selectedIds[slotIdx] || ''}
              onChange={(e) => handleSchemeSelect(slotIdx, e.target.value)}
              className="w-full bg-dark-bg border border-white/15 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan transition"
            >
              {MOCK_SCHEMES.map((scheme) => (
                <option key={scheme.id} value={scheme.id}>
                  [{scheme.language.toUpperCase()}] {scheme.short_name || scheme.title}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {schemesToCompare.map((scheme) => (
          <div key={scheme.id} className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge value={scheme.category} />
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  scheme.language === 'Hindi'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : scheme.language === 'Tamil'
                    ? 'bg-orange-500/10 text-orange-300 border-orange-500/30'
                    : scheme.language === 'Telugu'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30'
                }`}>
                  {scheme.language}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1 line-clamp-2" title={scheme.title}>
                  {scheme.short_name || scheme.title}
                </h3>
                <p className="text-xs text-dark-muted line-clamp-2">{scheme.summary}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                {/* Concrete Key Benefit */}
                <div>
                  <span className="text-[11px] text-dark-muted font-semibold uppercase block mb-1">Key Benefit</span>
                  <span className="text-xs font-bold text-brand-emerald">
                    {scheme.key_benefit || (scheme.benefits[0]?.amount ? `${scheme.benefits[0].amount} (${scheme.benefits[0].frequency})` : 'Full Assistance')}
                  </span>
                </div>

                {/* Conditions */}
                <div>
                  <span className="text-[11px] text-dark-muted font-semibold uppercase block mb-1">
                    Key Conditions ({scheme.conditions.length})
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {scheme.conditions.map((c) => (
                      <div key={c.id} className="text-[11px] font-mono text-white bg-dark-bg/60 p-2 rounded-lg border border-white/5 space-y-0.5">
                        <div className="text-brand-cyan font-bold">{c.field_display}</div>
                        <div className="text-dark-muted">{c.operator.toUpperCase()} {String(c.value)} {c.unit || ''}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Proofs */}
                <div>
                  <span className="text-[11px] text-dark-muted font-semibold uppercase block mb-1">
                    Required Documents ({scheme.documents.length})
                  </span>
                  <div className="space-y-1">
                    {scheme.documents.map((d) => (
                      <div key={d.id} className="text-[11px] text-dark-muted flex items-start gap-1">
                        <span className="text-white/40">•</span>
                        <span>{d.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exclusions */}
                <div>
                  <span className="text-[11px] text-dark-muted font-semibold uppercase block mb-1">
                    Disqualifications ({scheme.exclusions.length})
                  </span>
                  <div className="space-y-1">
                    {scheme.exclusions.map((e) => (
                      <div key={e.id} className="text-[11px] text-rose-300/80 bg-rose-500/5 p-1.5 rounded border border-rose-500/20">
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <button
                onClick={() => navigate(`/check/${scheme.id}`)}
                className="w-full bg-brand-gradient text-dark-bg font-bold text-xs py-2.5 rounded-xl hover:opacity-95 transition shadow-md"
              >
                {t('compare.evaluateThis')}
              </button>
              {scheme.source_url && (
                <a
                  href={scheme.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1 text-[11px] text-dark-muted hover:text-brand-cyan transition py-1"
                >
                  {t('check.officialPortal')} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
