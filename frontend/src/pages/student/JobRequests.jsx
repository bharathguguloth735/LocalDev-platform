import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Building2, MapPin, DollarSign, Clock, ArrowRight, CheckCircle, Loader2, Search, Filter, Globe, Smartphone, Brain, Sparkles, MousePointer2, Zap, Send, Hourglass, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api.js';
import { socket } from '../../socket.js';
import { useToast } from '../../components/layout/Toast';

const JobRequests = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [applyingTo, setApplyingTo] = useState(null);
  const [isApplyingConfirmed, setIsApplyingConfirmed] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser?._id || currentUser?.id || 'me';

  const fetchJobs = useCallback(async () => {
    try {
      const data = await api.getProjects();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    
    const handleNewProject = (project) => {
      setJobs(prev => {
        if (prev.find(p => p._id === project._id)) return prev;
        return [project, ...prev];
      });
      showToast('NEW MISSION DETECTED: A new opportunity has been localized on the grid.', 'success');
    };

    socket.on('project:created', handleNewProject);
    return () => socket.off('project:created', handleNewProject);
  }, [fetchJobs, showToast]);

  const handleApply = (projectId) => {
    setApplyingTo(projectId);
    setIsTermsAccepted(false);
    setIsApplyingConfirmed(false);
  };

  const handleConfirmApply = async () => {
    if (!applyingTo || !isTermsAccepted) return;
    const projectId = applyingTo;
    setIsApplyingConfirmed(true);
    try {
      await api.applyToProject(projectId);
      await fetchJobs();
      setApplyingTo(null);
    } catch (err) {
      alert(err.message || 'Action failed.');
    } finally {
      setIsApplyingConfirmed(false);
    }
  };

  const getCategoryTheme = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('web')) return { icon: <Globe className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50', bloom: 'shadow-blue-500/10' };
    if (cat.includes('app')) return { icon: <Smartphone className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50', bloom: 'shadow-indigo-500/10' };
    return { icon: <Brain className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50', bloom: 'shadow-purple-500/10' };
  };

  const availableCategories = [...new Set(jobs.map(j => j.category).filter(Boolean))];

  const filteredJobs = jobs.filter(job => {
    // Exclude projects the user has already applied to or is hired for
    const hasEngaged = job.applicants?.some(a => (a?._id || a)?.toString() === currentUserId?.toString()) || 
                      (job.developer?._id || job.developer)?.toString() === currentUserId?.toString();
    
    if (hasEngaged) return false;

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(job.category);
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && job.status === 'open';
  });

  return (
    <div className="p-10 max-w-7xl mx-auto w-full min-h-screen bg-transparent">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
             <div className="h-[2px] w-8 bg-indigo-600 rounded-full" />
             <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Live Opportunity Feed</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight font-heading uppercase"
          >
            Job Request
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500 font-medium mt-1">
             Deploy your skills on verified local business projects.
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search keywords, tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-[30px] pl-14 pr-6 py-5 font-black text-sm outline-none shadow-sm focus:border-indigo-500 focus:shadow-2xl focus:shadow-indigo-500/5 transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-3 pb-20 order-1 lg:order-none">
          <div className="grid gap-8">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, idx) => {
                const theme = getCategoryTheme(job.category);
                const hasApplied = job.applicants?.some(a => {
                  const applicantId = a?._id || a;
                  return applicantId?.toString() === currentUserId?.toString();
                });
                const isApplying = applyingTo === job._id;

                return (
                  <motion.div 
                    layout
                    key={job._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8 }}
                    className={`bg-white rounded-[50px] p-10 border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] ${theme.bloom} transition-all group relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-bl-full -z-0 opacity-40 group-hover:scale-110 transition-transform" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-6">
                           <div className={`p-4 rounded-2xl ${theme.bg} ${theme.color} shadow-inner`}>{theme.icon}</div>
                           <div>
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{job.category}</span>
                              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase mt-1 group-hover:text-indigo-600 transition-all">{job.title}</h3>
                           </div>
                        </div>

                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 max-w-2xl line-clamp-2">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-8">
                           <div className="flex items-center gap-2.5">
                              <Building2 className="w-5 h-5 text-slate-300" />
                              <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em]">{job.client?.name || 'Local Business'}</span>
                           </div>
                           <div className="flex items-center gap-2.5">
                              <DollarSign className="w-5 h-5 text-emerald-500" />
                              <span className="text-xl font-black text-slate-900 tracking-tighter">₹{job.budget?.toLocaleString()}</span>
                           </div>
                           <div className="flex items-center gap-2.5">
                              <Clock className="w-5 h-5 text-slate-300" />
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Mission</span>
                           </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center md:flex-col justify-center gap-4">
                        {/* Status Check for Hired projects */}
                        {job.developer?._id === currentUserId || job.developer === currentUserId ? (
                          <button 
                            onClick={() => window.location.href = `/student-dashboard/track/${job._id}`}
                            className={`w-full md:w-56 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95
                              ${job.status === 'review' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                job.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-600/20'}`}
                          >
                            {job.status === 'review' ? <Hourglass className="w-4 h-4 animate-pulse" /> : 
                             job.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : 
                             <Send className="w-4 h-4" />}
                            
                            {job.status === 'review' ? 'In Audit Phase' : 
                             job.status === 'completed' ? 'Valid Credential' : 
                             'Manage Delivery'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleApply(job._id)} 
                            disabled={hasApplied || isApplying}
                            className={`w-full md:w-56 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:scale-95 disabled:opacity-80
                              ${hasApplied 
                                 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-emerald-500/10' 
                                 : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-600/20'}`}
                          >
                            {isApplying ? <Loader2 className="w-4 h-4 animate-spin"/> : hasApplied ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-white" />}
                            {isApplying ? 'Engaging...' : hasApplied ? 'Enlistment Finalized' : 'Accept Mission'}
                          </button>
                        )}
                        {!hasApplied && !job.developer && <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Instant Approval Available</p>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* AGREEMENT MODAL SENTINEL */}
            <AnimatePresence>
               {applyingTo && !isApplyingConfirmed && (
                  <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6">
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setApplyingTo(null)} />
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full" />
                        <div className="relative z-10 flex flex-col items-center text-center flex-1 overflow-hidden">
                           <div className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-500/10 shrink-0"><ShieldCheck className="w-8 h-8" /></div>
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Venture Agreement</h3>
                           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Service Level Compliance & Escrow Protection</p>
                           
                           <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100 text-left overflow-y-auto no-scrollbar w-full">
                              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Strict Terms of Engagement:</h4>
                              <div className="space-y-4 mb-6">
                                 {[
                                   "Confidentiality: I agree to keep all project details, including proprietary code and business strategies, strictly confidential.",
                                   "Quality Standards: I commit to delivering high-quality work that meets the specifications outlined in the project description.",
                                   "Timeline Compliance: I understand that deadlines are critical and agree to deliver milestones on or before scheduled dates.",
                                   "Communication: I will maintain professional and timely communication throughout the duration of the project.",
                                   "Intellectual Property: I acknowledge that upon final payment, all IP rights for work delivered will be transferred to the client.",
                                   "Payment Terms: I agree to the budget and payment milestones as defined in the mission parameters.",
                                   "Dispute Resolution: I agree to engage in the platform's formal dispute resolution process for any disagreements.",
                                   "No Circumvention: I will not attempt to bypass the platform's payment or communication systems.",
                                   "Professional Conduct: I will maintain a professional demeanor and treat all parties with respect.",
                                   "Termination: I understand that failure to adhere to these terms may result in mission termination and account suspension."
                                 ].map((point, i) => (
                                   <div key={i} className="flex gap-3">
                                     <span className="text-indigo-600 font-black text-[10px]">{i + 1}.</span>
                                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{point}</p>
                                   </div>
                                 ))}
                              </div>

                              <label className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-slate-200">
                                 <input 
                                   type="checkbox" 
                                   className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                                   id="agreement-sentinel"
                                   onChange={(e) => setIsTermsAccepted(e.target.checked)}
                                 />
                                 <span className="text-[11px] text-slate-600 font-bold leading-relaxed">
                                    I have read and agree to all 10 points of the <span className="text-indigo-600 font-black">Strategic Mission Protocol</span>. I understand this is a legally binding commitment.
                                 </span>
                              </label>
                           </div>

                           <div className="flex gap-4 w-full shrink-0">
                              <button onClick={() => setApplyingTo(null)} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border-none">Decline</button>
                              <button 
                                onClick={() => handleConfirmApply()}
                                disabled={!isTermsAccepted}
                                className="flex-[2] py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-20 flex items-center justify-center gap-2 border-none"
                              >
                                {isApplyingConfirmed ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 fill-amber-400" /> Accept & Deploy</>}
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>

            {filteredJobs.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[50px] p-32 text-center">
                 <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-8"><Filter className="w-12 h-12 text-slate-200" /></div>
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">No Matching Missions</h3>
                 <p className="text-slate-400 font-bold mt-2">Adjust your refinements or search query to scout for new missions.</p>
                 <button onClick={() => { setSelectedCategories([]); setSearchQuery(''); }} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95">Reset Radar</button>
              </motion.div>
            )}

            {loading && (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              </div>
            )}
          </div>
        </div>

        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-8 order-2 lg:order-none">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.1)] sticky top-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-40" />
            <div className="relative z-10">
              <h3 className="font-black font-heading text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <Filter className="w-5 h-5 text-indigo-600" /> Refinement
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-4 group cursor-pointer">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedCategories.length === 0 ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/20' : 'border-slate-100 group-hover:border-indigo-300'}`}>
                    {selectedCategories.length === 0 && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={selectedCategories.length === 0} onChange={() => setSelectedCategories([])} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${selectedCategories.length === 0 ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>Global Feed</span>
                </label>

                {availableCategories.map(cat => {
                   const isActive = selectedCategories.includes(cat);
                   return (
                    <label key={cat} className="flex items-center gap-4 group cursor-pointer">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isActive ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/20' : 'border-slate-100 group-hover:border-indigo-300'}`}>
                        {isActive && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input 
                        type="checkbox" className="hidden" 
                        checked={isActive} 
                        onChange={() => setSelectedCategories(prev => isActive ? prev.filter(c => c !== cat) : [...prev, cat])} 
                      />
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{cat}</span>
                    </label>
                   );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobRequests;
