import React, { useState } from 'react';
import { RefreshCw, Link, Activity, ArrowRightLeft } from 'lucide-react';
import { generateUser } from '../utils/mockData';

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

export default RelationshipMapperView;
