import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { GlowCard } from '../components/GlowCard';
import { Badge } from '../components/Badge';
import { MOCK_SCHEMES } from '../api/mockData';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="pt-20 pb-12 text-center max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
          <span className="text-xs font-mono font-medium text-dark-muted tracking-wider uppercase">
            {t('hero.eyebrow')}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
          {t('hero.titlePart1')} <br />
          <span className="text-gradient">{t('hero.titleGradient')}</span> {t('hero.titlePart2')}
        </h1>

        <p className="text-dark-muted text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* Clean Search Input */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="glass-card p-2 rounded-full flex items-center shadow-xl border border-white/10">
            <Search className="w-4 h-4 text-dark-muted ml-4 shrink-0" />
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-4 py-2.5 text-xs text-white placeholder-dark-muted focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-dark-bg hover:bg-white/90 font-semibold px-6 py-2.5 rounded-full text-xs transition shadow-md shrink-0"
            >
              {t('hero.searchBtn')}
            </button>
          </div>
        </form>
      </section>

      {/* Trust Stats Bar */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-card p-8 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-white/5">
          <div>
            <div className="text-3xl font-bold text-white font-mono">100%</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">{t('stats.verdictAccuracy')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-cyan font-mono">2.57x</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">{t('stats.speedup')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-emerald font-mono">4 Languages</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">{t('stats.languages')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-mono">41 / 41</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">{t('stats.verifiedTests')}</div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('featured.title')}</h2>
            <p className="text-xs text-dark-muted mt-1">{t('featured.subtitle')}</p>
          </div>
          <Link to="/schemes" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1">
            {t('featured.browseAll')} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_SCHEMES.filter((s) => [
            'ayushman-bharat-pmjay',
            'pm-ujjwala-yojana',
            'pm-awas-yojana-gramin',
            'pudhumai-penn-scheme',
            'ap-cheyutha-thalliki-vandanam',
            'pm-vishwakarma-scheme'
          ].includes(s.id)).map((scheme) => (
            <GlowCard key={scheme.id} onClick={() => navigate(`/schemes/${scheme.id}`)}>
              <div className="flex items-center justify-between mb-4">
                <Badge value={t(`categories.${scheme.category}`, scheme.category)} />
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

              <h3 className="text-base font-bold text-white mb-2 line-clamp-2 title-hover" title={scheme.title}>
                {scheme.short_name || scheme.title}
              </h3>
              <p className="text-xs text-dark-muted mb-6 line-clamp-2 leading-relaxed">{scheme.summary}</p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-dark-muted">{t('featured.keyBenefit')}</span>
                <span className="text-brand-emerald font-bold line-clamp-1 text-right max-w-[200px]" title={scheme.key_benefit}>
                  {scheme.key_benefit || scheme.benefits[0]?.amount || 'Full Assistance'}
                </span>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* Clean 4-Layer Architecture Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">{t('architecture.title')}</h2>
          <p className="text-xs text-dark-muted">{t('architecture.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 1</div>
            <h4 className="text-sm font-bold text-white mb-1">{t('architecture.l1Title')}</h4>
            <p className="text-xs text-dark-muted leading-relaxed">{t('architecture.l1Desc')}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 2</div>
            <h4 className="text-sm font-bold text-white mb-1">{t('architecture.l2Title')}</h4>
            <p className="text-xs text-dark-muted leading-relaxed">{t('architecture.l2Desc')}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 3</div>
            <h4 className="text-sm font-bold text-white mb-1">{t('architecture.l3Title')}</h4>
            <p className="text-xs text-dark-muted leading-relaxed">{t('architecture.l3Desc')}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 4</div>
            <h4 className="text-sm font-bold text-white mb-1">{t('architecture.l4Title')}</h4>
            <p className="text-xs text-dark-muted leading-relaxed">{t('architecture.l4Desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
