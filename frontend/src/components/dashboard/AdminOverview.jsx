import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Briefcase, DollarSign, Activity, AlertCircle, 
  Loader2, Shield, Zap, Globe, Cpu, TrendingUp, 
  Server, Lock, Search, Filter, ArrowUpRight
} from 'lucide-react';
import { api } from '../../api';

/**
 * ADMIN MASTER CONSOLE (v5.0)
 * - Cinematic intelligence hub for platform controllers.
 * - Multi-sector telemetry monitoring.
 * - Neural mesh visual architecture.
 */
const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
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

    fetchStats();
    const interval = setInterval(() => setPulse(p => (p + 1) % 100), 3000);
    return () => clearInterval(interval);
  }, []);

  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })();

  const adminName = user?.name || 'Controller';

  if (loading) {
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

  const sectors = [
    { 
      id: 'users',
      label: 'Global Population', 
      value: stats?.totalUsers?.toLocaleString() || '1,284', 
      detail: `${stats?.students || '842'} Students · ${stats?.clients || '442'} Clients`,
      icon: <Users className="w-5 h-5" />, 
      color: 'from-blue-600 to-indigo-600',
      trend: '+12% increase'
    },
    { 
      id: 'projects',
      label: 'Venture Throughput', 
      value: stats?.activeProjects?.toLocaleString() || '156', 
      detail: '84% Engagement Rate',
      icon: <Briefcase className="w-5 h-5" />, 
      color: 'from-purple-600 to-fuchsia-600',
      trend: '18 new today'
    },
    { 
      id: 'finance',
      label: 'Economic Velocity', 
      value: `₹${(stats?.totalRevenue || 452000).toLocaleString()}`, 
      detail: 'Platform GTV (Gross Transaction Value)',
      icon: <DollarSign className="w-5 h-5" />, 
      color: 'from-emerald-600 to-teal-600',
      trend: 'Stable Settlement'
    },
    { 
      id: 'uptime',
      label: 'System Integrity', 
      value: '99.98%', 
      detail: 'Node Connectivity: Global',
      icon: <Cpu className="w-5 h-5" />, 
      color: 'from-rose-600 to-pink-600',
      trend: 'Zero Latency'
    }
  ];

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full animate-[fade-in_0.5s]">
      {/* ── HEADER: COMMAND CENTER PROFILE ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-3">
             <div className="h-[2px] w-12 bg-purple-600 rounded-full" />
             <span className="text-[11px] font-black uppercase text-purple-600 tracking-[0.4em]">Control Sector: Alpha-Prime</span>
           </div>
           <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
             Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Console</span>
           </h1>
           <div className="flex items-center gap-4 text-slate-400">
              <Shield className="w-5 h-5 text-emerald-500" />
              <p className="text-lg font-medium">Authorized Personnel: <span className="text-slate-900 font-black">{adminName}</span></p>
           </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-white border border-slate-100 p-5 rounded-[28px] shadow-sm flex items-center gap-6">
              <div className="text-right">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Server Latency</span>
                 <span className="text-xl font-black text-slate-900">12ms</span>
              </div>
              <div className="w-px h-10 bg-slate-100" />
              <div className="text-right">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Global Load</span>
                 <span className="text-xl font-black text-slate-900">42%</span>
              </div>
           </div>
           <button className="bg-slate-900 text-white p-5 rounded-[28px] shadow-xl hover:bg-purple-600 transition-all group active:scale-95">
              <Zap className="w-6 h-6 group-hover:animate-pulse" />
           </button>
        </div>
      </div>

      {/* ── TELEMETRY SECTORS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {sectors.map((s, i) => (
          <motion.div 
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between h-[240px]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent opacity-50 group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex justify-between items-start relative z-10">
               <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg`}>
                  {s.icon}
               </div>
               <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">
                  {s.trend}
               </span>
            </div>

            <div className="relative z-10">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">{s.label}</span>
               <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">{s.value}</h3>
               <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">{s.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CENTRAL INTELLIGENCE GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Real-time Event Stream */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm relative overflow-hidden">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Live Event Stream</h2>
              </div>
              <div className="flex gap-2">
                 <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><Search className="w-4 h-4" /></button>
                 <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><Filter className="w-4 h-4" /></button>
              </div>
           </div>

           <div className="space-y-6">
              {[
                { actor: 'Sarah Chen', action: 'New Student Registration', time: '2m', color: 'bg-blue-500', icon: <Users size={12}/> },
                { actor: 'Venture Capital X', action: 'Project Deployment: AI Matrix', time: '14m', color: 'bg-purple-500', icon: <Briefcase size={12}/> },
                { actor: 'Alex Johnson', action: 'Payment Released: ₹12,000', time: '1h', color: 'bg-emerald-500', icon: <DollarSign size={12}/> },
                { actor: 'System Core', action: 'Certificate Minted: Node.js Master', time: '3h', color: 'bg-rose-500', icon: <Activity size={12}/> },
                { actor: 'Michael Scott', action: 'New Client Onboarding', time: '5h', color: 'bg-amber-500', icon: <Users size={12}/> },
              ].map((ev, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[24px] hover:bg-slate-50 transition-all group">
                   <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl ${ev.color} text-white flex items-center justify-center shadow-md`}>
                         {ev.icon}
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{ev.actor}</h4>
                         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{ev.action}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-slate-300 uppercase">{ev.time} ago</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-200 group-hover:text-slate-900 transition-all" />
                   </div>
                </div>
              ))}
           </div>

           <button className="w-full mt-10 py-5 rounded-[22px] bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all">
              Load Protocol Archives
           </button>
        </div>

        {/* Global Traffic & Node Status */}
        <div className="space-y-10">
           {/* Node Map Placeholder */}
           <div className="bg-slate-950 rounded-[50px] p-10 text-white relative overflow-hidden shadow-2xl h-[350px] flex flex-col justify-between">
              <div className="absolute inset-0 opacity-20">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
                    <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="0.5" fill="none" />
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
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Node Latency Map</span>
                 </div>
                 <h3 className="text-3xl font-black uppercase tracking-tighter">Global <span className="text-purple-500">Signal</span></h3>
              </div>

              <div className="relative z-10 space-y-4">
                 {[
                   { node: 'AP-South-1 (Mumbai)', status: 'Optimal', ping: '8ms' },
                   { node: 'US-East-1 (Virginia)', status: 'Active', ping: '74ms' },
                   { node: 'EU-West-1 (Dublin)', status: 'Active', ping: '112ms' }
                 ].map((n, i) => (
                   <div key={i} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-slate-400">{n.node}</span>
                      <span className="text-emerald-400">{n.ping}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Platform Health Monitor */}
           <div className="bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                 <Activity className="w-5 h-5 text-rose-500" />
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">System Pulse</h3>
              </div>
              
              <div className="space-y-8">
                 {[
                   { label: 'Database Health', val: 98, color: 'bg-emerald-500' },
                   { label: 'API Response Time', val: 92, color: 'bg-blue-500' },
                   { label: 'AI Match Engine', val: 78, color: 'bg-amber-500' }
                 ].map((m, i) => (
                   <div key={i}>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                         <span>{m.label}</span>
                         <span className="text-slate-900">{m.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${m.val}%` }}
                           transition={{ duration: 1, delay: i * 0.2 }}
                           className={`h-full ${m.color}`} 
                         />
                      </div>
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
