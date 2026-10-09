import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Database, ShieldCheck, Heart } from 'lucide-react';
import { isMockMode } from '../api/client';

export const Footer: React.FC = () => {
  const mockActive = isMockMode();

  return (
    <footer className="mt-20 border-t border-white/10 bg-dark-bg/80 backdrop-blur-md py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-gradient">SchemeSense</span>
          </div>
          <p className="text-xs text-dark-muted leading-relaxed">
            Cloud-Native Semantic Eligibility Reasoning Framework for Indian Government Welfare Schemes. Explainable clause decisions powered by Graph RAG & Multilingual AI.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-xs text-dark-muted">
            <li><Link to="/schemes" className="hover:text-white transition">Browse Schemes</Link></li>
            <li><Link to="/check" className="hover:text-white transition">Check Eligibility</Link></li>
            <li><Link to="/compare" className="hover:text-white transition">Compare Schemes</Link></li>
            <li><Link to="/matches" className="hover:text-white transition">My Scheme Matches</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Research & Tools</h4>
          <ul className="space-y-2 text-xs text-dark-muted">
            <li><Link to="/lab" className="hover:text-white transition">Rule Extraction Lab</Link></li>
            <li><Link to="/amend" className="hover:text-white transition">Amendment Simulator</Link></li>
            <li><Link to="/evaluation" className="hover:text-white transition">Benchmark Evaluation</Link></li>
            <li><Link to="/status" className="hover:text-white transition">System Status</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Academic Project</h4>
          <p className="text-xs text-dark-muted mb-2">VIT BITE412L Cloud Computing Project</p>
          <p className="text-xs text-white font-medium mb-1">Team Members:</p>
          <p className="text-xs text-dark-muted">Hitanshi Arora • Yashvardhan Debas • Ishani Arora</p>
          
          <div className="mt-4 flex items-center gap-3">
            <a
              href="https://github.com/yashvardhandebas/Cloud-Native-Semantic-Eligibility-Reasoning-Framework"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-white transition"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-dark-muted gap-4">
        <div>
          © 2026 SchemeSense Framework. All rights reserved.
        </div>

        {/* Live / Mock Indicator */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          <Database className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Execution Mode:</span>
          {mockActive ? (
            <span className="text-brand-amber font-mono font-medium">[MOCKED DEMO FIXTURES]</span>
          ) : (
            <span className="text-brand-emerald font-mono font-medium">[LIVE FASTAPI & AURADB]</span>
          )}
        </div>
      </div>
    </footer>
  );
};
