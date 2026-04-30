import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Search, ArrowUpRight, ArrowDownLeft, 
  AlertCircle, CheckCircle2, RotateCcw, 
  ShieldAlert, Send, FileText, Loader2, DollarSign
} from 'lucide-react';
import { api } from '../../api';

/**
 * ADMIN PAYMENTS CONSOLE (v6.0)
 * - Global Ledger Monitoring.
 * - Manual Student Remittance.
 * - Dispute & Repayment Management.
 */
const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, escrow, released, failed, pending_repayment

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, paymentId, projectId) => {
    try {
      if (action === 'release') {
        if(!projectId) return alert("Missing Project ID");
        await api.releasePayment(projectId);
      } else if (action === 'fail') {
        await api.markPaymentFailed(paymentId);
      } else if (action === 'repay') {
        await api.requestRepayment(paymentId);
      }
      await fetchPayments();
    } catch (e) {
      alert(`Action failed: ${e.message}`);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.projectId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusConfig = (status) => {
    switch(status) {
      case 'released': return { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: <CheckCircle2 size={14}/>, text: 'Cleared' };
      case 'escrow': return { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: <ShieldAlert size={14}/>, text: 'In Escrow' };
      case 'failed': return { color: 'text-rose-500', bg: 'bg-rose-50', icon: <AlertCircle size={14}/>, text: 'Failed' };
      case 'pending_repayment': return { color: 'text-amber-500', bg: 'bg-amber-50', icon: <RotateCcw size={14}/>, text: 'Repayment Req.' };
      default: return { color: 'text-slate-500', bg: 'bg-slate-50', icon: <FileText size={14}/>, text: status };
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-6">
           <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Global Ledger...</span>
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
             <span className="text-[11px] font-black uppercase text-emerald-600 tracking-[0.4em]">Financial Oversight</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Ledger <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Control</span></h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-slate-100 p-2 rounded-3xl shadow-sm">
           {['all', 'escrow', 'released', 'failed', 'pending_repayment'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
               }`}
             >
               {tab.replace('_', ' ')}
             </button>
           ))}
        </div>
      </div>

      {/* ── SEARCH ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 p-4 rounded-[32px] md:rounded-[45px] shadow-sm mb-10">
         <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by Transaction ID, Venture, Client, or Student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
         </div>
      </div>

      {/* ── TRANSACTIONS LIST ─────────────────────────────────────────────── */}
      <div className="space-y-4">
         <AnimatePresence mode="popLayout">
            {filteredPayments.map((p) => {
               const config = getStatusConfig(p.status);
               
               return (
                 <motion.div
                   layout
                   key={p._id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="bg-white border border-slate-100 rounded-[35px] p-6 md:p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                 >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                       
                       {/* Transaction Info */}
                       <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white ${p.type === 'withdrawal' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             {p.type === 'withdrawal' ? <ArrowUpRight size={24}/> : <ArrowDownLeft size={24}/>}
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="flex items-center gap-3 mb-1">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${config.bg} ${config.color}`}>
                                  {config.icon} {config.text}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-slate-400">{p.transactionId}</span>
                             </div>
                             <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">
                               {p.projectId?.title || (p.type === 'withdrawal' ? 'Capital Withdrawal' : 'Direct Deposit')}
                             </h4>
                             <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                   <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">C</div>
                                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[100px]">{p.clientId?.name || 'Platform'}</span>
                                </div>
                                <ArrowUpRight size={12} className="text-slate-300" />
                                <div className="flex items-center gap-1.5">
                                   <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-black">S</div>
                                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[100px]">{p.studentId?.name || 'N/A'}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Financials & Actions */}
                       <div className="flex flex-col md:flex-row items-end md:items-center gap-6 shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-slate-100">
                          <div className="text-right w-full md:w-auto">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Capital Value</span>
                             <div className="text-2xl font-black text-slate-900 flex items-center justify-end gap-1">
                                <span className="text-sm text-slate-400">₹</span>
                                {(p.totalAmount || 0).toLocaleString()}
                             </div>
                          </div>
                          
                          <div className="flex gap-2 w-full md:w-auto">
                             {/* Escrow Actions */}
                             {p.status === 'escrow' && (
                               <>
                                 <button 
                                   onClick={() => handleAction('release', p._id, p.projectId?._id)}
                                   className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                 >
                                   <Send size={14}/> Transfer to Student
                                 </button>
                                 <button 
                                   onClick={() => handleAction('fail', p._id)}
                                   className="px-5 py-3 rounded-xl bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                 >
                                   Mark Failed
                                 </button>
                               </>
                             )}

                             {/* Failed / Pending Repayment Actions */}
                             {(p.status === 'failed' || p.status === 'pending_repayment') && (
                               <button 
                                 onClick={() => handleAction('repay', p._id)}
                                 className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                               >
                                 <RotateCcw size={14}/> Request Repayment
                               </button>
                             )}

                             {p.status === 'released' && (
                                <div className="px-5 py-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-100">
                                  <CheckCircle2 size={14}/> Settled
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </motion.div>
               );
            })}
         </AnimatePresence>

         {filteredPayments.length === 0 && (
           <div className="py-20 flex flex-col items-center opacity-30">
             <CreditCard size={64} className="text-slate-300 mb-6" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">No transactions match your criteria.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default AdminPayments;
