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
            AI-POWERED SEMANTIC ELIGIBILITY
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
          Know the schemes you <br />
          <span className="text-gradient">actually qualify</span> for.
        </h1>

        <p className="text-dark-muted text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          Transparent, explainable welfare eligibility reasoning powered by Graph RAG & Multilingual AI.
        </p>

        {/* Clean Search Input */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="glass-card p-2 rounded-full flex items-center shadow-xl border border-white/10">
            <Search className="w-4 h-4 text-dark-muted ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Search by scheme name, caste (SC/ST), or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-4 py-2.5 text-xs text-white placeholder-dark-muted focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-dark-bg hover:bg-white/90 font-semibold px-6 py-2.5 rounded-full text-xs transition shadow-md shrink-0"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Trust Stats Bar */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-card p-8 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-white/5">
          <div>
            <div className="text-3xl font-bold text-white font-mono">100%</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">Verdict Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-cyan font-mono">2.57x</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">Live AuraDB Speedup</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-brand-emerald font-mono">4 Languages</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">EN • HI • TA • TE</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white font-mono">35 / 35</div>
            <div className="text-[11px] text-dark-muted mt-1 uppercase tracking-wider font-medium">Verified Unit Tests</div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Welfare Schemes</h2>
            <p className="text-xs text-dark-muted mt-1">Parsed into structured condition graphs</p>
          </div>
          <Link to="/schemes" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_SCHEMES.map((scheme) => (
            <GlowCard key={scheme.id} onClick={() => navigate(`/schemes/${scheme.id}`)}>
              <div className="flex items-center justify-between mb-4">
                <Badge value={scheme.category} />
                <span className="text-[10px] font-mono text-dark-muted">{scheme.language}</span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{scheme.title}</h3>
              <p className="text-xs text-dark-muted mb-6 line-clamp-2 leading-relaxed">{scheme.summary}</p>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-dark-muted">Key Benefit:</span>
                <span className="text-brand-emerald font-bold">
                  {scheme.benefits[0]?.amount ? `${scheme.benefits[0].amount}` : 'Full Assistance'}
                </span>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* Clean 4-Layer Architecture Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Four-Layer Framework Pipeline</h2>
          <p className="text-xs text-dark-muted">Decoupled microservices architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 1</div>
            <h4 className="text-sm font-bold text-white mb-1">OCR & Ingestion</h4>
            <p className="text-xs text-dark-muted leading-relaxed">Tesseract OCR and regex noise cleaner for scanned PDFs.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 2</div>
            <h4 className="text-sm font-bold text-white mb-1">Semantic Extraction</h4>
            <p className="text-xs text-dark-muted leading-relaxed">SentenceTransformers mapping clauses to canonical ontology fields.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 3</div>
            <h4 className="text-sm font-bold text-white mb-1">Reasoning Engine</h4>
            <p className="text-xs text-dark-muted leading-relaxed">Live Neo4j AuraDB graph with Cypher versioned historical queries.</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <div className="text-[10px] font-mono text-brand-cyan font-bold mb-2">LAYER 4</div>
            <h4 className="text-sm font-bold text-white mb-1">Delivery API</h4>
            <p className="text-xs text-dark-muted leading-relaxed">0–100 Readiness Scorer and actionable evidence completion steps.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
