import React from 'react';
import { Layers, Github, Users, Award, BookOpen } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">About SchemeSense</h1>
        <p className="text-xs text-dark-muted">VIT BITE412L Cloud Computing Capstone Project</p>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 leading-relaxed text-xs text-dark-muted">
        <h3 className="text-base font-bold text-white">Research Gap & Innovation</h3>
        <p>
          Traditional government welfare portals rely on rigid hardcoded forms or manual officer verification. SchemeSense introduces a cloud-native, semantic Graph RAG framework capable of ingesting raw legislative notifications in Hindi, Tamil, Telugu, and English, mapping clauses to standardized ontology fields, and evaluating citizen facts with version-aware historical reasoning.
        </p>

        <h3 className="text-base font-bold text-white mt-4">Project Authors & Team</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium">Hitanshi Arora</div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium">Yashvardhan Debas</div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium">Ishani Arora</div>
        </div>
      </div>
    </div>
  );
};
