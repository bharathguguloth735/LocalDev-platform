import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Activity } from 'lucide-react';

const NeuralGridLoader = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    "INITIALIZING_NEURAL_GRID_V4...",
    "SYNCING_DATABASE_NODES...",
    "ESTABLISHING_ENCRYPTED_LINK...",
    "OPTIMIZING_MISSION_PROTOCOLS...",
    "LOCALDEV_V4_READY."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 200);
          return 100;
        }
        return prev + 5;
      });
    }, 15);

    const logInterval = setInterval(() => {
      setLogIndex(prev => (prev < logs.length - 1 ? prev + 1 : prev));
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center p-8 overflow-hidden"
        >
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

          {/* Central Logo and Core */}
          <div className="relative mb-16">
             <motion.div 
               animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="w-48 h-48 border-2 border-indigo-500/20 rounded-full flex items-center justify-center"
             >
                <div className="w-40 h-40 border-2 border-indigo-500/40 rounded-full flex items-center justify-center" />
             </motion.div>
             <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)]"
                >
                   <Shield className="w-8 h-8 text-white" />
                </motion.div>
             </div>
          </div>

          {/* Branding */}
          <div className="text-center mb-12 relative z-10">
             <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">LocalDev <span className="text-indigo-500">V4</span></h1>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural Grid Intelligence Architecture</p>
          </div>

          {/* Progress and Logs */}
          <div className="w-full max-w-sm space-y-6 relative z-10">
             <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center">
                      <Terminal className="w-3 h-3 text-indigo-400" />
                   </div>
                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{logs[logIndex]}</span>
                </div>
                <span className="text-[10px] font-black text-white">{progress}%</span>
             </div>
             
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-indigo-600 shadow-[0_0_15px_#6366f1]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
             </div>

             <div className="flex justify-center gap-8 opacity-40">
                <div className="flex items-center gap-2">
                   <Cpu className="w-3 h-3 text-slate-400" />
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">CPU_OPTIMIZED</span>
                </div>
                <div className="flex items-center gap-2">
                   <Activity className="w-3 h-3 text-slate-400" />
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">NODE_ENCRYPTED</span>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NeuralGridLoader;
