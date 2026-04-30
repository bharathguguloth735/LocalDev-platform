import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Search, Filter, Trash2, 
  CheckCircle2, Clock, ShieldCheck, 
  ExternalLink, Download, Loader2,
  Plus, Users, Briefcase
} from 'lucide-react';
import { api } from '../../api';

/**
 * ADMIN CERTIFICATE PROTOCOL (v5.0)
 * - Credential verification & issuance hub.
 * - Global skill validation registry.
 */
const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, verified, pending

  useEffect(() => {
    // In a real app, we'd fetch from an endpoint. For now, we simulate or fetch if exists.
    const fetchCerts = async () => {
      setLoading(true);
      try {
        // Assuming api.getCertificates exists or we use users' certifications
        const data = await api.getAllUsers();
        // Extract certifications from users for demonstration
        const allCerts = data.flatMap(u => (u.profile?.certifications || []).map(c => ({
          ...c,
          userName: u.name,
          userId: u._id,
          userRole: u.role
        })));
        
        // If empty, add mock data for the premium experience
        if (allCerts.length === 0) {
            setCertificates([
                { id: 'CERT-901', name: 'Master Fullstack Developer', userName: 'Sarah Chen', issueDate: '2026-04-12', status: 'verified', provider: 'LocalDev Academy' },
                { id: 'CERT-902', name: 'Neural Engine Architect', userName: 'Alex Rivers', issueDate: '2026-04-15', status: 'pending', provider: 'AI Systems Lab' },
                { id: 'CERT-903', name: 'Cloud Infrastructure Lead', userName: 'Jordan Smith', issueDate: '2026-04-18', status: 'verified', provider: 'Cloud Native Foundation' },
                { id: 'CERT-904', name: 'Blockchain Security Expert', userName: 'Maria Garcia', issueDate: '2026-04-20', status: 'verified', provider: 'Security Protocol Inc' },
            ]);
        } else {
            setCertificates(allCerts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const filteredCerts = certificates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Credential Ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full animate-[fade-in_0.5s]">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-3">
             <div className="h-[2px] w-12 bg-emerald-600 rounded-full" />
             <span className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.4em]">Credential Verification</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Certificates</span></h1>
           <p className="text-slate-400 text-[10px] md:text-xs font-black mt-4 uppercase tracking-widest leading-relaxed">Auditing <span className="text-slate-900">{certificates.length}</span> issued credentials across the neural network.</p>
        </div>

        <button className="bg-slate-900 text-white px-10 py-5 rounded-[22px] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-3 active:scale-95">
           <Plus className="w-4 h-4" /> Authorize New Credential
        </button>
      </div>

      {/* ── FILTERS ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 p-4 rounded-[32px] md:rounded-[45px] shadow-sm mb-10 flex flex-col md:flex-row gap-4">
         <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All Protocols', icon: <ShieldCheck size={14}/> },
              { id: 'verified', label: 'Verified', icon: <CheckCircle2 size={14}/> },
              { id: 'pending', label: 'Audit Stage', icon: <Clock size={14}/> }
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
              placeholder="Search credentials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
         </div>
      </div>

      {/* ── CERTIFICATE GRID ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCerts.map((cert, idx) => (
            <motion.div
              key={cert.id || idx}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <Award size={28} />
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border
                  ${cert.status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}`}>
                  {cert.status}
                </span>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight line-clamp-1">{cert.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Provider: {cert.provider || 'Internal Registry'}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${cert.userName}&backgroundColor=10b981`} alt="" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{cert.userName}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Issued: {cert.issueDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all border-none outline-none">
                      <Download size={14} />
                    </button>
                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-emerald-600 hover:text-white transition-all border-none outline-none">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCerts.length === 0 && (
        <div className="py-32 flex flex-col items-center gap-6 opacity-30">
          <Award size={64} className="text-slate-300" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center leading-relaxed">
            No credential protocols detected<br/>in the current filtered sector.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
