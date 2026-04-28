import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Search, Loader2, Sparkles, ArrowUpRight, Brain } from 'lucide-react';

const SmartMatchRadar = ({ type = 'student' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [matches, setMatches] = useState([]);

  const mockMatches = type === 'student' ? [
    { id: 1, title: 'Enterprise AI Middleware', probability: 98, budget: '₹12,000', tags: ['Python', 'LLM'] },
    { id: 2, title: 'Crypto Liquidity Engine', probability: 94, budget: '₹15,000', tags: ['Solidity', 'Go'] },
    { id: 3, title: 'BioTech Data Visualizer', probability: 89, budget: '₹8,500', tags: ['React', 'D3.js'] }
  ] : [
    { id: 1, name: 'Alex Rivera', probability: 99, role: 'Senior Architect', tags: ['FullStack', 'AWS'] },
    { id: 2, name: 'Sarah Chen', probability: 95, role: 'UI Engineer', tags: ['Framer', 'Three.js'] },
    { id: 3, name: 'Marco V.', probability: 91, role: 'Data Scientist', tags: ['PyTorch', 'Rust'] }
  ];

  const handleScan = () => {
    setIsScanning(true);
    setMatches([]);
    setTimeout(() => {
      setMatches(mockMatches);
      setIsScanning(false);
    }, 800);
  };

  return (
    <div className="bg-slate-950 rounded-[40px] p-8 text-white relative overflow-hidden border border-white/5 shadow-2xl">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Brain className="w-5 h-5 text-indigo-400" />
             </div>
             <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Match Intelligence</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">V3.0 Neural Engine</p>
             </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScan}
            disabled={isScanning}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
            {isScanning ? 'Scanning...' : 'Initiate Scan'}
          </motion.button>
        </div>

        <div className="relative min-h-[280px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="relative w-40 h-40">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30"
                   />
                   <motion.div 
                     animate={{ rotate: -360 }}
                     transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-4 rounded-full border border-indigo-400/10"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="w-8 h-8 text-indigo-500 animate-pulse" />
                   </div>
                   {/* Scanning Radar Line */}
                   <motion.div 
                      className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-indigo-500 to-transparent origin-left"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   />
                </div>
                <p className="mt-8 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Analyzing Global Nodes...</p>
              </motion.div>
            ) : matches.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {matches.map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 bg-white/5 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="relative">
                             <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                             </div>
                             <div className="absolute -top-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border-2 border-slate-900">
                                {item.probability}%
                             </div>
                          </div>
                          <div>
                             <h4 className="text-xs font-black uppercase tracking-tight text-white group-hover:text-indigo-400 transition-colors">{item.title || item.name}</h4>
                             <div className="flex items-center gap-2 mt-1">
                                {item.tags.map(t => (
                                  <span key={t} className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t}</span>
                                ))}
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-black text-white">{item.budget || item.role}</div>
                          <div className="flex items-center gap-1 justify-end text-[8px] font-bold text-indigo-400 uppercase mt-1">
                             Deploy Link <ArrowUpRight className="w-3 h-3" />
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Zap className="w-12 h-12 text-slate-800 mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] max-w-[200px]">System Standby. Initiate scan to link with high-velocity {type === 'student' ? 'projects' : 'talent'}.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Protocol: Active</span>
           <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-6 h-6 rounded-lg bg-white/5 border border-white/10" />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SmartMatchRadar;
