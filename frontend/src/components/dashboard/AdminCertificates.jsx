import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Search, Filter, Trash2, 
  CheckCircle2, Clock, ShieldCheck, 
  ExternalLink, Download, Loader2,
  Plus, Users, Briefcase, AlertTriangle
} from 'lucide-react';
import { api } from '../../api';

/**
 * ADMIN CERTIFICATE PROTOCOL (v5.0)
 * - Credential verification & issuance hub.
 * - Global skill validation registry.
 */
const AdminCertificates = () => {
  const [issuedCerts, setIssuedCerts] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, verified, pending
  const [issuing, setIssuing] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issued, pending] = await Promise.all([
        api.getCertificates(),
        api.getPendingCertificates()
      ]);
      setIssuedCerts(issued);
      setPendingProjects(pending);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (projectId) => {
    setIssuing(projectId);
    try {
      await api.issueCertificate(projectId);
      await fetchData(); // Refresh
      alert('Certificate Authorized Successfully!');
    } catch (e) {
      alert('Issuance Failed: ' + e.message);
    } finally {
      setIssuing(null);
    }
  };

  const filteredIssued = issuedCerts.filter(c => {
    const matchesSearch = c.projectId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredPending = pendingProjects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.developer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
           <p className="text-slate-400 text-[10px] md:text-xs font-black mt-4 uppercase tracking-widest leading-relaxed">
             Authorized Personnel can now validate completed ventures and issue official credentials.
           </p>
        </div>
      </div>

      {/* ── SEARCH ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 p-4 rounded-[32px] md:rounded-[45px] shadow-sm mb-10">
         <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by student or venture name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
         </div>
      </div>

      {/* ── PENDING AUTHORIZATION ───────────────────────────────────────────── */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <Clock className="text-amber-500 w-5 h-5" />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Pending Authorization <span className="ml-2 text-slate-300">({filteredPending.length})</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPending.map((p) => (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-slate-100 rounded-[35px] p-8 shadow-sm hover:shadow-xl transition-all border-l-[6px] border-l-amber-500"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <AlertTriangle size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-50 px-3 py-1 rounded-full">Completed</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{p.title}</h3>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">
                    {p.developer?.name?.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{p.developer?.name}</span>
                </div>
                <button 
                  onClick={() => handleIssue(p._id)}
                  disabled={issuing === p._id}
                  className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  {issuing === p._id ? 'Authorizing...' : 'Authorize Certificate'}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── ISSUED REGISTRY ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <ShieldCheck className="text-emerald-500 w-5 h-5" />
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Issued Credentials <span className="ml-2 text-slate-300">({filteredIssued.length})</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredIssued.map((cert) => (
              <motion.div
                key={cert._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <Award size={28} />
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 mb-2">Verified</span>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">#{cert.certificateNumber}</span>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{cert.projectId?.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Specialization: {cert.projectId?.category || 'Neural Engineering'}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white text-[10px] font-black">
                        {cert.studentId?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{cert.studentId?.name}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {(filteredPending.length === 0 && filteredIssued.length === 0) && (
        <div className="py-32 flex flex-col items-center gap-6 opacity-30">
          <Award size={64} className="text-slate-300" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center leading-relaxed">
            No credential protocols detected<br/>in the current sector.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
