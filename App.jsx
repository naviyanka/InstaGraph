import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Shield, Share2, Maximize2, Minimize2, RefreshCw, Users, Lock, CheckCircle, X, 
  Activity, Database, Sparkles, MessageSquare, Send, Bot, GitCompare, ArrowRightLeft, 
  Layers, LayoutDashboard, Network, Settings, FileText, ChevronRight, User, MapPin, Calendar,
  Filter, ArrowUpRight, Grid, Link, Heart, MessageCircle, ExternalLink, 
  ZoomIn, ZoomOut, MousePointer2, EyeOff, Focus, LogIn, Instagram, Check, AlertCircle, Power
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';

/**
 * ==================================================================================
 * MODULE 1: CONFIGURATION & UTILITIES
 * ==================================================================================
 */

// --- FIREBASE INIT ---
// Note: These variables are injected by the runtime environment
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- MOCK DATA GENERATORS ---
const MOCK_NAMES = ["alex_design", "sarah_codes", "mike_travels", "jess_art", "dave_fitness", "anna_photo", "chris_tech", "emily_style", "ryan_music", "kate_foodie"];

const generatePosts = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `post_${Math.random().toString(36).substr(2, 9)}`,
    imageUrl: `https://picsum.photos/seed/${Math.random()}/300/300`,
    likes: Math.floor(Math.random() * 500) + 10,
    comments: Math.floor(Math.random() * 50),
    caption: ["Just another day in paradise! 🌴", "Work grind 💻 #coding", "Coffee first ☕️", "Throwback to last summer ☀️", "New project coming soon..."][Math.floor(Math.random() * 5)]
  }));
};

const generateUser = (id, username, isPrivate = false) => {
  const createdDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
  const postsCount = Math.floor(Math.random() * 20) + 1;
  return {
    id,
    username: username || `user_${id}`,
    fullName: (username || `User ${id}`).split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    bio: isPrivate ? "This account is private." : "Digital explorer | Tech enthusiast | 📍 NYC | DM for collab 📩",
    followersCount: Math.floor(Math.random() * 5000) + 100,
    followingCount: Math.floor(Math.random() * 1000) + 50,
    postsCount: postsCount,
    posts: generatePosts(postsCount),
    isPrivate,
    riskScore: Math.floor(Math.random() * 100),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || id}`,
    color: isPrivate ? '#64748b' : '#3b82f6',
    location: ["New York, USA", "London, UK", "Berlin, DE", "Tokyo, JP", "Unknown"][Math.floor(Math.random() * 5)],
    joinedDate: createdDate.toLocaleDateString(),
    email: Math.random() > 0.7 ? `${username}@gmail.com` : null,
    phone: Math.random() > 0.8 ? "+1 *** *** ****" : null,
    followers: [], 
    following: []
  };
};

/**
 * ==================================================================================
 * MODULE 2: VIEW COMPONENTS (DASHBOARD, MAPER, VAULT, SETTINGS)
 * ==================================================================================
 */

// --- VIEW: LOGIN PAGE ---
const LoginPage = ({ onLogin, isLoading }) => (
  <div className="h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),rgba(15,23,42,1))] pointer-events-none"></div>
    <div className="z-10 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
       <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
          <Share2 className="text-white" size={32}/>
       </div>
       <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">InstaGraph<span className="text-purple-400">Analyst</span></h1>
       <p className="text-slate-400 mb-8 text-sm">Advanced OSINT & Relationship Intelligence Platform</p>
       <button 
         onClick={onLogin}
         disabled={isLoading}
         className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group"
       >
         {isLoading ? <RefreshCw className="animate-spin" size={20}/> : <Power size={20} className="group-hover:scale-110 transition-transform"/>}
         {isLoading ? 'Authenticating...' : 'Initialize Session'}
       </button>
    </div>
  </div>
);

// --- VIEW: DASHBOARD ---
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

// --- VIEW: SETTINGS ---
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

// --- VIEW: RELATIONSHIP MAPPER ---
const RelationshipMapperView = ({ database }) => {
  const [targetA, setTargetA] = useState('');
  const [targetB, setTargetB] = useState('');
  const [path, setPath] = useState(null);
  const [intersections, setIntersections] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const findPath = () => {
    if (!targetA || !targetB) return;
    setIsCalculating(true);
    setTimeout(() => {
      const uA = Object.values(database.users).find(u => u.username.toLowerCase() === targetA.toLowerCase());
      const uB = Object.values(database.users).find(u => u.username.toLowerCase() === targetB.toLowerCase());
      
      if (!uA || !uB) {
        setPath({ error: "One or both profiles not found in database. Run a scrape first." });
        setIntersections([]);
      } else {
        // Mock finding a bridge
        const bridge = Object.values(database.users).find(u => u.id !== uA.id && u.id !== uB.id) || generateUser("bridge_mock", "mutual_connect");
        const mutuals = [bridge, generateUser("mutual_2", "common_link_2")];
        setIntersections(mutuals);
        setPath({ steps: [uA, bridge, uB], found: true });
      }
      setIsCalculating(false);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Relationship Mapper</h1>
      <p className="text-slate-400 mb-8">Trace connection paths between entities.</p>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 max-w-4xl shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full"><input value={targetA} onChange={e => setTargetA(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Entity A"/></div>
          <ArrowRightLeft className="text-slate-500 hidden md:block" />
          <div className="flex-1 w-full"><input value={targetB} onChange={e => setTargetB(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" placeholder="Entity B"/></div>
          <button onClick={findPath} disabled={isCalculating} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold flex items-center gap-2 disabled:opacity-50">{isCalculating ? <RefreshCw className="animate-spin" size={16} /> : <Link size={16} />} Trace</button>
        </div>
      </div>

      <div className="min-h-[300px] bg-slate-900/50 border border-slate-700 rounded-xl relative overflow-hidden flex items-center justify-center mb-8 shadow-inner">
        {!path && !isCalculating && <div className="text-slate-500">Enter two usernames to trace.</div>}
        {isCalculating && <div className="text-purple-400 flex items-center gap-2"><Activity className="animate-pulse"/> Analyzing Graph...</div>}
        {path && path.found && (
          <div className="flex items-center gap-4 md:gap-12 animate-in zoom-in duration-500">
             {path.steps.map((step, idx) => (
               <div key={step.id} className="flex items-center">
                 <div className="flex flex-col items-center gap-2">
                    <div className={`w-20 h-20 rounded-full p-1 border-2 ${idx === 1 ? 'border-amber-500 border-dashed animate-pulse' : 'border-purple-500'}`}><img src={step.avatar} className="w-full h-full rounded-full object-cover" alt=""/></div>
                    <div className="text-center"><div className="font-bold text-white">{step.username}</div><div className="text-xs text-slate-400">{idx === 0 ? 'Source' : idx === 2 ? 'Target' : 'Bridge'}</div></div>
                 </div>
                 {idx < path.steps.length - 1 && <div className="h-0.5 w-16 bg-slate-600 mx-4"></div>}
               </div>
             ))}
          </div>
        )}
      </div>

      {intersections.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
           <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50"><h3 className="font-bold text-white">Detected Intersections</h3></div>
           <table className="w-full text-left text-sm"><tbody className="divide-y divide-slate-700/50">{intersections.map((u, i) => (<tr key={i}><td className="px-6 py-3 flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-full"/><span>{u.username}</span></td><td className="px-6 py-3 text-slate-400">Mutual Follower</td></tr>))}</tbody></table>
        </div>
      )}
    </div>
  );
};

// --- VIEW: DATA VAULT ---
const DataBrowserView = ({ database, initialFilter, onBack }) => {
  const [viewMode, setViewMode] = useState('list'); 
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter || 'all');
  const [activeTab, setActiveTab] = useState('overview'); 

  // Sub-component: Mini Graph for Vault Detail
  const MiniGraph = ({ user, database }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const nodes = [
         { ...user, x: canvas.width/2, y: canvas.height/2, fixed: true },
         ...user.followers.slice(0, 10).map((id, i) => ({ ...(database.users[id] || {id}), x: 0, y:0, angle: i })), 
         ...user.following.slice(0, 10).map((id, i) => ({ ...(database.users[id] || {id}), x: 0, y:0, angle: i+10 }))
      ].filter(n => n.id); 
      
      nodes.forEach((n, i) => {
         if(i===0) return;
         const angle = (i / nodes.length) * Math.PI * 2;
         n.x = canvas.width/2 + Math.cos(angle) * 100;
         n.y = canvas.height/2 + Math.sin(angle) * 100;
      });

      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.beginPath();
      nodes.forEach(n => {
         if(n.id === user.id) return;
         ctx.moveTo(user.x, user.y); ctx.lineTo(n.x, n.y);
      });
      ctx.strokeStyle = '#334155'; ctx.lineWidth=1; ctx.stroke();
      nodes.forEach(n => {
         ctx.beginPath(); ctx.arc(n.x, n.y, n.id === user.id ? 15 : 8, 0, Math.PI*2);
         ctx.fillStyle = n.id === user.id ? '#3b82f6' : '#64748b'; ctx.fill();
      });
    }, [user, database]);
    return <canvas ref={canvasRef} width={600} height={400} className="w-full h-full bg-slate-900 rounded-xl border border-slate-800 shadow-inner" />;
  };

  const users = Object.values(database.users);
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'highRisk') return u.riskScore > 70;
    if (filter === 'private') return u.isPrivate;
    return true;
  });

  const handleProfileClick = (id) => {
    if (!database.users[id]) return;
    setSelectedId(id);
    setViewMode('detail');
    setActiveTab('overview');
  };

  // Helper to render follower lists
  const renderConnectionList = (ids, type) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
       <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center"><h3 className="font-bold text-white">{type}</h3><span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">{ids.length}</span></div>
       <table className="w-full text-left text-sm"><tbody className="divide-y divide-slate-700/50">{ids.map(id => { const u = database.users[id]; if(!u) return null; return (<tr key={id} className="hover:bg-slate-700/30"><td className="px-6 py-3 flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-full"/><span className="text-slate-300">{u.username}</span></td><td className="px-6 py-3 text-right"><button onClick={() => handleProfileClick(id)} className="text-blue-400 hover:text-blue-300 text-xs">View</button></td></tr>) })}</tbody></table>
    </div>
  );

  if (viewMode === 'detail' && selectedId) {
    const user = database.users[selectedId];
    return (
      <div className="h-full flex flex-col bg-slate-900">
        <div className="h-14 border-b border-slate-700 flex items-center px-4 gap-2 bg-slate-800/50">
           <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm"><ChevronRight className="rotate-180" size={16}/> Back</button>
           <span className="font-mono text-sm text-slate-300 ml-4">@{user.username}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
           <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-1/3 bg-slate-800/50 rounded-xl p-6 border border-slate-700 h-fit">
                  <div className="text-center">
                      <img src={user.avatar} className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-slate-700"/>
                      <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                      <p className="text-slate-400 text-sm mb-6">{user.fullName}</p>
                      <div className="grid grid-cols-3 gap-2 mb-6 border-y border-slate-700 py-4">
                          <div><div className="font-bold text-white">{user.postsCount}</div><div className="text-[10px] text-slate-500">POSTS</div></div>
                          <div><div className="font-bold text-white">{user.followersCount}</div><div className="text-[10px] text-slate-500">FOLLOWERS</div></div>
                          <div><div className="font-bold text-white">{user.followingCount}</div><div className="text-[10px] text-slate-500">FOLLOWING</div></div>
                      </div>
                      <p className="text-slate-300 text-sm mb-4">{user.bio}</p>
                  </div>
              </div>
              <div className="lg:w-2/3">
                 <div className="flex gap-2 mb-4 border-b border-slate-700 overflow-x-auto">
                    {['overview', 'posts', 'followers', 'following', 'graph'].map(tab => (
                       <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium capitalize border-b-2 ${activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500'}`}>{tab}</button>
                    ))}
                 </div>
                 {activeTab === 'overview' && <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700"><h3 className="font-bold text-white mb-2">Analysis</h3><p className="text-sm text-slate-400">Risk Score: {user.riskScore}/100. {user.riskScore > 50 ? 'High anomaly detected.' : 'Appears authentic.'}</p></div>}
                 {activeTab === 'graph' && <MiniGraph user={user} database={database} />}
                 {activeTab === 'posts' && <div className="grid grid-cols-3 gap-2">{user.posts?.map(p => <div key={p.id} className="aspect-square bg-slate-800 rounded overflow-hidden"><img src={p.imageUrl} className="w-full h-full object-cover"/></div>)}</div>}
                 {activeTab === 'followers' && renderConnectionList(user.followers, "Followers")}
                 {activeTab === 'following' && renderConnectionList(user.following, "Following")}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
       <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-bold text-white">Data Vault</h1>
          <div className="flex gap-2">
             <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-4 py-2 text-white w-64"/>
             <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2"><option value="all">All</option><option value="highRisk">High Risk</option></select>
          </div>
       </div>
       <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-xl">
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-900 text-slate-400 font-medium sticky top-0 z-10 shadow-sm"><tr><th className="px-6 py-4">Identity</th><th className="px-6 py-4">Risk</th><th className="px-6 py-4 text-right"></th></tr></thead>
               <tbody className="divide-y divide-slate-700/50">
                  {filteredUsers.map(u => (
                     <tr key={u.id} onClick={() => handleProfileClick(u.id)} className="hover:bg-slate-700/50 cursor-pointer"><td className="px-6 py-4 flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-full"/><span className="text-white font-bold">{u.username}</span></td><td className="px-6 py-4 text-slate-400">{u.riskScore}</td><td className="px-6 py-4 text-right"><ChevronRight size={16} className="text-slate-600"/></td></tr>
                  ))}
               </tbody>
            </table>
          </div>
       </div>
    </div>
  );
};

/**
 * ==================================================================================
 * MODULE 3: MAIN APP CONTROLLER
 * ==================================================================================
 */
export default function InstaGraphApp() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [mockDatabase, setMockDatabase] = useState({ users: {}, connections: [] });
  const [settings, setSettings] = useState({ scrapeDepth: 1, stealthMode: true, instagramConnected: false });
  const [vaultFilter, setVaultFilter] = useState('all'); 
  
  // Graph State
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [secondaryQuery, setSecondaryQuery] = useState('');
  const [showCompare, setShowCompare] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [hiddenNodeIds, setHiddenNodeIds] = useState(new Set());

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });

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

  // --- GRAPH ENGINE & PHYSICS ---
  const startAnalysisPipeline = () => {
    if (!searchQuery) return;
    setIsScraping(true);
    setNodes([]); setLinks([]); setSelectedNode(null); setHiddenNodeIds(new Set());

    const addGraphNode = (node) => {
      setNodes(p => p.find(n => n.id === node.id) ? p : [...p, node]);
      if(user) setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profiles', node.id), node, {merge:true});
    };
    const addGraphLink = (source, target, type) => {
      setLinks(p => p.find(l => l.source === source && l.target === target) ? p : [...p, {source, target, type}]);
      if(user) setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'connections', `${source}_${target}`), {source, target, type});
    };

    const generateRecursive = (parentId, parentX, parentY, currentLevel, group) => {
        if (currentLevel > settings.scrapeDepth) return;
        const count = currentLevel === 1 ? (6 + Math.floor(Math.random()*4)) : (2 + Math.floor(Math.random()*3));
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const nodeId = `l${currentLevel}_${group}_${parentId}_${i}`;
                const node = generateUser(nodeId, MOCK_NAMES[i % MOCK_NAMES.length]);
                node.group = group; node.level = currentLevel; node.parentId = parentId;
                const angle = (i/count)*Math.PI*2;
                node.x = parentX + Math.cos(angle)*120; node.y = parentY + Math.sin(angle)*120;
                addGraphNode(node);
                addGraphLink(parentId, node.id, 'follower');
                generateRecursive(node.id, node.x, node.y, currentLevel + 1, group);
            }, i*300 + (currentLevel*500));
        }
    };

    const root = generateUser(`root_${searchQuery}`, searchQuery);
    root.x = window.innerWidth/2; root.y = window.innerHeight/2; root.fixed = true; root.level = 0;
    addGraphNode(root);
    generateRecursive(root.id, root.x, root.y, 1, 'A');
    
    setTimeout(() => setIsScraping(false), settings.scrapeDepth * 3000);
  };

  // Physics Loop
  useEffect(() => {
    if (currentView !== 'graph') return;
    const ctx = canvasRef.current?.getContext('2d');
    if(!ctx) return;
    
    let anim;
    const run = () => {
        const activeN = nodes.filter(n => !hiddenNodeIds.has(n.id));
        const activeL = links.filter(l => !hiddenNodeIds.has(l.source) && !hiddenNodeIds.has(l.target));
        
        activeN.forEach(n1 => {
            activeN.forEach(n2 => {
                if(n1===n2) return;
                const dx=n1.x-n2.x, dy=n1.y-n2.y, d=Math.sqrt(dx*dx+dy*dy)||1;
                const f=2000/(d*d);
                if(!n1.fixed && !n1.isDragging) { n1.vx=(n1.vx||0)+(dx/d)*f; n1.vy=(n1.vy||0)+(dy/d)*f; }
            });
            if(!n1.fixed && !n1.isDragging) {
                n1.vx=(n1.vx||0)-(n1.x-window.innerWidth/2)*0.0005;
                n1.vy=(n1.vy||0)-(n1.y-window.innerHeight/2)*0.0005;
                n1.x+=n1.vx; n1.y+=n1.vy; n1.vx*=0.9; n1.vy*=0.9;
            }
        });
        activeL.forEach(l => {
            const s=activeN.find(n=>n.id===l.source), t=activeN.find(n=>n.id===l.target);
            if(s&&t) {
                const dx=t.x-s.x, dy=t.y-s.y, d=Math.sqrt(dx*dx+dy*dy)||1;
                const f=(d-100)*0.005;
                if(!s.fixed) { s.vx+=(dx/d)*f; s.vy+=(dy/d)*f; }
                if(!t.fixed) { t.vx-=(dx/d)*f; t.vy-=(dy/d)*f; }
            }
        });

        ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
        ctx.save();
        ctx.translate(transformRef.current.x, transformRef.current.y);
        ctx.scale(transformRef.current.k, transformRef.current.k);
        
        activeL.forEach(l => {
            const s=activeN.find(n=>n.id===l.source), t=activeN.find(n=>n.id===l.target);
            if(s&&t) {
                ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(t.x,t.y);
                ctx.strokeStyle = l.type === 'mutual' ? '#22c55e' : '#475569';
                ctx.lineWidth = l.type === 'mutual' ? 3 : 1;
                ctx.stroke();
            }
        });
        activeN.forEach(n => {
            ctx.beginPath(); ctx.arc(n.x,n.y,20,0,Math.PI*2);
            ctx.fillStyle='#1e293b';
            if(n.level===0) ctx.strokeStyle='#a855f7';
            else if(n.level===1) ctx.strokeStyle='#3b82f6';
            else ctx.strokeStyle='#64748b';
            ctx.lineWidth=2; ctx.fill(); ctx.stroke();
            ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.textAlign='center';
            ctx.fillText(n.username, n.x, n.y+35);
        });
        ctx.restore();
        anim = requestAnimationFrame(run);
    };
    run();
    return () => cancelAnimationFrame(anim);
  }, [nodes, links, currentView, hiddenNodeIds]);

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
           <div className="h-full flex flex-col relative">
              <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 justify-between backdrop-blur-sm z-10 shrink-0">
                 <div className="flex items-center gap-4">
                    <h2 className="font-bold text-lg text-white">Graph Analyst</h2>
                    <div className="flex items-center bg-slate-800 rounded-lg p-1">
                       <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none text-xs text-white px-3 py-1 focus:outline-none w-32 md:w-48" placeholder="Target (e.g. elon)"/>
                    </div>
                 </div>
                 <button onClick={startAnalysisPipeline} disabled={isScraping || !searchQuery} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50">{isScraping ? <RefreshCw className="animate-spin" size={14}/> : <Activity size={14}/>} Run Analysis</button>
              </div>
              <div className="flex-1 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 overflow-hidden cursor-crosshair">
                 <canvas ref={canvasRef} width={window.innerWidth-80} height={window.innerHeight} 
                    onMouseDown={e => {
                        const r = canvasRef.current.getBoundingClientRect();
                        const mx = (e.clientX-r.left-transformRef.current.x)/transformRef.current.k;
                        const my = (e.clientY-r.top-transformRef.current.y)/transformRef.current.k;
                        const n = nodes.find(n=>!hiddenNodeIds.has(n.id) && Math.sqrt((n.x-mx)**2+(n.y-my)**2)<20);
                        if(n) { dragRef.current={node:n}; n.isDragging=true; setSelectedNode(n); }
                        else dragRef.current={pan:true, sx:e.clientX, sy:e.clientY, ox:transformRef.current.x, oy:transformRef.current.y};
                    }}
                    onMouseMove={e => {
                        if(!dragRef.current) return;
                        if(dragRef.current.node) {
                            const r = canvasRef.current.getBoundingClientRect();
                            dragRef.current.node.x=(e.clientX-r.left-transformRef.current.x)/transformRef.current.k;
                            dragRef.current.node.y=(e.clientY-r.top-transformRef.current.y)/transformRef.current.k;
                        } else if(dragRef.current.pan) {
                            transformRef.current.x = dragRef.current.ox + (e.clientX-dragRef.current.sx);
                            transformRef.current.y = dragRef.current.oy + (e.clientY-dragRef.current.sy);
                        }
                    }}
                    onMouseUp={() => { if(dragRef.current?.node) dragRef.current.node.isDragging=false; dragRef.current=null; }}
                    onWheel={e => { e.preventDefault(); transformRef.current.k = Math.max(0.1, Math.min(5, transformRef.current.k * (e.deltaY<0?1.1:0.9))); }}
                    onContextMenu={e => {
                        e.preventDefault();
                        const r = canvasRef.current.getBoundingClientRect();
                        const mx = (e.clientX-r.left-transformRef.current.x)/transformRef.current.k;
                        const my = (e.clientY-r.top-transformRef.current.y)/transformRef.current.k;
                        const n = nodes.find(n=>!hiddenNodeIds.has(n.id) && Math.sqrt((n.x-mx)**2+(n.y-my)**2)<20);
                        if(n) setContextMenu({x:e.clientX, y:e.clientY, node:n}); else setContextMenu(null);
                    }}
                    className="block w-full h-full"
                 />
                 <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                    <button onClick={() => transformRef.current.k *= 1.2} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-white shadow-lg"><ZoomIn size={20}/></button>
                    <button onClick={() => transformRef.current.k /= 1.2} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-white shadow-lg"><ZoomOut size={20}/></button>
                 </div>
                 {contextMenu && (
                    <div className="absolute bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden min-w-[160px]" style={{top:contextMenu.y, left:contextMenu.x}}>
                       <button onClick={() => {
                           const n = contextMenu.node;
                           transformRef.current.x = (window.innerWidth/2) - n.x*transformRef.current.k;
                           transformRef.current.y = (window.innerHeight/2) - n.y*transformRef.current.k;
                           setContextMenu(null);
                       }} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"><Focus size={14}/> Focus Node</button>
                       <button onClick={() => {
                           const p = nodes.find(n=>n.id===contextMenu.node.parentId);
                           if(p) { transformRef.current.x = (window.innerWidth/2) - p.x*transformRef.current.k; transformRef.current.y = (window.innerHeight/2) - p.y*transformRef.current.k; }
                           setContextMenu(null);
                       }} className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"><ArrowUpRight size={14}/> Trace Parent</button>
                       <button onClick={() => {
                           const stack=[contextMenu.node.id], hide=new Set(hiddenNodeIds);
                           while(stack.length) { const id=stack.pop(); hide.add(id); nodes.filter(n=>n.parentId===id).forEach(c=>stack.push(c.id)); }
                           setHiddenNodeIds(hide); setContextMenu(null);
                       }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"><EyeOff size={14}/> Hide Branch</button>
                    </div>
                 )}
                 {selectedNode && !contextMenu && (
                    <div className="absolute top-4 right-4 w-72 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-2xl animate-in slide-in-from-right-5 z-30">
                       <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3"><img src={selectedNode.avatar} className="w-10 h-10 rounded-full border border-slate-600"/><div className="font-bold text-sm text-white">{selectedNode.username}</div></div><button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white"><X size={14}/></button></div>
                       <div className="text-xs text-slate-300 mb-4 leading-relaxed">{selectedNode.bio}</div>
                       <button onClick={() => setCurrentView('data')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded flex items-center justify-center gap-2"><FileText size={12}/> View Full Profile</button>
                    </div>
                 )}
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
