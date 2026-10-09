import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  FileCheck, 
  AlertTriangle, 
  GitBranch, 
  History, 
  Calendar, 
  CheckCircle, 
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';
import { MOCK_SCHEMES } from '../api/mockData';
import { Badge } from '../components/Badge';

export const SchemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'documents' | 'exclusions' | 'graph' | 'version'>('overview');
  const [asOfDate, setAsOfDate] = useState('2026-10-09');

  const scheme = MOCK_SCHEMES.find((s) => s.id === id) || MOCK_SCHEMES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Back link */}
      <button
        onClick={() => navigate('/schemes')}
        className="flex items-center gap-2 text-xs text-dark-muted hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Schemes
      </button>

      {/* Scheme Header */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge value={scheme.category} />
              <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-2.5 py-0.5 rounded-full border border-brand-cyan/20">
                {scheme.version}
              </span>
              <span className="text-xs text-dark-muted">Source: {scheme.language}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{scheme.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/check/${scheme.id}`)}
              className="bg-brand-gradient text-dark-bg font-bold text-xs px-6 py-2.5 rounded-full shadow-lg"
            >
              Check My Eligibility
            </button>
          </div>
        </div>

        <p className="text-xs text-dark-muted leading-relaxed max-w-4xl">{scheme.summary}</p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'overview' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'rules' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Eligibility Rules ({scheme.conditions.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'documents' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" /> Documents ({scheme.documents.length})
        </button>
        <button
          onClick={() => setActiveTab('exclusions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'exclusions' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Exclusions ({scheme.exclusions.length})
        </button>
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'graph' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" /> Rule Graph (Neo4j)
        </button>
        <button
          onClick={() => setActiveTab('version')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'version' ? 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Version History (Point-in-Time)
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Scheme Benefits</h3>
            <div className="space-y-3">
              {scheme.benefits.map((b) => (
                <div key={b.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs text-white">{b.title}</span>
                    {b.amount && <span className="text-xs font-bold text-brand-emerald">{b.amount} ({b.frequency})</span>}
                  </div>
                  <p className="text-xs text-dark-muted">{b.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Governance & Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-dark-muted">State / Jurisdiction:</span>
                <span className="text-white font-medium">{scheme.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-dark-muted">Active Version:</span>
                <span className="text-brand-cyan font-mono">{scheme.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-dark-muted">Last Amended Date:</span>
                <span className="text-white font-mono">{scheme.last_amended}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Parsed Eligibility Conditions</h3>
          <div className="space-y-3">
            {scheme.conditions.map((cond) => (
              <div key={cond.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-brand-cyan">{cond.field_display}</span>
                  <div className="flex items-center gap-2">
                    <Badge type="mutability" value={cond.mutability} />
                    <span className="text-[11px] font-mono text-dark-muted">Confidence: {(cond.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="text-xs font-mono text-white bg-dark-bg/60 p-2 rounded-lg border border-white/5">
                  FIELD [{cond.field}] {cond.operator.toUpperCase()} {String(cond.value)} {cond.unit || ''}
                </div>
                <p className="text-xs text-dark-muted italic">"{cond.original_clause}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Required Proof Documents</h3>
          <div className="space-y-3">
            {scheme.documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xs text-white">{doc.title}</h4>
                  <p className="text-[11px] text-dark-muted">Issuing Authority: {doc.issuing_authority}</p>
                </div>
                <Badge value="Required Proof" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'exclusions' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white mb-2">Disqualifying Exclusion Overrides</h3>
          <div className="space-y-3">
            {scheme.exclusions.map((ex) => (
              <div key={ex.id} className="p-4 rounded-xl bg-brand-rose/10 border border-brand-rose/30 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-brand-rose">{ex.title}</h4>
                  <Badge value="OVERRIDES ALL" className="bg-brand-rose/20 text-brand-rose" />
                </div>
                <p className="text-xs text-dark-muted italic">"{ex.original_clause}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'graph' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 text-center">
          <h3 className="text-base font-bold text-white mb-2">Interactive Rule Graph Visualizer</h3>
          <p className="text-xs text-dark-muted">Graph visualization showing Scheme node linked to Conditions, Documents, Benefits, and Exclusions.</p>
          <div className="h-80 bg-dark-bg/80 rounded-xl border border-white/10 flex items-center justify-center p-6">
            <div className="space-y-4">
              <GitBranch className="w-12 h-12 text-brand-cyan mx-auto animate-pulse" />
              <div className="text-xs font-mono text-white">
                (:Scheme {scheme.id}) -[:HAS_CONDITION]-&gt; (:Condition {scheme.conditions.length} nodes)
              </div>
              <p className="text-[11px] text-dark-muted">Neo4j Cypher Graph schema verified on live AuraDB Cloud.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'version' && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Point-in-Time Historical Query (`as_of`)</h3>
            <p className="text-xs text-dark-muted mt-1">Select an effective date to evaluate historical rules active at that time.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <Calendar className="w-4 h-4 text-brand-cyan" />
            <label className="text-xs font-semibold text-white">Target Date (`as_of`):</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="bg-dark-bg border border-white/15 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Active Clauses as of {asOfDate}:</span>
              <span className="text-[11px] font-mono text-brand-emerald">STATUS: CURRENT VERSION ACTIVE</span>
            </div>
            <pre className="text-[11px] font-mono bg-dark-bg/80 p-3 rounded-lg text-dark-muted">
              MATCH (s:Scheme &#123;id: "{scheme.id}"&#125;)-[:HAS_CONDITION]-&gt;(c:Condition)
              WHERE c.valid_from &lt;= "{asOfDate}" AND (c.valid_to IS NULL OR c.valid_to &gt;= "{asOfDate}")
              RETURN c.field, c.value, c.is_current
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
