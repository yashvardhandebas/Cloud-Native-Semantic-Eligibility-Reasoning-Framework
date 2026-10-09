import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Sliders, 
  Cpu, 
  Zap, 
  Database,
  GraduationCap,
  Sprout,
  HeartPulse,
  Home,
  Users,
  Baby
} from 'lucide-react';
import { GlowCard } from '../components/GlowCard';
import { Badge } from '../components/Badge';
import { MOCK_SCHEMES } from '../api/mockData';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filterCategories = [
    { label: 'Education', icon: GraduationCap },
    { label: 'Agriculture', icon: Sprout },
    { label: 'Health', icon: HeartPulse },
    { label: 'Housing', icon: Home },
    { label: 'Pension', icon: Users },
    { label: 'Women & Child', icon: Baby },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/schemes?query=${encodeURIComponent(searchQuery)}${selectedCategory ? `&category=${selectedCategory}` : ''}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="pt-12 pb-8 text-center max-w-4xl mx-auto px-4 relative">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs font-mono font-semibold tracking-wider text-dark-brand-cyan uppercase">
            {t('hero.eyebrow')}
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          {t('hero.titlePart1')}
          <span className="text-gradient">{t('hero.titleGradient')}</span>
          {t('hero.titlePart2')}
        </h1>

        <p className="text-dark-muted text-base sm:text-lg max-w-2xl mx-auto mb-10">
          {t('subtitle')}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative mb-8">
          <div className="glass-card p-2 rounded-full flex items-center shadow-2xl border border-white/15">
            <Search className="w-5 h-5 text-dark-muted ml-4" />
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-4 py-2 text-sm text-white placeholder-dark-muted focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-dark-bg hover:bg-white/90 font-semibold px-6 py-2.5 rounded-full text-xs transition-all shadow-md"
            >
              {t('hero.searchBtn')}
            </button>
          </div>
        </form>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {filterCategories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(active ? null : cat.label)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border ${
                  active
                    ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40 shadow-sm'
                    : 'bg-white/5 text-dark-muted border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Trust Counters */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-card p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-white/10">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">100.0%</div>
            <div className="text-xs text-dark-muted mt-1 uppercase tracking-wider">Hand-Derived Accuracy</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-brand-cyan font-mono">2.57x</div>
            <div className="text-xs text-dark-muted mt-1 uppercase tracking-wider">Live AuraDB Speedup</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-brand-emerald font-mono">4 Languages</div>
            <div className="text-xs text-dark-muted mt-1 uppercase tracking-wider">EN • HI • TA • TE</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-brand-magenta font-mono">35 / 35</div>
            <div className="text-xs text-dark-muted mt-1 uppercase tracking-wider">Passed Unit Tests</div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Welfare Schemes</h2>
            <p className="text-xs text-dark-muted mt-1">Ingested and parsed into semantic rule graphs</p>
          </div>
          <Link to="/schemes" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1">
            Browse All Schemes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_SCHEMES.map((scheme) => (
            <GlowCard key={scheme.id} onClick={() => navigate(`/schemes/${scheme.id}`)}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                  <FileText className="w-5 h-5" />
                </div>
                <Badge value={scheme.category} />
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{scheme.title}</h3>
              <p className="text-xs text-dark-muted mb-6 line-clamp-2 leading-relaxed">{scheme.summary}</p>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-dark-muted font-medium">Key Benefit:</span>
                <span className="text-brand-emerald font-bold">
                  {scheme.benefits[0]?.amount ? `${scheme.benefits[0].amount} / ${scheme.benefits[0].frequency}` : 'Full Assistance'}
                </span>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* Four-Step Pipeline Section (Mapped to Layers 1-4) */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Four-Layer Semantic Architecture</h2>
          <p className="text-xs text-dark-muted">From raw scanning to explainable citizen decisions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 relative">
            <div className="text-xs font-mono text-brand-cyan mb-2 font-bold">LAYER 1</div>
            <h4 className="text-sm font-bold text-white mb-1">OCR & Ingestion</h4>
            <p className="text-xs text-dark-muted leading-relaxed">Tesseract OCR engine & regex noise cleaner for scanned PDFs across 4 languages.</p>
          </div>
          <div className="glass-card p-5 relative">
            <div className="text-xs font-mono text-brand-cyan mb-2 font-bold">LAYER 2</div>
            <h4 className="text-sm font-bold text-white mb-1">Semantic Extraction</h4>
            <p className="text-xs text-dark-muted leading-relaxed">SentenceTransformers (LaBSE/MiniLM) mapping clauses to standardized ontology fields.</p>
          </div>
          <div className="glass-card p-5 relative">
            <div className="text-xs font-mono text-brand-cyan mb-2 font-bold">LAYER 3</div>
            <h4 className="text-sm font-bold text-white mb-1">Graph Reasoning Engine</h4>
            <p className="text-xs text-dark-muted leading-relaxed">Neo4j AuraDB rule graphs with Cypher versioned point-in-time historical queries.</p>
          </div>
          <div className="glass-card p-5 relative">
            <div className="text-xs font-mono text-brand-cyan mb-2 font-bold">LAYER 4</div>
            <h4 className="text-sm font-bold text-white mb-1">Delivery & Readiness</h4>
            <p className="text-xs text-dark-muted leading-relaxed">0-100 Readiness Scorer, missing evidence completion, and actionable guidance.</p>
          </div>
        </div>
      </section>

      {/* Amendment Simulator Feature Callout Card */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-card p-8 rounded-3xl border border-brand-cyan/30 relative overflow-hidden bg-gradient-to-r from-brand-cyan/10 via-dark-bg to-brand-magenta/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan text-dark-bg font-bold text-[10px] uppercase">
                <Zap className="w-3 h-3" /> NEW FEATURE
              </div>
              <h3 className="text-2xl font-bold text-white">Rule Evolution & Amendment Simulator</h3>
              <p className="text-xs text-dark-muted leading-relaxed">
                Simulate government notifications changing eligibility rules (e.g. Income ceiling ₹2,50,000 → ₹3,00,000). See live graph diffs and point-in-time historical queries.
              </p>
            </div>
            <Link
              to="/amend"
              className="bg-white text-dark-bg font-bold text-xs px-6 py-3 rounded-full hover:bg-white/90 transition shadow-xl shrink-0"
            >
              Try Simulator Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
