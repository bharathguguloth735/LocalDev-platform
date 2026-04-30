import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Trash2, Shield, Search, Filter, 
  ArrowUpDown, Loader2, Download, Plus,
  Layers, Rocket, Clock, DollarSign,
  ChevronRight, ArrowUpRight, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { api } from '../../api';
import ProjectModal from './ProjectModal';
import TerminationModal from './TerminationModal';

/**
 * ADMIN PROJECT REGISTRY (v5.0)
 * - Strategic venture monitoring.
 * - Global project lifecycle management.
 * - Premium command interface.
 */
const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', client: '', budget: '', status: 'Pending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, in_progress, review, completed
  
  // Deletion State
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  const statusStyles = {
    pending: 'bg-slate-50 text-slate-500 border-slate-200',
    in_progress: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    review: 'bg-amber-50 text-amber-600 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const created = await api.createProject(newProject);
      setProjects([...projects, created]);
      setIsModalOpen(false);
      setNewProject({ title: '', client: '', budget: '', status: 'Pending' });
    } catch (e) {
      alert('Failed to initialize venture protocol.');
    }
  };

  const executeDelete = async () => {
    const id = deleteModal.id;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
      setDeleteModal({ open: false, id: null, name: '' });
    } catch (e) {
      alert('Termination protocol failed.');
    }
  };

  const handleDeleteTrigger = (id, name) => {
    setDeleteModal({ open: true, id, name });
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const statusStyles = {
    pending: 'bg-slate-100 text-slate-500 border-slate-200',
    in_progress: 'bg-blue-100 text-blue-600 border-blue-200',
    review: 'bg-amber-100 text-amber-600 border-amber-200',
    completed: 'bg-emerald-100 text-emerald-600 border-emerald-200'
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Accessing Venture Registry...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 md:p-12 max-w-7xl mx-auto w-full animate-[fade-in_0.5s]">
        {/* ── HEADER ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
             <div className="flex items-center gap-3 mb-3">
               <div className="h-[2px] w-12 bg-rose-600 rounded-full" />
               <span className="text-[11px] font-black uppercase text-rose-600 tracking-[0.4em]">Venture Operations</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">Registry</span></h1>
             <p className="text-slate-400 text-sm font-medium mt-4 uppercase tracking-widest">Tracking <span className="text-slate-900 font-black">{projects.length}</span> active cloud ventures in sector.</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-10 py-5 rounded-[22px] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-rose-600 transition-all flex items-center gap-3 active:scale-95"
          >
             <Plus className="w-4 h-4" /> Initialize New Venture
          </button>
        </div>

        {/* ── FILTERS & SEARCH ────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 p-4 rounded-[32px] md:rounded-[45px] shadow-sm mb-10 flex flex-col md:flex-row gap-4">
           <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {[
                { id: 'all', label: 'All Ventures', icon: <Layers size={14}/> },
                { id: 'in_progress', label: 'In Progress', icon: <Rocket size={14}/> },
                { id: 'review', label: 'Audit Stage', icon: <Clock size={14}/> },
                { id: 'completed', label: 'Completed', icon: <CheckCircle2 size={14}/> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-none outline-none
                  ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
           </div>
           <div className="md:w-80 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search ventures..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 transition-all outline-none"
              />
           </div>
        </div>

        {/* ── PROJECT GRID / TABLE ────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 border-b border-slate-50">
                    <tr>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Venture Title</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Entity</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Capital Flow</th>
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Lifecycle Status</th>
                       <th className="p-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Management</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                       {filteredProjects.map((p, idx) => (
                          <motion.tr 
                            key={p._id || idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/50 transition-all group cursor-default"
                          >
                             <td className="p-8">
                                <div>
                                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{p.title}</h4>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hash: {p._id.slice(-8).toUpperCase()}</p>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                      <Shield size={12} className="text-slate-400" />
                                   </div>
                                   <span className="text-sm font-bold text-slate-600">{p.client?.name || 'External Agency'}</span>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="flex items-center gap-1.5 text-slate-900 font-black">
                                   <span className="text-[10px] text-slate-300">₹</span>
                                   {(p.budget || 0).toLocaleString()}
                                </div>
                             </td>
                             <td className="p-8">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${statusStyles[p.status?.toLowerCase()] || statusStyles.pending}`}>
                                   {p.status === 'in_progress' ? <Rocket size={10}/> : p.status === 'review' ? <AlertTriangle size={10}/> : <CheckCircle2 size={10}/>}
                                   {p.status || 'Archived'}
                                </span>
                             </td>
                             <td className="p-8 text-right">
                                <div className="flex justify-end gap-2">
                                   <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all border-none outline-none cursor-pointer">
                                      <ArrowUpRight className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => handleDeleteTrigger(p._id, p.title)}
                                     className="p-3 bg-rose-50 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all border-none outline-none cursor-pointer"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             </td>
                          </motion.tr>
                       ))}
                    </AnimatePresence>
                    {filteredProjects.length === 0 && (
                       <tr>
                          <td colSpan="5" className="p-20 text-center">
                             <div className="flex flex-col items-center gap-4 opacity-30">
                                <Briefcase size={48} className="text-slate-300" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No projects recorded in this registry.</p>
                             </div>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={newProject}
        setProject={setNewProject}
        onSubmit={handleCreateProject}
      />

      <TerminationModal 
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={executeDelete}
        itemName={deleteModal.name}
        itemType="Venture"
      />
    </>
  );
};

export default AdminProjects;
