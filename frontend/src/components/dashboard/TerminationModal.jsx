import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

const TerminationModal = ({ isOpen, onClose, onConfirm, itemName, itemType = 'Protocol' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[45px] shadow-2xl overflow-hidden border border-rose-100"
        >
          {/* Header Graphic */}
          <div className="h-32 bg-rose-50 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                   <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                   </pattern>
                   <rect width="100" height="100" fill="url(#grid)" />
                </svg>
             </div>
             <div className="w-20 h-20 bg-rose-500 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-rose-500/20 relative z-10 animate-bounce">
                <ShieldAlert size={40} />
             </div>
          </div>

          <div className="p-10 text-center">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Confirm <span className="text-rose-500">Termination</span></h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
              You are about to permanently delete the <span className="text-slate-900 font-black uppercase tracking-tight">{itemType}: {itemName}</span>. This action is irreversible and will purge all associated data from the core ledger.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onConfirm}
                className="w-full py-5 rounded-[22px] bg-rose-500 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-rose-500/25 hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Trash2 size={16} /> Execute Termination
              </button>
              <button 
                onClick={onClose}
                className="w-full py-5 rounded-[22px] bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all active:scale-95"
              >
                Abort Protocol
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/50 backdrop-blur-sm rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TerminationModal;
