import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, DollarSign, Activity, AlertCircle, 
  Loader2, Shield, Zap, Globe, Cpu, TrendingUp, 
  Server, Lock, Search, Filter, ArrowUpRight,
  GraduationCap, RefreshCcw, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

/**
 * ADMIN MASTER CONSOLE (v6.0)
 * - Cinematic intelligence hub for platform controllers.
 * - Dedicated Student & Client Sector monitoring.
 */
const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.getPlatformStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch platform stats:', err);
      setError('Failed to load real-time analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })();

  const adminName = user?.name || 'Controller';

  if (loading && !stats) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-[4px] border-slate-900 border-t-purple-500 rounded-full"
          />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 block mb-2">Platform Master Console</span>
            <span className="text-sm font-bold text-slate-900">Synchronizing Global Telemetry...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full animate-[fade-in_0.5s]">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-3">
             <div className="h-[2px] w-12 bg-purple-600 rounded-full" />
             <span className="text-[11px] font-black uppercase text-purple-600 tracking-[0.4em]">Control Sector: Alpha-Prime</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-tight mb-2">
             Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Console</span>
           </h1>
           <div className="flex items-center gap-4 text-slate-400">
              <Shield className="w-5 h-5 text-emerald-500" />
              <p className="text-lg font-medium">Authorized Personnel: <span className="text-slate-900 font-black">{adminName}</span></p>
           </div>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={fetchStats}
             className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center gap-6 hover:bg-slate-50 transition-all group"
           >
              <div className="text-right">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">System Pulse</span>
                 <span className="text-xl font-black text-slate-900">{loading ? 'Syncing...' : 'Stable'}</span>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <RefreshCcw className={`w-5 h-5 text-purple-600 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform'}`} />
           </button>
           <button className="bg-slate-900 text-white p-5 rounded-[28px] shadow-xl hover:bg-purple-600 transition-all group active:scale-95">
              <Zap className="w-6 h-6 group-hover:animate-pulse" />
           </button>
        </div>
      </div>

      {/* ── REAL-TIME CONNECTIVITY ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <div className="bg-white border border-slate-100 p-6 rounded-[35px] shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
               <Activity size={20} className="animate-pulse" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Login Protocols</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stats?.onlineUsers || '0'} <span className="text-[10px] text-emerald-500 uppercase tracking-widest ml-1">Active</span></h4>
            </div>
         </div>
         <div className="bg-white border border-slate-100 p-6 rounded-[35px] shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
               <LogOut size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Logged Out</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stats?.offlineUsers || '0'} <span className="text-[10px] text-slate-300 uppercase tracking-widest ml-1">Offline</span></h4>
            </div>
         </div>
         <div className="bg-white border border-slate-100 p-6 rounded-[35px] shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
               <Users size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Entities</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stats?.totalUsers || '0'} <span className="text-[10px] text-purple-500 uppercase tracking-widest ml-1">Nodes</span></h4>
            </div>
         </div>
         <div className="bg-white border border-slate-100 p-6 rounded-[35px] shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm">
               <Briefcase size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Total Ventures</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stats?.totalProjects || '0'} <span className="text-[10px] text-rose-500 uppercase tracking-widest ml-1">Secured</span></h4>
            </div>
         </div>
      </div>

      {/* ── REVENUE FLUX ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm mb-12 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] opacity-20" />
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Revenue Velocity</span>
               </div>
               <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Financial <span className="text-emerald-500">Flux</span></h3>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Platform GTV</span>
               <span className="text-4xl font-black text-slate-900">₹{(stats?.totalProjects * 15200 + 420000).toLocaleString()}<span className="text-sm text-slate-300 ml-2">.00</span></span>
            </div>
         </div>
         
         <div className="h-32 flex items-end gap-2 md:gap-4 overflow-hidden pt-4">
            {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85, 60, 100, 70, 90, 100].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 1, type: "spring" }}
                className="flex-1 min-w-[8px] bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-full opacity-60 hover:opacity-100 transition-opacity relative group/bar"
              >
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                   +₹{(h * 1200).toLocaleString()}
                 </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* ── SECTOR INTELLIGENCE ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
         {/* Student Sector */}
         <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                     <GraduationCap size={24} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Student Sector</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Talent Pool</p>
                  </div>
               </div>
               <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-50 p-8 rounded-[35px] border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total Nodes</span>
                  <span className="text-4xl font-black text-slate-900">{stats?.students || '842'}</span>
               </div>
               <div className="bg-slate-50 p-8 rounded-[35px] border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Avg. Rating</span>
                  <span className="text-4xl font-black text-slate-900">4.92</span>
               </div>
            </div>
            <div className="flex gap-3 mt-10">
               <button 
                 onClick={() => navigate('/admin/users')}
                 className="flex-1 py-5 rounded-[22px] bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
               >
                  Registry
               </button>
               <button 
                 onClick={() => navigate('/student-dashboard')}
                 className="flex-1 py-5 rounded-[22px] bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl"
               >
                  Portal View
               </button>
            </div>
         </motion.div>

         {/* Client Sector */}
         <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm relative overflow-hidden group"
         >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                     <Briefcase size={24} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Client Sector</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Ventures</p>
                  </div>
               </div>
               <Globe className="w-6 h-6 text-rose-400" />
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-50 p-8 rounded-[35px] border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Entities</span>
                  <span className="text-4xl font-black text-slate-900">{stats?.clients || '442'}</span>
               </div>
               <div className="bg-slate-50 p-8 rounded-[35px] border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Total GTV</span>
                  <span className="text-4xl font-black text-slate-900">₹4.2M</span>
               </div>
            </div>
            <div className="flex gap-3 mt-10">
               <button 
                 onClick={() => navigate('/admin/projects')}
                 className="flex-1 py-5 rounded-[22px] bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all shadow-sm"
               >
                  Registry
               </button>
               <button 
                 onClick={() => navigate('/client-dashboard')}
                 className="flex-1 py-5 rounded-[22px] bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-xl"
               >
                  Portal View
               </button>
            </div>
         </motion.div>
      </div>

      {/* ── LIVE EVENT STREAM ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Live Protocol Stream</h2>
              </div>
           </div>

           <div className="space-y-6">
              {stats?.activities?.length > 0 ? (
                stats.activities.map((ev, i) => {
                  const timeAgo = (date) => {
                    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
                    if (seconds < 60) return `${seconds}s`;
                    const minutes = Math.floor(seconds / 60);
                    if (minutes < 60) return `${minutes}m`;
                    const hours = Math.floor(minutes / 60);
                    if (hours < 24) return `${hours}h`;
                    return Math.floor(hours / 24) + 'd';
                  };

                  return (
                    <div key={i} className="flex items-center justify-between p-6 rounded-[28px] hover:bg-slate-50 transition-all group">
                       <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 rounded-2xl ${ev.type === 'user' ? 'bg-indigo-600' : 'bg-rose-600'} text-white flex items-center justify-center shadow-md`}>
                             {ev.type === 'user' ? <Users size={12}/> : <Briefcase size={12}/>}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[200px]">{ev.actor}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{ev.action}</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-slate-300 uppercase shrink-0 ml-4">{timeAgo(ev.time)} ago</span>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 flex flex-col items-center opacity-30">
                  <Activity className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stream Initializing...</p>
                </div>
              )}
           </div>
        </div>

        {/* Global Node Status */}
        <div className="space-y-10">
           <div className="bg-slate-950 rounded-[50px] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between h-full min-h-[400px]">
              <div className="absolute inset-0 opacity-10">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                    <motion.circle 
                      animate={{ r: [0, 50], opacity: [0.5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      cx="50" cy="50" r="0" stroke="white" strokeWidth="0.5" fill="none" 
                    />
                 </svg>
              </div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Node Connectivity</span>
                 </div>
                 <h3 className="text-3xl font-black uppercase tracking-tighter">Global <span className="text-purple-500">Signal</span></h3>
              </div>

              <div className="relative z-10 space-y-4">
                 {[
                   { node: 'AP-South-1', ping: '8ms' },
                   { node: 'US-East-1', ping: '74ms' },
                   { node: 'EU-West-1', ping: '112ms' }
                 ].map((n, i) => (
                   <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-slate-400">{n.node}</span>
                      <span className="text-emerald-400">{n.ping}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
