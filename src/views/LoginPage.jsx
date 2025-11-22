import React from 'react';
import { Share2, RefreshCw, Power } from 'lucide-react';

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

export default LoginPage;
