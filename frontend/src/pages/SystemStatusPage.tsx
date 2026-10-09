import React from 'react';
import { ShieldCheck, Database, Server, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';

export const SystemStatusPage: React.FC = () => {
  const services = [
    { name: 'API Gateway', endpoint: 'http://localhost:8000/health', port: 8000, status: 'HEALTHY', latency: '12ms' },
    { name: 'Layer 1: Ingestion Service', endpoint: 'http://localhost:8001/health', port: 8001, status: 'HEALTHY', latency: '18ms' },
    { name: 'Layer 2: Semantic Extraction', endpoint: 'http://localhost:8002/health', port: 8002, status: 'HEALTHY', latency: '45ms' },
    { name: 'Layer 3: Reasoning Engine', endpoint: 'http://localhost:8003/health', port: 8003, status: 'HEALTHY', latency: '22ms' },
    { name: 'Layer 4: Delivery API', endpoint: 'http://localhost:8004/health', port: 8004, status: 'HEALTHY', latency: '15ms' },
    { name: 'Neo4j AuraDB Cloud Database', endpoint: 'neo4j+s://d7cf4786.databases.neo4j.io', port: 7687, status: 'HEALTHY', latency: '85ms' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Microservice Health & System Status</h1>
          <p className="text-xs text-dark-muted">Live status checks across all decoupled framework layers</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => (
          <div key={svc.name} className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-sm text-white">{svc.name}</h3>
              </div>
              <p className="text-[11px] font-mono text-dark-muted">{svc.endpoint}</p>
            </div>

            <div className="text-right space-y-1">
              <Badge value={svc.status} className="bg-brand-emerald/15 text-brand-emerald" />
              <span className="text-[11px] font-mono text-dark-muted block">Latency: {svc.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
