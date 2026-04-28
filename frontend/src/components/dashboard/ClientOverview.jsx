import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Clock, Users, Loader2, 
  Sparkles, Zap, ArrowRight, Brain, Activity, Rocket, 
  Search, DollarSign, MessageSquare, TrendingUp, Cpu, Globe, Star, Download, CheckCircle
} from 'lucide-react';
import { api } from '../../api.js';
import AiMarketEstimator from '../landing/AiMarketEstimator.jsx';
import SmartMatchRadar from './SmartMatchRadar';
import { Target } from 'lucide-react';

/**
 * CLIENT OVERVIEW: CINEMATIC COMMAND HUB (v4)
 * - Expansive 4-Sector Intelligence architecture.
 * - Market Pulse analytic unit integration.
 * - Reactive Telemetry with high-frequency monitors.
 */
const ClientOverview = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ventures'); 
  const [myPayments, setMyPayments] = useState([]);

  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  })();
  
  const userId = user?._id || user?.id;
  const firstName = (user?.name || 'Venture').split(' ')[0];

  useEffect(() => {
    let isMounted = true;
    const loadDossier = async () => {
      if (!userId) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const [projData, payData] = await Promise.all([
           api.getProjects(userId),
           api.getPayments()
        ]);
        if (isMounted) {
           setProjects(Array.isArray(projData) ? projData : []);
           setMyPayments(Array.isArray(payData) ? payData : []);
        }
      } catch (err) {
        if (isMounted) console.error("Communication failure with master node.", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadDossier();
    return () => { isMounted = false; };
  }, [userId]);

  const handleDownloadLedger = () => {
    if (!myPayments.length) return;
    const generationTime = new Date().toLocaleString();
    const headers = ["NPCI Hash", "Protocol", "Developer", "Expense (INR)", "Timestamp", "State"];
    const rows = myPayments.map(p => [
      `NPCI-${p.transactionId?.toUpperCase() || 'REF'}`,
      p.projectId?.title || 'Wallet Recharge',
      p.studentId?.name || 'Self / System',
      `- ${p.totalAmount || 0}`,
      new Date(p.createdAt).toLocaleString(),
      p.status === 'released' ? 'Settled' : 'In Escrow'
    ]);

    const infoRow = [`LocalDev Technologies - Financial Statement (Report Generated On: ${generationTime})`, "", "", "", "", ""];
    const stakeholderRow = [`Authorized Downloader: ${user?.name || 'Venture Manager'}`, "", "", "", "", ""];
    const footerRow = ["", "", "", "", "", ""];
    const protocolRow = ["Protocol: LocalDev Matrix v4.0 (Client Command Hub Export)", "", "", "", "", ""];
    const csvContent = [infoRow, stakeholderRow, [], headers, ...rows, footerRow, protocolRow].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', ''); a.setAttribute('href', url); a.setAttribute('download', `LocalDev_Expenses_${new Date().getTime()}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#fcfcfc]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence...</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto w-full animate-[fade-in_0.5s]">
      <div className="mb-12 px-6 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between transition-all gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="h-[2px] w-12 bg-rose-500 rounded-full" />
             <span className="text-[11px] font-black uppercase text-rose-500 tracking-[0.3em]">Sector Protocol: Online</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Client Terminal</h1>
           <p className="text-slate-400 text-sm md:text-xl font-medium mt-3">Welcome, Controller <span className="text-slate-900 font-black">{firstName}</span>. Scanning active ventures.</p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
           <button onClick={() => navigate('/post-project')} className="bg-slate-900 text-white px-12 py-5 rounded-[22px] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-rose-500 active:scale-95 transition-all">
              Deploy New Project
           </button>
           <div className="bg-white border border-slate-100 shadow-sm px-8 py-4 rounded-[22px] flex justify-between gap-10">
              <div>
                 <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Active Units</span>
                 <span className="text-lg font-black tracking-tight text-slate-900">{projects.filter(p => p.developer).length} Units</span>
              </div>
              <div className="w-px h-8 bg-slate-100 my-auto" />
              <div>
                 <span className="text-[8px] font-black uppercase text-slate-400 block mb-1">Sector Value</span>
                 <span className="text-lg font-black tracking-tight text-slate-900">₹{projects.reduce((s,p)=>s+(p.budget||0),0).toLocaleString()}</span>
              </div>
           </div>
        </div>
      </div>

      {/* ── INTELLIGENCE NAVIGATION (FULL BLOCK) ────────────────────────────── */}
      <div className="space-y-10">
         <div className="bg-white border-2 border-slate-50 rounded-[35px] md:rounded-[60px] p-4 flex flex-col md:flex-row gap-4 shadow-sm border-2 border-white">
            {[
              { id: 'ventures', label: 'Strategic Ledger', icon: <Rocket className="w-3.5 h-3.5"/> },
              { id: 'matching', label: 'Match Intelligence', icon: <Target className="w-3.5 h-3.5"/> },
              { id: 'telemetry', label: 'Sector Traffic', icon: <Users className="w-3.5 h-3.5"/> },
              { id: 'analytics', label: 'Signal Monitor', icon: <Activity className="w-3.5 h-3.5"/> }
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} 
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none outline-none
                ${activeTab === t.id ? 'bg-slate-900 text-white shadow-xl translate-y-[-1px]' : 'text-slate-400 hover:bg-slate-50'}`}>
                {t.icon} {t.label}
              </button>
            ))}
         </div>

         {/* ── DYNAMIC CONTENT AREA ────────────────────────────────────────────── */}
         <div className="min-h-[400px]">
            {activeTab === 'ventures' && (
              <div className="space-y-8 animate-[fade-in_0.3s]">
                 {/* Venture Capital Pulse Card */}
                 <div className="bg-slate-900 rounded-[35px] md:rounded-[50px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px]" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                       <div className="flex-1 text-center md:text-left">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400 mb-2 block">Venture Capital Pulse</span>
                          <h4 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none">Strategic Ledger Status</h4>
                          <p className="text-slate-500 text-[10px] font-bold mt-4 uppercase tracking-widest leading-relaxed italic max-w-sm">Synchronizing localized settlement payloads for all active cloud ventures.</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Total Exposure</span>
                             <span className="text-4xl font-black text-rose-400">₹{myPayments.reduce((s,p)=>s+p.totalAmount,0).toLocaleString()}</span>
                          </div>
                          <button 
                            onClick={handleDownloadLedger}
                            className="bg-white/10 hover:bg-white/20 text-white p-6 rounded-[32px] border border-white/10 transition-all flex items-center gap-4 group/btn cursor-pointer"
                          >
                             <Download className="w-6 h-6 text-rose-400 group-hover/btn:scale-110 transition-transform" />
                             <div className="text-left">
                                <span className="text-[10px] font-black uppercase tracking-widest block leading-none text-white transition-all">Export dossier</span>
                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Full NPCI Archive</span>
                             </div>
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* FILTER SECTOR: Show only active ventures or those pending review. */}
                    {projects.filter(p => p.status === 'in_progress' || p.status === 'review' || (p.status === 'completed' && !p.isReviewed)).length === 0 ? (
                      <div className="col-span-full bg-white p-32 rounded-[60px] border border-slate-50 text-center opacity-40">
                         <Search className="w-16 h-16 mx-auto mb-6 text-slate-200" />
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active mission found. All sectors clear.</p>
                      </div>
                    ) : (
                      projects.filter(p => p.status === 'in_progress' || p.status === 'review' || (p.status === 'completed' && !p.isReviewed)).map((p, i) => (
                        <div key={p._id || i} className="bg-white rounded-[32px] md:rounded-[45px] p-6 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col h-auto md:h-[340px]">
                           <div className="flex justify-between items-start">
                              <div className="flex-1">
                                 <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-100">{p.category || 'Architecture'}</span>
                                 <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter mt-4 md:mt-6 group-hover:text-rose-500 transition-colors line-clamp-2 leading-tight md:leading-[0.9]">{p.title}</h3>
                              </div>
                              <div className={`shrink-0 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                p.status === 'review' ? 'bg-amber-100 text-amber-600' : 
                                p.status === 'completed' ? 'bg-rose-100 text-rose-500' : 'bg-rose-50 text-rose-500'
                              }`}>
                                {p.status === 'review' ? 'Audit Needed' : p.status === 'completed' ? 'Pending Review' : 'Active'}
                                <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'review' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                              </div>
                           </div>
                           
                           <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-end">
                              <div>
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Venture Capital</span>
                                 <span className="text-xl font-black text-slate-900">₹{(p.budget || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-6">
                                 {p.status === 'review' ? (
                                   <button 
                                     onClick={() => navigate('/client-dashboard/submissions')} 
                                     className="bg-amber-500 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl active:scale-90 flex items-center gap-3 border-none cursor-pointer"
                                   >
                                      Audit Deliverables <Clock className="w-4 h-4 animate-pulse" />
                                   </button>
                                 ) : (p.status === 'completed' && !p.isReviewed) ? (
                                   <button 
                                     onClick={() => navigate(`/client-dashboard/review/${p._id}`)} 
                                     className="w-full sm:w-auto bg-rose-500 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-xl active:scale-90 flex items-center justify-center gap-3 border-none cursor-pointer"
                                   >
                                      Review Dev <Star className="w-4 h-4 fill-white" />
                                   </button>
                                 ) : (
                                   <div className="flex flex-col items-end gap-2">
                                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">Track Progress</span>
                                      <button 
                                        onClick={() => navigate(p.developer ? `/client-dashboard/track/${p._id}` : '/client-dashboard/developers')} 
                                        className="bg-slate-950 text-white p-6 rounded-3xl hover:bg-rose-500 transition-all shadow-xl active:scale-90 border-none cursor-pointer flex items-center justify-center p-6"
                                      >
                                         <ArrowRight className="w-5 h-5" />
                                      </button>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            )}



            {activeTab === 'matching' && (
               <div className="animate-[fade-in_0.3s] max-w-4xl mx-auto">
                  <SmartMatchRadar type="client" />
               </div>
            )}

            {activeTab === 'telemetry' && (
               <div className="space-y-8 animate-[fade-in_0.3s]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {[
                       { label: 'Active Developers', val: '42', status: 'Online', icon: <Users/> },
                       { label: 'Live Projects', val: '18', status: 'Running', icon: <Rocket/> },
                       { label: 'Open Sessions', val: '156', status: 'Global', icon: <Globe/> }
                     ].map((s, i) => (
                       <div key={i} className="bg-white p-6 md:p-10 rounded-[35px] md:rounded-[45px] border border-slate-100 shadow-sm flex flex-col justify-between gap-6 md:gap-8 group hover:translate-y-[-8px] transition-all">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-rose-500 group-hover:text-white shadow-inner">{s.icon}</div>
                          <div>
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] block mb-2">{s.label}</span>
                             <div className="flex justify-between items-end">
                                <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{s.val}</span>
                                <span className="text-rose-500 text-[8px] font-black uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">{s.status}</span>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
                  
                  <div className="bg-slate-950 rounded-[45px] p-12 text-white relative overflow-hidden shadow-xl">
                     <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                           <motion.path 
                             animate={{ d: ["M0 50 Q 25 30, 50 50 T 100 50", "M0 50 Q 25 70, 50 50 T 100 50", "M0 50 Q 25 30, 50 50 T 100 50"] }}
                             transition={{ repeat: Infinity, duration: 4 }}
                             d="M0 50 Q 25 30, 50 50 T 100 50" 
                             stroke="white" strokeWidth="0.5" fill="none" 
                           />
                        </svg>
                     </div>
                     <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                           <h4 className="text-xl font-black uppercase tracking-tighter">Live Sector Latency</h4>
                           <p className="text-indigo-300/40 text-[9px] font-black uppercase tracking-widest mt-1">Simulated Real-Time Frequency</p>
                        </div>
                        <div className="flex gap-4 items-end h-12">
                           {[1,2,3,4,5,6,7,8].map(i => (
                              <motion.div 
                                key={i}
                                animate={{ height: [12, 32, 12, 24, 12] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: i*0.1 }}
                                className="w-2 bg-rose-400 rounded-full"
                              />
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-16 text-center animate-[fade-in_0.5s] bg-white rounded-[60px] border border-slate-50 shadow-inner">
                 <div className="w-24 h-24 bg-indigo-50 rounded-[28px] flex items-center justify-center mx-auto mb-10 border border-indigo-100 shadow-xl">
                    <Activity className="w-10 h-10 text-rose-500" />
                 </div>
                 <h3 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">Signal Monitor</h3>
                 <p className="text-slate-400 text-sm font-black max-w-md mx-auto mb-10 uppercase tracking-widest leading-relaxed">Tracking real-time events, developer check-ins, and mission-critical milestones across the platform.</p>
                 <div className="bg-slate-950 p-12 rounded-[50px] inline-flex flex-col md:flex-row items-center gap-12 shadow-2xl text-white">
                    <div className="text-left">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Event Frequency</span>
                       <span className="text-4xl font-black text-rose-400">High</span>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-white/10" />
                    <div className="text-left">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Uptime Protocol</span>
                       <span className="font-black text-emerald-400 text-4xl">99.9%</span>
                    </div>
                    <div className="hidden md:block w-px h-12 bg-white/10" />
                    <div className="text-left">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Secure Channels</span>
                       <span className="font-black text-white text-4xl">AES-256</span>
                    </div>
                 </div>
              </div>
            )}
         </div>

      </div>
    </div>
  );
};

const ShieldCheck = ({className}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default ClientOverview;
