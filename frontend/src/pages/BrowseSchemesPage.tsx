import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, ArrowRight, CheckSquare, Square, X, ExternalLink, Sparkles, ChevronLeft, ChevronRight, ShieldAlert, Award, Eye } from 'lucide-react';
import { GlowCard } from '../components/GlowCard';
import { Badge } from '../components/Badge';
import { SchemeQuickViewModal } from '../components/SchemeQuickViewModal';
import { MOCK_SCHEMES } from '../api/mockData';
import { Scheme } from '../types';

export const BrowseSchemesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('lang') || 'ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'benefit' | 'category'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [quickViewScheme, setQuickViewScheme] = useState<Scheme | null>(null);
  const itemsPerPage = 6;

  const categories = ['ALL', 'Education', 'Agriculture', 'Health', 'Housing', 'Pension', 'Women & Child', 'Livelihood'];
  const languages = ['ALL', 'English', 'Hindi', 'Tamil', 'Telugu'];

  const filteredSchemes = MOCK_SCHEMES.filter((scheme) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      scheme.title.toLowerCase().includes(q) ||
      (scheme.short_name && scheme.short_name.toLowerCase().includes(q)) ||
      scheme.summary.toLowerCase().includes(q) ||
      (scheme.key_benefit && scheme.key_benefit.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'ALL' || scheme.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'ALL' || scheme.language.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesSearch && matchesCategory && matchesLanguage;
  }).sort((a, b) => {
    if (sortBy === 'name') return (a.short_name || a.title).localeCompare(b.short_name || b.title);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    if (sortBy === 'benefit') return (b.key_benefit || '').localeCompare(a.key_benefit || '');
    return 0;
  });

  const totalPages = Math.ceil(filteredSchemes.length / itemsPerPage);
  const displayedSchemes = filteredSchemes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleCompare = (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.includes(schemeId)) {
      setCompareList(compareList.filter((id) => id !== schemeId));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 schemes simultaneously.');
        return;
      }
      setCompareList([...compareList, schemeId]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedLanguage('ALL');
    setSortBy('featured');
    setCurrentPage(1);
  };

  const getLanguageBadgeClass = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'hindi':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'tamil':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'telugu':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Official Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center justify-between gap-4 text-xs text-amber-200">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Public Demonstration System:</strong> Built strictly from verified public government notifications and gazette guidelines.
            Not an official eligibility decision. Always verify your claim on the designated government portal.
          </span>
        </div>
        <span className="font-mono text-[11px] text-amber-400 shrink-0 bg-amber-500/20 px-2 py-1 rounded-md">
          {MOCK_SCHEMES.length} Ingested Schemes
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Government Welfare Schemes Catalogue</h1>
          <p className="text-xs text-dark-muted">
            Explore 13+ official central and state welfare programs across 7 categories and 4 languages (English, Hindi, Tamil, Telugu).
          </p>
        </div>

        {compareList.length > 0 && (
          <div className="flex items-center gap-3 bg-brand-cyan/10 border border-brand-cyan/30 px-4 py-2 rounded-2xl">
            <span className="text-xs text-brand-cyan font-semibold">{compareList.length} Selected for Compare</span>
            <button
              onClick={() => navigate(`/compare?schemes=${compareList.join(',')}`)}
              className="bg-brand-gradient text-dark-bg font-bold text-xs px-3 py-1.5 rounded-xl shadow-md"
            >
              Compare Now
            </button>
            <button onClick={() => setCompareList([])} className="text-dark-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-card p-5 rounded-3xl space-y-4 border border-white/10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-dark-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by scheme name, benefit, or keywords..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-dark-muted focus:outline-none focus:border-brand-cyan/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3 text-dark-muted hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Language Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            <span className="text-[11px] font-semibold text-dark-muted uppercase mr-1">Language:</span>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => { setSelectedLanguage(lang); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  selectedLanguage === lang
                    ? 'bg-brand-cyan text-dark-bg font-bold shadow-md'
                    : 'bg-white/5 text-dark-muted hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Sort & View Mode */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-full px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="name">Sort: Scheme Name</option>
              <option value="category">Sort: Category</option>
              <option value="benefit">Sort: Concrete Benefit</option>
            </select>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-dark-muted'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-dark-muted'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-[11px] font-semibold text-dark-muted uppercase mr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-brand-indigo text-white font-bold shadow-sm border border-brand-indigo/50'
                  : 'bg-white/5 text-dark-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Scheme Cards Section */}
      {displayedSchemes.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedSchemes.map((scheme) => {
              const isCompared = compareList.includes(scheme.id);
              const displayName = scheme.short_name || scheme.title;
              return (
                <GlowCard key={scheme.id} onClick={() => navigate(`/schemes/${scheme.id}`)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge value={scheme.category} />
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border font-semibold ${getLanguageBadgeClass(scheme.language)}`}>
                        {scheme.language}
                      </span>
                    </div>
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

                  {/* Card Title with Short Name & Tooltip */}
                  <div className="mb-2 group relative">
                    <h3
                      className="text-base font-bold text-white line-clamp-2 leading-snug cursor-pointer group-hover:text-brand-cyan transition"
                      title={scheme.title}
                    >
                      {displayName}
                    </h3>
                    <p className="text-[11px] text-dark-muted/80 line-clamp-1 mt-0.5 font-mono">
                      {scheme.title}
                    </p>
                  </div>

                  {/* Concrete Key Benefit Badge */}
                  {scheme.key_benefit && (
                    <div className="my-3 px-3 py-1.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                      <span className="text-[11px] font-semibold text-brand-cyan line-clamp-1">
                        {scheme.key_benefit}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-dark-muted mb-4 line-clamp-2 leading-relaxed">
                    {scheme.summary}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-white/10 text-xs text-dark-muted">
                    <div className="flex justify-between">
                      <span>Conditions Modeled:</span>
                      <span className="text-white font-mono">{scheme.conditions.length} Rules</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verified On:</span>
                      <span className="text-white font-mono text-[11px]">{scheme.verified_on || 'Public Portal'}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/check/${scheme.id}`); }}
                      className="flex-1 bg-brand-gradient text-dark-bg font-bold text-xs py-2 rounded-xl text-center shadow-md hover:opacity-90 transition"
                    >
                      Check Eligibility
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuickViewScheme(scheme); }}
                      className="px-2.5 py-2 bg-brand-cyan/10 border border-brand-cyan/20 hover:bg-brand-cyan/20 text-brand-cyan rounded-xl text-xs font-medium transition flex items-center gap-1"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/schemes/${scheme.id}`); }}
                      className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-medium transition"
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
            {displayedSchemes.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => navigate(`/schemes/${scheme.id}`)}
                className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-brand-cyan/40 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge value={scheme.category} />
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono border font-semibold ${getLanguageBadgeClass(scheme.language)}`}>
                      {scheme.language}
                    </span>
                    <span className="text-xs font-bold text-brand-cyan">
                      {scheme.key_benefit}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white hover:text-brand-cyan transition" title={scheme.title}>
                    {scheme.short_name || scheme.title}
                  </h3>
                  <p className="text-xs text-dark-muted line-clamp-1">{scheme.summary}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/check/${scheme.id}`); }}
                    className="bg-brand-gradient text-dark-bg font-bold text-xs px-3.5 py-2 rounded-xl text-center shadow-md"
                  >
                    Check
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setQuickViewScheme(scheme); }}
                    className="p-2 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/20 rounded-xl text-xs transition"
                    title="Quick Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/schemes/${scheme.id}`); }}
                    className="px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4 border border-white/10">
          <Award className="w-12 h-12 text-dark-muted mx-auto opacity-40" />
          <h3 className="text-lg font-bold text-white">No Schemes Found</h3>
          <p className="text-xs text-dark-muted max-w-md mx-auto">
            No welfare schemes matched your active filter criteria ({selectedCategory} category, {selectedLanguage} language).
          </p>
          <button
            onClick={resetFilters}
            className="bg-brand-cyan text-dark-bg font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
          >
            Browse All {MOCK_SCHEMES.length} Schemes
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 glass-card rounded-2xl border border-white/10 text-xs">
          <span className="text-dark-muted font-mono">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSchemes.length)} of {filteredSchemes.length} schemes
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-white px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <SchemeQuickViewModal
        scheme={quickViewScheme}
        onClose={() => setQuickViewScheme(null)}
      />
    </div>
  );
};
