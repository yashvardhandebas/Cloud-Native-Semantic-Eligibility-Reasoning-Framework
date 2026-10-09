import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Layers, CheckCircle, GitCompare, ArrowRight } from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filteredSchemes = MOCK_SCHEMES.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.summary.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in">
      <div className="glass-card w-full max-w-2xl bg-dark-bg/90 border border-white/15 p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-3 px-2">
          <Search className="w-5 h-5 text-brand-cyan" />
          <input
            type="text"
            placeholder="Type a scheme name, category (e.g., Education, Agriculture), or command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-dark-muted focus:outline-none"
            autoFocus
          />
          <button onClick={() => setIsOpen(false)} className="text-dark-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
          <div className="text-[11px] font-semibold text-dark-muted uppercase px-3 py-1">Quick Navigation</div>
          <button
            onClick={() => { navigate('/schemes'); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center justify-between group"
          >
            <span className="flex items-center gap-2"><Search className="w-4 h-4 text-brand-cyan" /> Browse All Welfare Schemes</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={() => { navigate('/check'); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 flex items-center justify-between group"
          >
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-emerald" /> Check Citizen Eligibility Wizard</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="text-[11px] font-semibold text-dark-muted uppercase px-3 py-1 mt-3">Matching Schemes ({filteredSchemes.length})</div>
          {filteredSchemes.map((s) => (
            <button
              key={s.id}
              onClick={() => { navigate(`/schemes/${s.id}`); setIsOpen(false); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs hover:bg-white/10 flex items-center justify-between group transition"
            >
              <div>
                <div className="font-semibold text-white group-hover:text-brand-cyan">{s.title}</div>
                <div className="text-[11px] text-dark-muted">{s.category} • {s.state}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-dark-muted group-hover:text-white" />
            </button>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-dark-muted flex justify-between px-2">
          <span>Press <kbd className="bg-white/10 px-1 rounded">ESC</kbd> to close</span>
          <span>SchemeSense Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};
