import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Clock, CheckCircle, ArrowRight, 
  Search, Filter, Send, Hourglass, Activity, 
  Smartphone, Globe, Brain, Rocket, ChevronRight,
  Target, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { socket } from '../../socket.js';
import { useToast } from '../../components/layout/Toast';
import ProjectCard from '../../components/dashboard/ProjectCard';

const MyProjects = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?._id || user?.id;

  const fetchMyMissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      const safeData = Array.isArray(data) ? data : [];
      
      // Filter for projects where the user is either the hired developer or has an active application
      const myMissions = safeData.filter(p => {
        const isDev = (p.developer?._id || p.developer)?.toString() === userId?.toString();
        const isApplicant = p.applicants?.some(a => (a?._id || a)?.toString() === userId?.toString());
        return isDev || isApplicant;
      });

      setProjects(myMissions);
    } catch (err) {
      console.error(err);
      showToast('Neural Uplink Failure: Could not sync mission dossier.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, userId]);

  useEffect(() => {
    fetchMyMissions();
    
    // Listen for project updates
    socket.on('project:updated', fetchMyMissions);
    socket.on('project:phase_submitted', fetchMyMissions);
    
    return () => {
      socket.off('project:updated', fetchMyMissions);
      socket.off('project:phase_submitted', fetchMyMissions);
    };
  }, [fetchMyMissions]);

  const filteredMissions = projects.filter(p => {
    if (filter === 'active') return p.status !== 'completed';
    if (filter === 'completed') return p.status === 'completed';
    return true;
  });

  const getCategoryTheme = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('web')) return { icon: <Globe className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' };
    if (cat.includes('app')) return { icon: <Smartphone className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-50' };
    return { icon: <Brain className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' };
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-12 h-12 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Intelligence...</span>
      </div>
    </div>
  );

  return (
    <div className="p-10 max-w-7xl mx-auto w-full min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-12 bg-indigo-600 rounded-full" />
              <span className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.3em]">Sector: My Missions</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">Project Ledger</h1>
           <p className="text-slate-400 text-xl font-medium max-w-lg">Tracking your active engagements and validated historical credentials.</p>
        </div>

        <div className="flex bg-white border border-slate-100 p-2 rounded-[24px] shadow-sm">
           {['all', 'active', 'completed'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all
               ${filter === f ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-10">
        <AnimatePresence mode="popLayout">
           {filteredMissions.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 border-4 border-dashed border-slate-100 rounded-[60px] p-32 text-center">
                <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-8"><Briefcase className="w-12 h-12 text-slate-200" /></div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Zero Missions Localized</h3>
                <p className="text-slate-400 font-bold mt-2">You haven't accepted any missions in this sector yet.</p>
                <button onClick={() => navigate('/student-dashboard/explore')} className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95">Job Request</button>
             </motion.div>
           ) : (
             filteredMissions.map((p, idx) => {
               const theme = getCategoryTheme(p.category);
               const isHired = (p.developer?._id || p.developer)?.toString() === userId?.toString();
               
               return (
                 <ProjectCard 
                   key={p._id}
                   project={p}
                   isHired={isHired}
                   theme={theme}
                   onTrack={() => isHired ? navigate(`/student-dashboard/track/${p._id}`) : showToast('Mission synchronization pending client acceptance.', 'info')}
                   onMessage={() => navigate(`/student-dashboard/messages?userId=${p.client?._id || p.client}`)}
                 />
               );
             })
           )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyProjects;
