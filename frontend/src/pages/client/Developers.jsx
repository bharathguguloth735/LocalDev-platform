import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Star, Code, ArrowRight, User, X, 
  Github, Linkedin, FileCode2, Zap, Brain, Rocket, 
  CheckCircle, Shield, Globe, Award, Sparkles, Loader2, ArrowLeft
} from 'lucide-react';
import { api } from '../../api.js';
import { useToast } from '../../components/layout/Toast';

const Developers = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [devs, setDevs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDev, setSelectedDev] = useState(null);
  const [inviteDev, setInviteDev] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  // 1. DATA UPLINK
  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id || user?.id;
      
      try {
        const [devData, projectData] = await Promise.all([
          api.getDevelopers(),
          api.getProjects(userId) 
        ]);
        setDevs(Array.isArray(devData) ? devData : []);
        setMyProjects(Array.isArray(projectData) ? projectData.filter(p => !p.developer) : []);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const [inviteMessage, setInviteMessage] = useState('');

  const handleInvite = async () => {
    if (!selectedProject || !inviteDev || !isTermsAccepted) return;
    setInviting(true);
    try {
      await api.sendInvitation({
        projectId: selectedProject,
        developerId: inviteDev._id,
        message: inviteMessage || `Strategic Linkage Request: You have been invited to collaborate on the '${myProjects.find(p => p._id === selectedProject)?.title}' venture.`
      });
      showToast(`STRATEGIC UPLINK: Invitation transmitted to ${inviteDev.name}. Record archived.`, 'success');
      setInviteDev(null);
      setSelectedProject('');
      setInviteMessage('');
      setShowAgreement(false);
    } catch (err) { showToast("Link failure: " + err.message, 'error'); }
    finally { setInviting(false); }
  };

  const filteredDevs = devs.filter(dev => {
    const query = searchQuery.toLowerCase();
    const matchName = dev.name?.toLowerCase().includes(query);
    const matchSkills = dev.profile?.skills?.some(s => s.toLowerCase().includes(query)) || false;
    return matchName || matchSkills;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-20 text-center">
       <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
       <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Scanning Talent Sector...</span>
    </div>
  );

  return (
    <div className="p-4 md:p-12 w-full min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100">
      
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        <button 
          onClick={() => navigate('/client-dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all cursor-pointer border border-slate-100 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Terminal
        </button>

        {/* ── CINEMATIC HEADER ────────────────────────────────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 lg:gap-16 pt-4"
        >
           <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-0.5 w-10 bg-indigo-600 rounded-full" />
                 <span className="text-[9px] font-black uppercase text-indigo-600 tracking-[0.4em]">Talent Intelligence</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] mb-4">Hiring<br/>Protocol</h1>
              <div className="relative max-w-lg group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Technical Node or Name..." 
                    className="w-full pl-14 pr-8 py-5 bg-white border border-slate-100 rounded-[24px] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.12)] focus:border-indigo-600/20 text-xs font-bold placeholder:text-slate-200 outline-none transition-all"
                 />
              </div>
           </div>
           
           <div className="hidden lg:grid grid-cols-2 gap-4 w-full lg:w-[380px]">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-indigo-600 p-5 rounded-[28px] text-white shadow-lg shadow-indigo-600/20 flex flex-col justify-between h-28"
              >
                 <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
                 <div>
                    <h4 className="text-2xl font-black tracking-tighter leading-none mb-0.5">{devs.length}</h4>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Talent Nodes</p>
                 </div>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex flex-col justify-between h-28"
              >
                 <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center"><Brain className="w-4 h-4 text-indigo-600" /></div>
                 <div>
                    <h4 className="text-2xl font-black tracking-tighter leading-none mb-0.5">98%</h4>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Match Velocity</p>
                 </div>
              </motion.div>
           </div>
        </motion.div>

        {/* ── TALENT GRID ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDevs.map(dev => (
              <div key={dev._id} className="bg-white rounded-[40px] border border-white shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] transition-all duration-500 flex flex-col group relative overflow-hidden h-[480px] neural-glow">
                
                {/* Banner Profile */}
                 <div className="p-6 pb-2 flex items-start justify-between relative z-10">
                   <div className="relative">
                      <div className="w-20 h-20 rounded-[28px] border-4 border-slate-50 overflow-hidden shadow-lg group-hover:scale-105 transition-transform bg-slate-100">
                         {dev.profile?.avatar ? (
                           <img src={dev.profile.avatar} alt={dev.name} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300"><User className="w-10 h-10" /></div>
                         )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl"><Star className="w-4 h-4 fill-white" /></div>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Sector: {dev.profile?.university?.split(' ')[0] || 'Remote'}</span>
                      <div className="text-2xl font-black text-slate-900 leading-none">₹{dev.profile?.hourlyRate || 500}</div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Rate</p>
                   </div>
                </div>

                {/* Info Sector */}
                 <div className="px-8 pb-8 flex-1 flex flex-col">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2 mt-4 leading-[0.9]">{dev.name}</h3>
                   <div className="flex flex-wrap gap-1.5 mb-4">
                      {(dev.profile?.skills || ['Engineering', 'Design', 'Strategy']).slice(0, 3).map((s, i) => (
                        <span key={i} className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-full border border-slate-100">{s}</span>
                      ))}
                      {dev.profile?.skills?.length > 3 && <span className="text-slate-200 font-bold ml-2">+{dev.profile.skills.length - 3} More</span>}
                   </div>
                   <p className="text-slate-400 text-xs font-medium leading-relaxed italic line-clamp-3 mb-10">"{dev.profile?.bio || 'High-velocity developer focused on technical parity and mission success.'}"</p>
                   
                   <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button 
                        onClick={() => setSelectedDev(dev)}
                        className="py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-slate-100 transition-all border-none cursor-pointer outline-none"
                      >
                         Dossier
                      </button>
                      <button 
                        onClick={() => setInviteDev(dev)}
                        className="py-4 bg-slate-950 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-indigo-600 transition-all border-none cursor-pointer outline-none shadow-xl shadow-black/10 flex items-center justify-center gap-2 relative overflow-hidden group"
                      >
                         <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 animate-pulse pointer-events-none" />
                         Invite <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>

      </div>

      {/* ── STRATEGIC INVITATION TERMINAL (MODAL) ───────────────────────────── */}
      <AnimatePresence>
        {inviteDev && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
              onClick={() => setInviteDev(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[48px] p-8 relative z-10 shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] border border-white/50"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Hiring Link</h2>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Sector Access: {inviteDev.name}</p>
                  </div>
                </div>
                <button onClick={() => setInviteDev(null)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all cursor-pointer border-none outline-none">
                  <X className="w-4 h-4"/>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Select Project Node</label>
                    <span className="text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Sector A-1</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                    {myProjects.length === 0 ? (
                      <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase italic mb-4">No open ventures found.</p>
                        <button onClick={() => navigate('/post-project')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest underline cursor-pointer bg-transparent border-none outline-none">Deploy New Project</button>
                      </div>
                    ) : (
                      myProjects.map((p, i) => (
                        <motion.label 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={p._id} 
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedProject === p._id ? 'border-indigo-600 bg-indigo-50/20 shadow-md' : 'border-slate-50 hover:border-slate-100 bg-white'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input type="radio" name="project" value={p._id} checked={selectedProject === p._id} onChange={() => setSelectedProject(p._id)} className="w-4 h-4 accent-indigo-600" />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[140px]">{p.title}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Architecture: {p.category}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-indigo-600">₹{(p.budget || 0).toLocaleString()}</span>
                        </motion.label>
                      ))
                    )}
                  </div>
                </div>

                {/* New Feature: Invitation Message */}
                <div>
                   <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Link Message (Optional)</label>
                   <textarea 
                     value={inviteMessage}
                     onChange={(e) => setInviteMessage(e.target.value)}
                     placeholder="Specify custom mission parameters or sector requirements..."
                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-medium text-slate-600 focus:border-indigo-600/20 focus:bg-white transition-all outline-none resize-none h-20 placeholder:text-slate-300"
                   />
                </div>

                <div className="bg-slate-950 p-6 rounded-[32px] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl" />
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                       <Shield className="w-3.5 h-3.5 text-emerald-500" />
                       <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Escrow Secured</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                       <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">94% Match Probability</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowAgreement(true)}
                    disabled={!selectedProject || inviting}
                    className="w-full py-4 bg-indigo-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all disabled:opacity-20 active:scale-95 border-none outline-none cursor-pointer flex items-center justify-center gap-3"
                  >
                    {inviting ? (
                      <>Transmitting... <Loader2 className="w-4 h-4 animate-spin" /></>
                    ) : (
                      <>Transmit Invitation <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <p className="mt-4 text-[7px] text-center font-black text-white/20 uppercase tracking-[0.2em]">Strategic Uplink Subject to Terms</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── AGREEMENT MODAL (STRICT 10 POINTS) ───────────────────────────────── */}
      <AnimatePresence>
        {showAgreement && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
              onClick={() => setShowAgreement(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[48px] p-10 relative z-10 shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] border border-white/50 max-h-[90vh] flex flex-col"
            >
              <div className="flex flex-col items-center text-center mb-8 shrink-0">
                <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-600/20">
                  <Shield className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Strategic Linkage Agreement</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Protocol & Engagement Terms</p>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 rounded-[32px] p-8 border border-slate-100 mb-8 text-left">
                 <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 underline underline-offset-8">Mandatory Clauses:</h4>
                 <div className="space-y-5 mb-8">
                    {[
                      "Communication Parity: I will maintain all project-related discourse within the platform's secure channels.",
                      "Specification Integrity: I confirm that the project parameters provided are accurate and complete.",
                      "Financial Commitment: I acknowledge that hiring involves a secure escrow funding process.",
                      "Confidentiality: I will respect the developer's privacy and maintain confidentiality of their personal details.",
                      "IP Ownership: I understand that intellectual property rights are secured only upon verified final settlement.",
                      "Feedback Accuracy: I commit to providing objective and professional reviews based on mission performance.",
                      "No Circumvention: I will not propose or accept external payment methods to bypass platform protocols.",
                      "Audit Readiness: I understand that all interactions are logged for quality assurance and dispute resolution.",
                      "Professionalism: I will treat the student developer as a professional partner with respect and integrity.",
                      "Data Protection: I will not share proprietary business data unless protected by the platform's standard NDA."
                    ].map((point, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="text-indigo-600 font-black text-[11px] leading-none pt-1">{i + 1}.</span>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{point}</p>
                      </div>
                    ))}
                 </div>

                 <label className="flex items-start gap-4 cursor-pointer group pt-6 border-t border-slate-200">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-6 h-6 rounded-lg border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer"
                      onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    />
                    <span className="text-[11px] text-slate-700 font-black leading-relaxed uppercase tracking-tight">
                       I formally accept all 10 clauses of the <span className="text-indigo-600">Strategic Engagement Protocol</span>.
                    </span>
                 </label>
              </div>

              <div className="flex gap-4 shrink-0">
                 <button onClick={() => setShowAgreement(false)} className="flex-1 py-5 rounded-2xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all border-none">Decline Access</button>
                 <button 
                   onClick={handleInvite}
                   disabled={!isTermsAccepted || inviting}
                   className="flex-[2] py-5 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-20 flex items-center justify-center gap-3 border-none"
                 >
                   {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket className="w-4 h-4" /> Transmit Strategic Invitation</>}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Modal - Simplified & Cinematic */}
      {selectedDev && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setSelectedDev(null)} />
           <div className="bg-white w-full max-w-4xl rounded-[80px] overflow-hidden relative z-10 shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] flex flex-col md:flex-row h-[700px]">
              
              <div className="w-full md:w-[400px] bg-indigo-600 p-12 text-white flex flex-col items-center justify-center text-center relative overflow-hidden">
                 <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                 </div>
                 <div className="w-48 h-48 rounded-[60px] border-8 border-white/10 overflow-hidden shadow-2xl mb-8">
                    <img src={selectedDev.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedDev.name}`} className="w-full h-full object-cover" />
                 </div>
                 <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-4">{selectedDev.name}</h2>
                 <div className="px-6 py-2 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 mb-10">Student Developer Node</div>
                 <div className="grid grid-cols-2 gap-6 w-full mt-auto pt-10 border-t border-white/5">
                    <div>
                       <span className="text-[8px] font-black uppercase opacity-60 block mb-1">Reputation</span>
                       <span className="text-2xl font-black">{selectedDev.profile?.rating?.toFixed(1) || '5.0'}</span>
                    </div>
                    <div>
                       <span className="text-[8px] font-black uppercase opacity-60 block mb-1">Success</span>
                       <span className="text-2xl font-black">100%</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-16 overflow-y-auto no-scrollbar relative">
                 <button onClick={() => setSelectedDev(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all cursor-pointer border-none outline-none"><X className="w-6 h-6"/></button>
                 
                 <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-12">Intelligence Dossier</h3>
                 
                 <div className="space-y-16">
                    <div>
                       <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-4">
                          <Code className="w-6 h-6 text-indigo-600" /> Core Specialization
                       </h4>
                       <div className="flex flex-wrap gap-3">
                          {selectedDev.profile?.skills?.map((s, i) => (
                            <span key={i} className="px-6 py-3 bg-slate-50 text-slate-900 text-[10px] font-black uppercase rounded-2xl border border-slate-100">{s}</span>
                          )) || <span className="text-slate-200 uppercase font-black">No nodes registered</span>}
                       </div>
                    </div>

                    <div>
                       <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-6 flex items-center gap-4">
                          <Brain className="w-6 h-6 text-emerald-500" /> Bio
                       </h4>
                       <p className="text-slate-500 text-sm font-medium leading-[1.8] italic bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                          {selectedDev.profile?.bio || "No summary found in master records."}
                       </p>
                    </div>

                    <div className="flex gap-4">
                       <button onClick={() => { setSelectedDev(null); setInviteDev(selectedDev); }} className="flex-1 bg-slate-950 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-600 transition-all shadow-2xl active:scale-95 border-none outline-none cursor-pointer">
                          Initiate Invitation
                       </button>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default Developers;
