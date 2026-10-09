import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Menu, X, Globe, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navLinks = [
    { path: '/schemes', label: 'Schemes' },
    { path: '/check', label: 'Check Eligibility' },
    { path: '/lab', label: 'Rule Lab' },
    { path: '/compare', label: 'Compare' },
    { path: '/evaluation', label: 'Benchmarks' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-6 z-50 max-w-6xl mx-auto px-4">
      <div className="glass-pill rounded-full px-6 py-3.5 flex items-center justify-between shadow-2xl">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-dark-bg font-bold shadow-md shadow-brand-cyan/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-dark-bg" />
          </div>
          <span className="font-bold text-base tracking-tight text-white group-hover:text-brand-cyan transition">
            SchemeSense
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                isActive(link.path)
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-dark-muted hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <Globe className="w-3.5 h-3.5 text-dark-muted" />
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
            >
              <option value="en" className="bg-dark-bg">EN</option>
              <option value="hi" className="bg-dark-bg">हिन्दी</option>
              <option value="ta" className="bg-dark-bg">தமிழ்</option>
              <option value="te" className="bg-dark-bg">తెలుగు</option>
            </select>
          </div>

          <Link
            to="/check"
            className="hidden sm:inline-flex items-center gap-1.5 bg-white text-dark-bg font-semibold text-xs px-4 py-2 rounded-full hover:bg-white/90 transition shadow-md"
          >
            Check Now <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-dark-muted hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 glass-card p-5 rounded-3xl border border-white/10 flex flex-col gap-2 animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-2xl text-xs font-medium ${
                isActive(link.path) ? 'bg-white/10 text-white font-semibold' : 'text-dark-muted hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
