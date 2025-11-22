import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw, Activity, ZoomIn, ZoomOut, Focus, ArrowUpRight, EyeOff, X, FileText
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { generateUser } from '../utils/mockData';
import { MOCK_NAMES } from '../config/constants';

const GraphView = ({ user, settings, onViewProfile }) => {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [hiddenNodeIds, setHiddenNodeIds] = useState(new Set());

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });

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
  }, [nodes, links, hiddenNodeIds]);

  return (
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
                <button onClick={() => onViewProfile()} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded flex items-center justify-center gap-2"><FileText size={12}/> View Full Profile</button>
            </div>
            )}
        </div>
    </div>
  );
}
export default GraphView;
