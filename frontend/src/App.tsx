import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';

import { LandingPage } from './pages/LandingPage';
import { BrowseSchemesPage } from './pages/BrowseSchemesPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { EligibilityCheckPage } from './pages/EligibilityCheckPage';
import { MyMatchesPage } from './pages/MyMatchesPage';
import { CompareSchemesPage } from './pages/CompareSchemesPage';
import { RuleLabPage } from './pages/RuleLabPage';
import { AmendmentSimulatorPage } from './pages/AmendmentSimulatorPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between selection:bg-brand-magenta/30 selection:text-brand-cyan">
        <CommandPalette />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/schemes" element={<BrowseSchemesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailPage />} />
            <Route path="/check" element={<EligibilityCheckPage />} />
            <Route path="/check/:schemeId" element={<EligibilityCheckPage />} />
            <Route path="/matches" element={<MyMatchesPage />} />
            <Route path="/compare" element={<CompareSchemesPage />} />
            <Route path="/lab" element={<RuleLabPage />} />
            <Route path="/amend" element={<AmendmentSimulatorPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="/status" element={<SystemStatusPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
