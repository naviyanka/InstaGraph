import React, { useState } from 'react';
import { Instagram, RefreshCw, Check, LogIn } from 'lucide-react';

const SettingsView = ({ settings, updateSettings }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectInstagram = () => {
    setIsConnecting(true);
    setTimeout(() => {
      updateSettings({ instagramConnected: !settings.instagramConnected });
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="p-8 max-w-3xl overflow-y-auto h-full">
       <h1 className="text-3xl font-bold text-white mb-8">System Configuration</h1>
       <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
             <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                <Instagram size={20} className="text-pink-500"/> Instagram Integration
             </h3>
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-sm text-slate-200 font-medium">Connected Account</div>
                   <div className="text-xs text-slate-500">Required for private profile scraping.</div>
                </div>
                <button onClick={handleConnectInstagram} disabled={isConnecting} className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all ${settings.instagramConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400' : 'bg-pink-600 hover:bg-pink-500 text-white'}`}>
                   {isConnecting ? <RefreshCw className="animate-spin" size={14}/> : (settings.instagramConnected ? <Check size={14}/> : <LogIn size={14}/>)}
                   {isConnecting ? 'Connecting...' : (settings.instagramConnected ? 'Connected' : 'Connect Account')}
                </button>
             </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
             <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Scraping Engine</h3>
             <div className="flex items-center justify-between mb-6">
                <div>
                   <div className="text-sm text-slate-200 font-medium">Recursive Depth Limit</div>
                   <div className="text-xs text-slate-500">Maximum graph traversal depth.</div>
                </div>
                <select value={settings.scrapeDepth} onChange={(e) => updateSettings({ scrapeDepth: parseInt(e.target.value) })} className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded px-3 py-1 focus:outline-none focus:border-blue-500">
                   <option value={1}>Level 1 (Direct)</option>
                   <option value={2}>Level 2 (Extended)</option>
                   <option value={3}>Level 3 (Deep Net)</option>
                </select>
             </div>
             <div className="flex items-center justify-between">
                <div>
                   <div className="text-sm text-slate-200 font-medium">Stealth Mode</div>
                   <div className="text-xs text-slate-500">Introduce delays to evade detection.</div>
                </div>
                <button onClick={() => updateSettings({ stealthMode: !settings.stealthMode })} className={`w-10 h-5 rounded-full relative transition-colors ${settings.stealthMode ? 'bg-green-500' : 'bg-slate-600'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.stealthMode ? 'right-1' : 'left-1'}`}></div>
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default SettingsView;
