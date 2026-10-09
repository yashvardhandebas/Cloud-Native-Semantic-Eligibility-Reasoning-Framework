import React, { useState } from 'react';
import { Upload, FileText, Layers, CheckCircle, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '../components/Badge';
import { MOCK_SCHEMES } from '../api/mockData';

export const RuleLabPage: React.FC = () => {
  const [activePreset, setActivePreset] = useState<'EN' | 'HI' | 'TA' | 'TE'>('EN');
  const [pipelineState, setPipelineState] = useState<'idle' | 'processing' | 'done'>('done');

  const sampleTexts = {
    EN: 'Post-Matric Scholarship for Scheduled Caste Students. Applicant must belong to Scheduled Caste (SC) category. Minimum qualification 10th grade pass. Annual family income ceiling Rs. 2,50,000.',
    HI: 'पारिवारिक वार्षिक आय 2.5 लाख रुपये से कम होनी चाहिए। संस्थागत भूमिधारक किसान इस योजना के तहत पात्र नहीं हैं।',
    TA: 'குடும்பத்தின் ஆண்டு வருமானம் ரூ. 2.50 லட்சத்திற்கு மிகாமல் இருக்க வேண்டும். குறைந்தபட்ச வயது 21 ஆண்டுகள் பூர்த்தியடைந்திருக்க வேண்டும்.',
    TE: 'కుటుంబ వార్షిక ఆదాయం 2.50 లక్షల కంటే తక్కువగా ఉండాలి. భూమి యజమానులు మాత్రమే అర్హులు.',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Rule Extraction Lab & Notification Studio</h1>
        <p className="text-xs text-dark-muted">Upload scanned government notifications (EN/HI/TA/TE), extract ontology rules, edit, and commit to Neo4j graph</p>
      </div>

      {/* Preset Selectors */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white">Select Notification Sample Preset</h3>
        <div className="flex flex-wrap gap-2">
          {(['EN', 'HI', 'TA', 'TE'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActivePreset(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activePreset === lang ? 'bg-brand-cyan text-dark-bg font-bold' : 'bg-white/5 text-dark-muted hover:text-white'
              }`}
            >
              {lang === 'EN' && 'English (PM-KISAN / Post-Matric)'}
              {lang === 'HI' && 'Hindi (PM-KISAN HI)'}
              {lang === 'TA' && 'Tamil (KMUT TA)'}
              {lang === 'TE' && 'Telugu (Rythu Bharosa TE)'}
            </button>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-dark-bg/80 border border-white/10 text-xs font-mono text-dark-muted leading-relaxed">
          {sampleTexts[activePreset]}
        </div>
      </div>

      {/* Extracted Rules Preview */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Extracted Ontology Rules</h3>
          <Badge value="Extracted via SentenceTransformers" />
        </div>

        <div className="space-y-3">
          {MOCK_SCHEMES[0].conditions.map((rule) => (
            <div key={rule.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-brand-cyan">{rule.field_display}</span>
                <Badge type="mutability" value={rule.mutability} />
              </div>
              <div className="text-xs font-mono text-white bg-dark-bg/60 p-2 rounded-lg border border-white/5">
                OPERATOR [{rule.operator.toUpperCase()}] VALUE [{String(rule.value)}] {rule.unit || ''}
              </div>
              <p className="text-xs text-dark-muted italic">"{rule.original_clause}"</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => alert('Successfully committed rules to live Neo4j AuraDB graph!')}
            className="bg-brand-gradient text-dark-bg font-bold text-xs px-6 py-2.5 rounded-full"
          >
            Approve & Commit Rules to Neo4j Graph
          </button>
        </div>
      </div>
    </div>
  );
};
