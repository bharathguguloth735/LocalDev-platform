import { useState, useEffect, useCallback } from 'react';
import { 
  Briefcase, DollarSign, Star, TrendingUp, Github, Loader2, Clock, 
  CheckCircle, Zap, Hourglass, Globe, Smartphone, Brain, Palette, 
  ChevronRight, MousePointer2, Sparkles, ArrowRight,
  Search, Activity, Rocket, Trophy, Target, Send, Plus, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { socket, connectSocket } from '../../socket.js';
import { useToast } from '../../components/layout/Toast';

const StudentOverview = () => {
  const [myJobs, setMyJobs] = useState([]); 
  const [openProjects, setOpenProjects] = useState([]);
  const [stats, setStats] = useState({ earnings: 0, hired: 0, applies: 0 });
  const [myPayments, setMyPayments] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [briefingProject, setBriefingProject] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?._id || user?.id;
  const firstName = (user?.name || 'Developer').split(' ')[0];

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [hiredJobs, all, payments] = await Promise.all([
        api.getMyJobs(), 
        api.getProjects(),
        api.getPayments()
      ]);
      const safeHired = Array.isArray(hiredJobs) ? hiredJobs : [];
      const safeAll = Array.isArray(all) ? all : [];
      const safePayments = Array.isArray(payments) ? payments : [];

      setMyPayments(safePayments);
      
      const appliedJobs = safeAll.filter(p => {
        const isApplicant = p.applicants?.some(a => (a?._id || a)?.toString() === userId?.toString());
        const isDev = (p.developer?._id || p.developer)?.toString() === userId?.toString();
        return isApplicant && !isDev;
      });
      
      setMyJobs([...safeHired.map(j => ({ ...j, isHired: true })), ...appliedJobs.map(j => ({ ...j, isApplied: true }))]);
      setOpenProjects(safeAll.filter(p => !p.applicants?.some(a => (a?._id || a)?.toString() === userId?.toString()) && p.status === 'open').slice(0, 6));
      setStats({ earnings: safePayments.reduce((sum, p) => sum + (p.studentAmount || 0), 0), hired: safeHired.length, applies: appliedJobs.length });
    } catch (err) { console.error(err); }
  }, [userId]);

  const handleDownloadLedger = () => {
    if (!myPayments.length) return;
    const generationTime = new Date().toLocaleString();
    const headers = ["NPCI Hash", "Protocol", "Client", "Earning (INR)", "Timestamp", "State"];
    const rows = myPayments.map(p => [
      `NPCI-${p.transactionId?.toUpperCase() || 'REF'}`,
      p.projectId?.title || 'System Protocol',
      p.clientId?.name || 'LocalDev Client',
      `+ ${p.studentAmount || 0}`,
      new Date(p.createdAt).toLocaleString(),
      p.status === 'released' ? 'Settled' : 'In Escrow'
    ]);

    const infoRow = [`LocalDev Technologies - Earning Statement (Report Generated On: ${generationTime})`, "", "", "", "", ""];
    const stakeholderRow = [`Authorized Downloader: ${user?.name || 'Developer'}`, "", "", "", "", ""];
    const footerRow = ["", "", "", "", "", ""];
    const protocolRow = ["Protocol: LocalDev Matrix v4.0 (Student Terminal Export)", "", "", "", "", ""];
    const csvContent = [infoRow, stakeholderRow, [], headers, ...rows, footerRow, protocolRow].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', ''); a.setAttribute('href', url); a.setAttribute('download', `LocalDev_Earnings_${new Date().getTime()}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('Financial dossier exported successfully to local storage.', 'success');
  };

  useEffect(() => {
    fetchData();
    if (userId && !socket.connected) connectSocket(userId);
    const events = ['project:hired', 'project:created', 'payment:released'];
    events.forEach(ev => socket.on(ev, fetchData));
    return () => events.forEach(ev => socket.off(ev, fetchData));
  }, [fetchData, userId]);

  const handleApply = async (projectId) => {
    if (applyingId) return;
    setApplyingId(projectId);
    try { 
      await api.applyToProject(projectId); 
      setBriefingProject(null); 
      setTermsAccepted(false); // Reset for next mission
      showToast('Mission Request Transmitted. Strategic review pending.', 'success');
      fetchData(); 
    } catch (err) { 
      showToast('Uplink Interrupted: ' + err.message, 'error');
      fetchData(); 
    } finally { 
      setApplyingId(null); 
    }
  };

  const handleInitiateScan = () => {
    setIsScanning(true);
    setOpenProjects([]);
    setTimeout(() => {
      fetchData();
      setIsScanning(false);
      showToast('Live sector sweep complete. New mission nodes localized.', 'success');
    }, 2000);
  };

  const getCategoryTheme = (category) => {
    const cat = (category || '').toLowerCase();
    return { 
      img: cat.includes('web') ? 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop' :
           cat.includes('app') ? 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop' :
                                'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop'
    };
  };

  return (
    <div className="p-4 md:p-10 pb-20 w-full min-h-screen bg-[#F1F5F9] relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-0" />

      <div className="mb-12 px-6 relative z-10 flex items-end justify-between transition-all">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="h-[2px] w-12 bg-indigo-600 rounded-full" />
             <span className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.3em]">Status: Active</span>
           </div>
           <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Student Terminal</h1>
           <p className="text-slate-400 text-xl font-medium mt-3">Welcome, <span className="text-slate-900 font-black">{firstName}</span>. Ready for your next mission?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16 px-6 relative z-10">
        {[
          { label: 'Total Earnings', value: `₹${stats.earnings.toLocaleString()}`, icon: <DollarSign />, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+12%', trendColor: 'text-emerald-600' },
          { label: 'Hired Projects', value: stats.hired, icon: <Briefcase />, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'Active', trendColor: 'text-blue-600' },
          { label: 'Active Applies', value: stats.applies, icon: <Hourglass />, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-2', trendColor: 'text-slate-400' },
          { label: 'Success Rate', value: '98%', icon: <Rocket />, color: 'text-indigo-500', bg: 'bg-indigo-50', trend: 'Global Top', trendColor: 'text-indigo-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[40px] p-8 border border-white shadow-sm flex items-center gap-6 relative group overflow-hidden transition-all hover:translate-y-[-4px]">
             <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full group-hover:bg-indigo-50/50 transition-colors" />
             <div className={`w-16 h-16 rounded-[24px] ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 shadow-inner relative z-10 transition-transform group-hover:scale-105`}>{stat.icon}</div>
             <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  {stat.label === 'Total Earnings' && myPayments.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); handleDownloadLedger(); }} className="text-[8px] font-black text-indigo-500 uppercase tracking-widest border border-indigo-100 px-2 py-0.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all">Download</button>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</h3>
                <span className={`text-[9px] font-black uppercase mt-1 block ${stat.trendColor}`}>{stat.trend}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10 px-6 relative z-10">
        <div className="lg:col-span-8 space-y-10">
           <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-6 bg-white/40 border border-white rounded-[24px] md:rounded-[32px] backdrop-blur-md">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">My Job Requests</h2>
              </div>
           </div>

           <div className="space-y-6">
               {myJobs.length === 0 ? (
                 <div className="p-20 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center text-center opacity-50">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6"><Search className="w-10 h-10 text-slate-400" /></div>
                    <h3 className="text-xl font-bold text-slate-900">No active engagements</h3>
                    <p className="text-slate-500 mt-2">Start scanning the radar for your first mission.</p>
                 </div>
               ) : (
                myJobs.map((job, idx) => {
                  const theme = getCategoryTheme(job.category);
                  return (
                    <div key={job._id || idx} className="bg-white border-2 border-white rounded-[24px] md:rounded-[32px] p-4 md:p-5 shadow-sm transition-all group flex flex-col sm:flex-row gap-4 md:gap-5 relative overflow-hidden hover:translate-y-[-4px]">
                      <div className="w-16 h-16 rounded-[20px] overflow-hidden shrink-0 border-[4px] border-slate-50 shadow-md group-hover:scale-105 transition-transform duration-500">
                        <img src={theme.img} className="w-full h-full object-cover" alt="" />
                      </div>

                      <div className="flex-1 flex flex-col justify-center py-0">
                         <div className="flex items-center justify-between gap-4 mb-2">
                             <div className="flex items-center gap-2">
                                {job.isApplied ? (
                                   <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">Protocol: Pending</span>
                                ) : (
                                   <div className="flex items-center gap-2">
                                      {job.status === 'in_progress' && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">Phase: Dev</span>}
                                      {job.status === 'review' && <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm animate-pulse">Phase: Audit</span>}
                                      {job.status === 'completed' && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">Phase: Completed</span>}
                                   </div>
                                )}
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none flex items-center gap-2">
                                   <span className="w-1 h-1 rounded-full bg-slate-200" /> {job.category || 'Architecture'}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 opacity-60">
                                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">
                                   {job.status === 'review' ? 'Audit' : job.progress < 30 ? 'Disc.' : job.progress < 70 ? 'Arch.' : 'Depl.'}
                                </span>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${job.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                             </div>
                         </div>

                         <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight uppercase group-hover:text-indigo-600 transition-colors line-clamp-2 mb-4">{job.title}</h2>
                         
                         <div className="flex items-center gap-4">
                            <div className="flex-1 flex flex-col gap-1.5">
                               <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">
                                  <span>Velocity</span>
                                  <span className="text-slate-900">{job.progress || 0}%</span>
                               </div>
                               <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                                  <div style={{ width: `${job.progress || 0}%` }} className="h-full bg-indigo-600 rounded-full transition-all duration-1000" />
                               </div>
                            </div>
                            
                            {/* NEW: Direct Submission Hooks */}
                            <div className="flex items-center gap-2">
                               {job.status === 'in_progress' ? (
                                 <button 
                                   onClick={() => navigate('/student-dashboard/projects')}
                                   className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                                 >
                                   <Send className="w-3 h-3" /> Final Submission
                                 </button>
                               ) : job.status === 'review' ? (
                                 <div className="px-6 py-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                   <Hourglass className="w-3 h-3 animate-pulse" /> Client Audit In Progress
                                 </div>
                               ) : job.status === 'completed' ? (
                                 <div className="flex flex-wrap items-center gap-2">
                                   <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                     <CheckCircle className="w-3 h-3" /> Deployment Validated
                                   </div>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); navigate('/student-dashboard/certificates'); }}
                                     className="px-4 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 border border-yellow-300 text-yellow-800 hover:scale-105 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-transform cursor-pointer shadow-sm"
                                   >
                                     <Trophy className="w-3 h-3 text-yellow-600" /> View Certificate
                                   </button>
                                 </div>
                               ) : null}
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })
               )}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10">


           {/* Original Radar/Stats - Moved down or kept as secondary */}
           <div className="bg-white rounded-[50px] p-10 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group border border-white">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30 transition-transform duration-1000" />
              
              <div className="absolute top-10 right-10 w-32 h-32 opacity-20 pointer-events-none">
                 <div className={`absolute inset-0 border-4 border-indigo-200 rounded-full ${isScanning ? 'animate-ping' : ''}`} />
                 <div className={`absolute inset-4 border-2 border-dashed border-indigo-400 rounded-full ${isScanning ? 'animate-spin' : ''}`} />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,1)]" />
                 {isScanning && (
                   <div className="absolute top-1/2 left-1/2 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-transparent origin-left animate-[spin_2s_linear_infinite]" />
                 )}
              </div>

              <div className="flex items-center justify-between mb-12 relative z-10">
                 <div className="flex flex-col">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none flex items-center gap-3">Radar Range <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /></h3>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-2 block">Live Sector Sweep</span>
                 </div>
              </div>

              <div className="space-y-5 relative z-10 min-h-[150px] flex flex-col justify-center">
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center py-10">
                       <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-center">Syncing with <br/>Global Node Network...</span>
                    </div>
                  ) : openProjects.length > 0 ? (
                    openProjects.map((proj, i) => (
                      <div 
                        key={proj._id || i} 
                        className="group/item p-6 rounded-[35px] bg-white border-2 border-slate-100 hover:border-indigo-100 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden hover:translate-x-2" 
                        onClick={() => setBriefingProject(proj)}
                      >
                         <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 translate-x-full group-hover/item:translate-x-0 transition-transform" />
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none bg-indigo-50 px-5 py-2.5 rounded-full group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">{proj.category || 'Mission'}</span>
                            <span className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 drop-shadow-sm">₹{proj.budget?.toLocaleString()}</span>
                         </div>
                         <h4 className="text-xl font-black text-slate-900 uppercase leading-none mb-4 group-hover/item:text-indigo-600 transition-colors">{proj.title}</h4>
                         <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-indigo-500 transition-colors">
                               <Target className="w-5 h-5" /> <span>Deploy Mission</span>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                       <Search className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No nodes localized in this sector.</p>
                    </div>
                  )}
              </div>
              
              <button 
                onClick={handleInitiateScan} 
                disabled={isScanning}
                className="w-full mt-10 py-6 rounded-[30px] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all outline-none border-none cursor-pointer flex items-center justify-center gap-3 active:scale-95 shadow-xl hover:bg-indigo-600 disabled:opacity-50 disabled:grayscale"
              >
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} 
                {isScanning ? 'Scanning...' : 'Job Request'}
              </button>
           </div>

        </div>
      </div>
      {/* ── MISSION BRIEFING MODAL ────────────────────────────────────────── */}
      {briefingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setBriefingProject(null)} />
           
           <div className="relative bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[95vh] md:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row">
              {/* Left Side: Visual/Category - Hidden on mobile */}
              <div className="hidden md:flex w-full md:w-1/3 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden shrink-0">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[40px]" />
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center mb-8 border border-white/10">
                       {briefingProject.category?.toLowerCase().includes('web') ? <Globe className="text-white w-8 h-8" /> : 
                        briefingProject.category?.toLowerCase().includes('app') ? <Smartphone className="text-white w-8 h-8" /> : 
                        <Brain className="text-white w-8 h-8" />}
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] block mb-2 px-1">Sektor Class</span>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{briefingProject.category}</h4>
                 </div>

                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 bg-white/5 px-3 py-1.5 rounded-full w-fit">
                       <Activity className="w-3 h-3 text-emerald-400" />
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Platform Node: {navigator.platform}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-2 px-1">Node Value</span>
                    <p className="text-3xl font-black text-white tracking-tighter">₹{briefingProject.budget?.toLocaleString()}</p>
                 </div>
              </div>

              {/* Right Side: Content & Actions */}
              <div className="flex-1 p-6 md:p-12 overflow-y-auto no-scrollbar">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <div className="md:hidden flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-widest">{briefingProject.category}</span>
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[8px] font-black uppercase tracking-widest">₹{briefingProject.budget?.toLocaleString()}</span>
                       </div>
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block mb-2">Technical Briefing</span>
                       <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{briefingProject.title}</h3>
                    </div>
                    <button onClick={() => { setBriefingProject(null); setTermsAccepted(false); }} className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 md:bg-transparent rounded-full"><Plus className="w-6 h-6 rotate-45" /></button>
                 </div>

                 <div className="space-y-6 mb-8">
                    <div className="bg-slate-50 rounded-[24px] md:rounded-[30px] p-6 md:p-8 border border-slate-100 max-h-32 md:max-h-40 overflow-y-auto no-scrollbar">
                       <p className="text-slate-500 text-[12px] md:text-sm font-medium leading-relaxed italic">
                          "{briefingProject.description}"
                       </p>
                    </div>

                    {/* Terms & Conditions Sentinel */}
                    <div className="bg-indigo-50/30 p-6 md:p-8 rounded-[24px] md:rounded-[30px] border border-indigo-100/50 flex flex-col">
                       <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Strategic Mission Protocol:</h4>
                       <div className="space-y-3 mb-6 max-h-40 md:max-h-52 overflow-y-auto no-scrollbar pr-2">
                          {[
                            "Confidentiality: I will protect all project secrets and proprietary code.",
                            "Quality: I commit to high-standard deliverables per specifications.",
                            "Timeline: I will adhere strictly to all mission deadlines.",
                            "Communication: I will maintain active, professional communication.",
                            "IP Rights: I acknowledge IP transfer upon final mission settlement.",
                            "Payment: I accept the defined budget and escrow terms.",
                            "Disputes: I will use the platform's resolution process for conflicts.",
                            "No Bypass: I will not communicate or transact outside the platform.",
                            "Professionalism: I will treat all partners with integrity and respect.",
                            "Compliance: I understand that violations result in mission termination."
                          ].map((point, i) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-indigo-600 font-black text-[9px]">{i + 1}.</span>
                              <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{point}</p>
                            </div>
                          ))}
                       </div>
                       <label className="flex items-start gap-4 cursor-pointer group pt-6 border-t border-indigo-100/50">
                          <div className="relative flex items-center justify-center mt-1 shrink-0">
                             <input 
                               type="checkbox" 
                               className="peer appearance-none w-6 h-6 border-2 border-indigo-200 rounded-xl checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                               id="terms-sentinel"
                               onChange={(e) => setTermsAccepted(e.target.checked)}
                             />
                             <CheckCircle className="absolute w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                          </div>
                          <div>
                             <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest block group-hover:text-indigo-600 transition-colors">Confirm Strategic Compliance</span>
                             <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-relaxed">I formally accept the full engagement protocol for this session.</p>
                          </div>
                       </label>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                       <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instant Deploy</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escrow Protected</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <button 
                      onClick={() => setBriefingProject(null)}
                      className="flex-1 py-5 rounded-[22px] bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border-none cursor-pointer"
                    >
                      Decline Mission
                    </button>
                    <button 
                      onClick={() => handleApply(briefingProject._id)}
                      disabled={applyingId || !termsAccepted}
                      className="flex-[2] py-5 rounded-[22px] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed group"
                    >
                      {applyingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className={`w-4 h-4 ${!termsAccepted ? 'text-slate-500' : 'text-amber-400 animate-pulse'}`} /> Initialize Acceptance</>}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentOverview;
