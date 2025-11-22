import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

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

export default DataBrowserView;
