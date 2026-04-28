import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap, Shield, User, Globe, TrendingUp, Cpu } from 'lucide-react';

const EVENTS = [
  { id: 1, type: 'hired', name: 'Lex Luthor', action: 'hired a Front-end Specialist', time: 'Just now' },
  { id: 2, type: 'joined', name: 'Sara S.', action: 'joined the Global Talent Matrix', time: '2m ago' },
  { id: 3, type: 'payment', name: 'Quantum Project', action: 'milestone released: $450', time: '5m ago' },
  { id: 4, type: 'review', name: 'Bruce W.', action: 'gave a 5.0 rating to Alfred D.', time: '12m ago' },
  { id: 5, type: 'hired', name: 'Daily Planet', action: 'initiated a React-SaaS mission', time: '15m ago' },
];

const LivePulse = () => {
  const [activeEvents, setActiveEvents] = useState(EVENTS.slice(0, 3));

  useEffect(() => {
    const interval = setInterval(() => {
      const nextEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setActiveEvents(prev => [ { ...nextEvent, id: Date.now() }, ...prev.slice(0, 2)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Matrix Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: `radial-gradient(circle at 2px 2px, #6366f1 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase tracking-widest border border-indigo-500/20">
              <TrendingUp className="w-3 h-3" />
              <span>Real-Time Operation Pulse</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-white font-heading tracking-tight leading-tight">
              A Living Ecosystem of <br />
              <span className="text-indigo-400">Elite Talent.</span>
            </h2>
            
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed font-medium">
              We aren't just a job board. We are a real-time development engine. Monitor live assignments, secure transitions, and neural-matching as they happen.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-colors group">
                <Cpu className="w-8 h-8 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Compute Capacity</h4>
                <p className="text-indigo-400 font-black text-2xl tracking-tighter">8.4 TFLOPs</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-colors group">
                <Shield className="w-8 h-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-1">Security Status</h4>
                <p className="text-emerald-400 font-black text-2xl tracking-tighter">100% SECURE</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-800/50 backdrop-blur-3xl p-8 rounded-[48px] border border-white/5 shadow-2xl relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-[80px]" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-transparent border border-white/20 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-transparent border border-white/20 rounded-full" />
                  </div>
                  <span className="text-white/50 font-black uppercase text-[9px] tracking-[0.3em]">Neural Activity Link</span>
                </div>
                <Globe className="w-4 h-4 text-white/20" />
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {activeEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between gap-4 group hover:bg-white/10 transition-all cursor-default"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          {event.type === 'hired' ? <Zap className="w-5 h-5" /> : event.type === 'joined' ? <User className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        </div>
                        <div>
                          <h5 className="text-white font-bold text-sm">{event.name}</h5>
                          <p className="text-white/40 text-[10px] uppercase font-black tracking-widest leading-none mt-1">{event.action}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-indigo-400/60 whitespace-nowrap">{event.time}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center">
                 <button className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em] hover:text-indigo-400 transition-colors">
                    Access Global Ledger
                 </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LivePulse;
