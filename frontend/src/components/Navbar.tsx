import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Menu, 
  X, 
  Globe, 
  Search, 
  CheckCircle, 
  Layers, 
  GitCompare, 
  History, 
  BarChart3, 
  ArrowRight,
  Database,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { SystemDiagnosticsModal } from './SystemDiagnosticsModal';
import { MOCK_SCHEMES } from '../api/mockData';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').substring(0, 2);

  const navLinks = [
    { path: '/schemes', label: t('nav.schemes'), badge: `${MOCK_SCHEMES.length}` },
    { path: '/check', label: t('nav.checkEligibility') },
    { path: '/matches', label: t('nav.matches'), isAi: true },
    { path: '/compare', label: t('nav.compare') },
    { path: '/amend', label: t('nav.amendmentSim') },
    { path: '/evaluation', label: t('nav.benchmarks') },
  ];

  const isActive = (path: string) => {
    if (path === '/schemes' && location.pathname.startsWith('/schemes')) return true;
    if (path === '/check' && location.pathname.startsWith('/check')) return true;
    return location.pathname === path;
  };

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        {/* Subtle accent line on very top edge */}
        <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-emerald-500 opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Identity & Live Status */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-magenta p-[1px] shadow-sm group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0c0c10] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-brand-cyan transition leading-none">
                  {t('appName')}
                </span>
                <span className="text-[10px] text-dark-muted font-mono tracking-wider uppercase mt-0.5">
                  {t('nav.govCloud')}
                </span>
              </div>
            </Link>

            {/* Clickable Live AuraDB Cloud Pill */}
            <button
              onClick={() => setIsDiagnosticsOpen(true)}
              title="Click to view live AuraDB & system diagnostics"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('nav.auraLive')}</span>
            </button>
          </div>

          {/* Center: Desktop Navigation Bar */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-white/10 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/10 text-brand-cyan font-bold">
                      {link.badge}
                    </span>
                  )}
                  {link.isAi && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-gradient-to-r from-fuchsia-500/30 to-brand-cyan/30 text-white font-bold border border-white/10">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Language & CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick Spotlight Search Button */}
            <button
              onClick={handleOpenSearch}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white transition shadow-sm"
              title="Global search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline font-normal">{t('nav.searchPlaceholder')}</span>
              <kbd className="hidden sm:inline text-[10px] font-mono bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={currentLang}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium pr-1"
                aria-label="Select Language"
              >
                <option value="en" className="bg-[#0e0e12] text-white">English (EN)</option>
                <option value="hi" className="bg-[#0e0e12] text-white">हिन्दी (HI)</option>
                <option value="ta" className="bg-[#0e0e12] text-white">தமிழ் (TA)</option>
                <option value="te" className="bg-[#0e0e12] text-white">తెలుగు (TE)</option>
              </select>
            </div>

            {/* Quick Action CTA Button */}
            <Link
              to="/check"
              className="hidden md:inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-cyan to-brand-emerald text-[#070709] font-bold text-xs px-3.5 py-2 rounded-xl hover:opacity-95 transition shadow-sm shrink-0"
            >
              <span>{t('nav.checkNow')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0a0a0e]/95 backdrop-blur-2xl border-b border-white/10 p-5 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                onClick={() => { setIsDiagnosticsOpen(true); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-xs font-mono text-emerald-400"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Neo4j AuraDB: {t('nav.connected')}
              </button>
              <span className="text-[11px] font-mono text-dark-muted">{MOCK_SCHEMES.length} Schemes Active</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      active ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30' : 'text-zinc-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-brand-cyan">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10">
              <Link
                to="/check"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-gradient-to-r from-brand-cyan to-brand-emerald text-[#070709] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                {t('nav.startReasoning')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Diagnostics Modal */}
      <SystemDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </>
  );
};
