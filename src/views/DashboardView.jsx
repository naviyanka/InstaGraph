import React from 'react';
import { Users, Network, Database, Shield } from 'lucide-react';

const DashboardView = ({ dbStats, onNavigate }) => (
  <div className="p-4 md:p-8 overflow-y-auto h-full scroll-smooth">
    <h1 className="text-3xl font-bold mb-2 text-white">Mission Control</h1>
    <p className="text-slate-400 mb-8">Overview of scraped targets and relationship intelligence.</p>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <button onClick={() => onNavigate('data', { filter: 'all' })} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-slate-600 hover:scale-[1.02] transition-all text-left group shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors"><Users className="text-blue-400" size={20}/></div>
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">OPEN VAULT</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{dbStats.users}</div>
        <div className="text-xs text-slate-400">Profiles Indexed</div>
      </button>

      <button onClick={() => onNavigate('mapper')} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-slate-600 hover:scale-[1.02] transition-all text-left group shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors"><Network className="text-purple-400" size={20}/></div>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{dbStats.connections}</div>
        <div className="text-xs text-slate-400">Relationships Mapped</div>
      </button>

      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 cursor-default shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-lg"><Database className="text-emerald-400" size={20}/></div>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{(dbStats.size / 1024).toFixed(2)} KB</div>
        <div className="text-xs text-slate-400">Data Volume</div>
      </div>

      <button onClick={() => onNavigate('data', { filter: 'highRisk' })} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:bg-slate-700 hover:border-slate-600 hover:scale-[1.02] transition-all text-left group shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors"><Shield className="text-red-400" size={20}/></div>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{dbStats.highRisk}</div>
        <div className="text-xs text-slate-400">High Risk Targets</div>
      </button>
    </div>
  </div>
);

export default DashboardView;
