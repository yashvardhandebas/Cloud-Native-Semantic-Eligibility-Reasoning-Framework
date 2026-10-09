import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-4 space-y-6">
      <div className="w-16 h-16 rounded-full bg-brand-rose/15 border border-brand-rose/30 flex items-center justify-center text-brand-rose mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <p className="text-xs text-dark-muted">The page or scheme route you are looking for does not exist in the framework.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-brand-gradient text-dark-bg font-bold text-xs px-6 py-2.5 rounded-full"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};
