import React, { useState, useEffect, useMemo } from 'react';
import { 
  Share2, LayoutDashboard, Network, Database, Shield, GitCompare, Settings,
  RefreshCw, Activity, ZoomIn, ZoomOut, Focus, ArrowUpRight, EyeOff, X, FileText
} from 'lucide-react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

import { auth, db, appId } from './src/config/firebase';
import { generateUser } from './src/utils/mockData';
import { MOCK_NAMES } from './src/config/constants';

import LoginPage from './src/views/LoginPage';
import DashboardView from './src/views/DashboardView';
import SettingsView from './src/views/SettingsView';
import RelationshipMapperView from './src/views/RelationshipMapperView';
import DataBrowserView from './src/views/DataBrowserView';
import GraphView from './src/views/GraphView';

export default function InstaGraphApp() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [mockDatabase, setMockDatabase] = useState({ users: {}, connections: [] });
  const [settings, setSettings] = useState({ scrapeDepth: 1, stealthMode: true, instagramConnected: false });
  const [vaultFilter, setVaultFilter] = useState('all'); 
  
  // --- AUTH & DB SYNC ---
  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      }
      setIsAuthLoading(false);
    };
    init();
    return onAuthStateChanged(auth, (u) => { setUser(u); if(u) setIsAuthLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubSettings = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), (s) => { if(s.exists()) setSettings(s.data()); });
    const unsubProfiles = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'profiles'), (s) => { 
        const m = {}; s.forEach(d => m[d.id] = d.data()); setMockDatabase(p => ({ ...p, users: m }));
    });
    const unsubConns = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'connections'), (s) => {
        const l = []; s.forEach(d => l.push(d.data())); setMockDatabase(p => ({ ...p, connections: l }));
    });
    return () => { unsubSettings(); unsubProfiles(); unsubConns(); };
  }, [user]);

  const updateSettings = async (newS) => {
     if (!user) return;
     await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), { ...settings, ...newS }, { merge: true });
  };

  const dbStats = useMemo(() => ({
      users: Object.keys(mockDatabase.users).length,
      connections: mockDatabase.connections.length,
      highRisk: Object.values(mockDatabase.users).filter(u => u.riskScore > 70).length,
      size: JSON.stringify(mockDatabase).length
  }), [mockDatabase]);

  // --- RENDER MAIN ---
  if (!user) return <LoginPage onLogin={async () => { setIsAuthLoading(true); await signInAnonymously(auth); }} isLoading={isAuthLoading} />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* NAV */}
      <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 z-20 shrink-0">
         <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-8 shadow-lg"><Share2 className="text-white" size={20}/></div>
         <div className="flex flex-col gap-4 w-full px-3">
            {[['dashboard', <LayoutDashboard/>], ['graph', <Network/>], ['mapper', <GitCompare/>], ['data', <Database/>]].map(([id, icon]) => (
               <button key={id} onClick={() => setCurrentView(id)} className={`p-3 rounded-xl transition-all flex justify-center ${currentView===id?'bg-slate-800 text-blue-400':'text-slate-500 hover:bg-slate-800/50'}`}>{React.cloneElement(icon, {size:20})}</button>
            ))}
         </div>
         <div className="mt-auto"><button onClick={() => setCurrentView('settings')} className={`p-3 rounded-xl ${currentView==='settings'?'bg-slate-800 text-white':'text-slate-500'}`}><Settings size={20}/></button></div>
      </div>

      {/* VIEW ROUTER */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden">
         {currentView === 'dashboard' && <DashboardView dbStats={dbStats} onNavigate={(v, o) => { setCurrentView(v); if(o?.filter) setVaultFilter(o.filter); }} />}
         {currentView === 'mapper' && <RelationshipMapperView database={mockDatabase} />}
         {currentView === 'data' && <DataBrowserView database={mockDatabase} initialFilter={vaultFilter} onBack={() => setCurrentView('dashboard')} />}
         {currentView === 'settings' && <SettingsView settings={settings} updateSettings={updateSettings} />}
         
         {currentView === 'graph' && (
            <GraphView
              user={user}
              settings={settings}
              onViewProfile={() => setCurrentView('data')}
            />
         )}
      </div>
    </div>
  );
}
