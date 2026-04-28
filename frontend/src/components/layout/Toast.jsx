import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[10000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <ToastItem 
                toast={toast} 
                onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />,
  };

  const bgColors = {
    success: 'bg-white border-emerald-100',
    error: 'bg-white border-rose-100',
    warning: 'bg-white border-amber-100',
    info: 'bg-white border-indigo-100',
  };

  return (
    <div className={`flex items-center gap-4 px-6 py-4 rounded-[24px] border shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-w-[320px] max-w-md ${bgColors[toast.type]}`}>
      <div className="shrink-0">{icons[toast.type]}</div>
      <div className="flex-1">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{toast.type}</p>
        <p className="text-sm font-bold text-slate-900 leading-tight">{toast.message}</p>
      </div>
      <button 
        onClick={onClose}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
