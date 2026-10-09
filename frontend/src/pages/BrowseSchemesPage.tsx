import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, ArrowRight, CheckSquare, Square, X } from 'lucide-react';
import { GlowCard } from '../components/GlowCard';
import { Badge } from '../components/Badge';
import { MOCK_SCHEMES } from '../api/mockData';
import { Scheme } from '../types';

export const BrowseSchemesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareList, setCompareList] = useState<string[]>([]);

  const categories = ['ALL', 'Education', 'Agriculture', 'Women & Child', 'Health', 'Housing', 'Pension'];

  const filteredSchemes = MOCK_SCHEMES.filter((scheme) => {
    const matchesSearch =
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCompare = (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.includes(schemeId)) {
      setCompareList(compareList.filter((id) => id !== schemeId));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 schemes at a time.');
        return;
      }
      setCompareList([...compareList, schemeId]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Browse Government Welfare Schemes</h1>
        <p className="text-xs text-dark-muted">Explore structured eligibility rules, required evidence documents, and benefits</p>
      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-dark-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter schemes by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-dark-muted focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-brand-cyan text-dark-bg font-bold shadow-md'
                  : 'bg-white/5 text-dark-muted hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-full ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-dark-muted'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-dark-muted'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => {
            const isCompared = compareList.includes(scheme.id);
            return (
              <GlowCard key={scheme.id} onClick={() => navigate(`/schemes/${scheme.id}`)}>
                <div className="flex items-center justify-between mb-3">
                  <Badge value={scheme.category} />
                  <button
                    onClick={(e) => toggleCompare(scheme.id, e)}
                    className="flex items-center gap-1.5 text-xs text-dark-muted hover:text-white transition"
                  >
                    {isCompared ? (
                      <CheckSquare className="w-4 h-4 text-brand-cyan" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    <span>Compare</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-1">{scheme.title}</h3>
                <p className="text-xs text-dark-muted mb-6 line-clamp-3 leading-relaxed">{scheme.summary}</p>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-muted">Source Language:</span>
                    <span className="text-white font-mono">{scheme.language}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-muted">Conditions Count:</span>
                    <span className="text-white font-mono">{scheme.conditions.length} Rules</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/check/${scheme.id}`); }}
                    className="flex-1 bg-brand-gradient text-dark-bg font-bold text-xs py-2 rounded-xl text-center"
                  >
                    Check Eligibility
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/schemes/${scheme.id}`); }}
                    className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-medium"
                  >
                    Details
                  </button>
                </div>
              </GlowCard>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => navigate(`/schemes/${scheme.id}`)}
              className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:border-brand-cyan/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge value={scheme.category} />
                  <h3 className="text-sm font-bold text-white">{scheme.title}</h3>
                </div>
                <p className="text-xs text-dark-muted line-clamp-1">{scheme.summary}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/check/${scheme.id}`); }}
                  className="bg-brand-gradient text-dark-bg font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Evaluate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Compare Tray */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 glass-pill px-6 py-3 rounded-full border border-brand-cyan/40 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-5">
          <span className="text-xs text-white font-medium">
            Comparing <strong className="text-brand-cyan">{compareList.length}</strong> scheme(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/compare?ids=${compareList.join(',')}`)}
              className="bg-brand-gradient text-dark-bg font-bold text-xs px-4 py-1.5 rounded-full"
            >
              Compare Now
            </button>
            <button
              onClick={() => setCompareList([])}
              className="text-xs text-dark-muted hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
