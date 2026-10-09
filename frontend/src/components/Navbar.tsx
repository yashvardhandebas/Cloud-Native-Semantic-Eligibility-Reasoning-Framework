import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Menu, 
  X, 
  Globe, 
  Search, 
  Layers, 
  GitCompare, 
  CheckCircle, 
  BarChart3, 
  FilePlus, 
  Sliders,
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navLinks = [
    { path: '/schemes', label: t('nav.browse'), icon: Search },
    { path: '/lab', label: t('nav.ruleLab'), icon: Layers },
    { path: '/compare', label: t('nav.compare'), icon: GitCompare },
    { path: '/matches', label: t('nav.matches'), icon: CheckCircle },
    { path: '/amend', label: 'Amendment Simulator', icon: Sliders },
    { path: '/evaluation', label: t('nav.evaluation'), icon: BarChart3 },
    { path: '/status', label: 'Status', icon: ShieldCheck },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
      <div className="glass-pill rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-dark-bg font-bold shadow-lg shadow-brand-cyan/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-dark-bg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-gradient">
              SchemeSense
            </span>
            <span className="text-[10px] text-dark-brand-cyan/80 font-mono tracking-wider uppercase">
              BITE412L • Cloud AI
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? 'bg-white/10 text-brand-cyan border border-white/10 shadow-sm'
                    : 'text-dark-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-dark-muted mr-1" />
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
            >
              <option value="en" className="bg-dark-bg">EN</option>
              <option value="hi" className="bg-dark-bg">हिन्दी</option>
              <option value="ta" className="bg-dark-bg">தமிழ்</option>
              <option value="te" className="bg-dark-bg">తెలుగు</option>
            </select>
          </div>

          {/* Primary CTA Button */}
          <Link
            to="/check"
            className="hidden sm:inline-flex items-center gap-2 bg-brand-gradient text-dark-bg font-semibold text-xs px-4 py-2 rounded-full shadow-lg shadow-brand-magenta/20 hover:opacity-95 transition-opacity"
          >
            {t('nav.checkEligibility')}
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-dark-muted hover:text-white hover:bg-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 glass-card p-4 rounded-2xl border border-white/10 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 ${
                  isActive(link.path)
                    ? 'bg-white/10 text-brand-cyan border border-white/10'
                    : 'text-dark-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/check"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 text-center bg-brand-gradient text-dark-bg font-semibold text-sm py-2.5 rounded-xl"
          >
            {t('nav.checkEligibility')}
          </Link>
        </div>
      )}
    </nav>
  );
};
