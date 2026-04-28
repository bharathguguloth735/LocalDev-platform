import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, Zap, Clock, ShieldCheck, ChevronRight, Check,
  Cpu, Database, Layers, Infinity, Activity, FastForward, Brain, Sparkles
} from 'lucide-react';

const PROJECT_CLASSES = [
  { 
    id: 'web', 
    name: 'Neural Interface', 
    sub: 'Full-stack Platform',
    base: 25000, 
    daily: 2, 
    tech: ['React 19', 'Node.js', 'PostgreSQL', 'Tailwind']
  },
  { 
    id: 'app', 
    name: 'Sector Mobile', 
    sub: 'Native iOS & Android',
    base: 65000, 
    daily: 4, 
    tech: ['React Native', 'Firebase', 'Redux Toolkit', 'FastLane']
  },
  { 
    id: 'ai', 
    name: 'Neural Engine', 
    sub: 'ML & LLM Integration',
    base: 120000, 
    daily: 6, 
    tech: ['TensorFlow', 'OpenAI API', 'Python', 'Vector DB']
  },
  { 
    id: 'design', 
    name: 'Kinetic UX', 
    sub: 'Advanced Interaction',
    base: 15000, 
    daily: 1, 
    tech: ['Figma', 'Framer', 'Three.js', 'After Effects']
  },
];

const TIERS = [
  { id: 'vanguard', name: 'Vanguard', multiplier: 1, label: 'MVP Focus' },
  { id: 'ascendant', name: 'Ascendant', multiplier: 1.5, label: 'Pro Scale' },
  { id: 'apex', name: 'Apex', multiplier: 2.5, label: 'Elite Enterprise' },
];

const ADDONS = [
  { id: 'auth', name: 'Auth Protocol (OTP/OAuth)', price: 8000, icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'realtime', name: 'Neural Sync (Real-time)', price: 12000, icon: <Zap className="w-4 h-4" /> },
  { id: 'cloud', name: 'Infinity Cloud (Auto-scale)', price: 15000, icon: <Infinity className="w-4 h-4" /> },
];

const AiMarketEstimator = () => {
  const [selectedClass, setSelectedClass] = useState(PROJECT_CLASSES[0]);
  const [selectedTier, setSelectedTier] = useState(TIERS[0]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(0);

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('user'));

  const finalMetrics = useMemo(() => {
    const basePrice = selectedClass.base * selectedTier.multiplier;
    const addonTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);
    const totalDays = Math.ceil(selectedClass.daily * 7 * selectedTier.multiplier);
    return {
      price: Math.round(basePrice + addonTotal),
      days: totalDays
    };
  }, [selectedClass, selectedTier, selectedAddons]);

  useEffect(() => {
    setCalculating(true);
    const timer = setTimeout(() => {
      setDisplayPrice(finalMetrics.price);
      setCalculating(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [finalMetrics.price]);

  const toggleAddon = (addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleInitiate = () => {
    if (!userData) { navigate('/login'); return; }
    if (userData.role !== 'client') { alert("Only clients can initiate projects."); return; }

    const projectData = {
      title: `${selectedClass.name} [${selectedTier.name}]`,
      category: selectedClass.id === 'app' ? 'App' : selectedClass.id === 'ai' ? 'AI' : 'Website',
      budget: finalMetrics.price,
      description: `Neural Scoping Result:\nClass: ${selectedClass.name}\nTier: ${selectedTier.name}\nModules: ${selectedAddons.map(a => a.name).join(', ') || 'None'}\nTimeline: ${finalMetrics.days} Days`
    };
    navigate('/post-project', { state: { prefill: projectData } });
  };

  return (
    <section className="py-12 md:py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#f43f5e 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Tech Selection */}
          <div className="lg:col-span-7 space-y-8 md:space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Cpu className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-2xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter">AI Market Estimator</h2>
              </div>
              <p className="text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-[0.4em] ml-1">Precision Intelligence Node</p>
            </div>

            {/* Stage 01: Project Class */}
            <div className="space-y-6">
               <h4 className="text-[9px] md:text-[10px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-2">
                 <span className="w-4 md:w-6 h-[1px] bg-rose-500" /> 01. Operational Sector
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {PROJECT_CLASSES.map(cls => (
                   <button 
                     key={cls.id}
                     onClick={() => setSelectedClass(cls)}
                     className={`p-5 md:p-6 rounded-[28px] md:rounded-[32px] border-2 text-left transition-all relative overflow-hidden group
                       ${selectedClass.id === cls.id ? 'border-rose-500 bg-rose-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                   >
                     <div className="relative z-10">
                        <p className={`font-black text-base md:text-lg transition-colors ${selectedClass.id === cls.id ? 'text-rose-900' : 'text-slate-400'}`}>{cls.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{cls.sub}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                           {cls.tech.map(t => (
                             <span key={t} className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border 
                               ${selectedClass.id === cls.id ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-300 border-slate-100'}`}>
                               {t}
                             </span>
                           ))}
                        </div>
                     </div>
                     {selectedClass.id === cls.id && (
                       <motion.div layoutId="glow" className="absolute inset-0 bg-rose-500/5 blur-2xl" />
                     )}
                   </button>
                 ))}
               </div>
            </div>

            {/* Stage 02: Scale Tier */}
            <div className="space-y-6">
               <h4 className="text-[9px] md:text-[10px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-2">
                 <span className="w-4 md:w-6 h-[1px] bg-rose-500" /> 02. Mission Scale
               </h4>
               <div className="flex flex-wrap gap-3 md:gap-4">
                  {TIERS.map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                       className={`flex-1 min-w-[120px] md:min-w-[140px] px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all
                         ${selectedTier.id === tier.id ? 'bg-rose-500 text-white border-rose-500 shadow-[0_20px_50px_-12px_rgba(244,63,94,0.3)]' : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:bg-slate-100'}`}
                     >
                      {tier.name}
                      <span className="block text-[8px] opacity-60 mt-1">{tier.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Stage 03: Addons */}
            <div className="space-y-6">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-2">
                 <span className="w-4 md:w-6 h-[1px] bg-rose-500" /> 03. Core Intelligence Modules
              </h4>
              <div className="space-y-3">
                 {ADDONS.map(addon => (
                   <button
                     key={addon.id}
                     onClick={() => toggleAddon(addon)}
                     className={`w-full p-4 md:p-5 rounded-[22px] md:rounded-3xl border-2 transition-all flex items-center justify-between group
                       ${selectedAddons.find(a => a.id === addon.id) ? 'border-rose-500 bg-rose-950 text-white' : 'border-slate-50 bg-slate-50/30 text-slate-500'}`}
                   >
                     <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all 
                          ${selectedAddons.find(a => a.id === addon.id) ? 'bg-rose-500' : 'bg-white shadow-sm border border-slate-100'}`}>
                          {addon.icon}
                        </div>
                        <span className="font-black text-[10px] md:text-xs uppercase tracking-tight">{addon.name}</span>
                     </div>
                     <span className="text-[9px] md:text-[10px] font-black text-rose-500">+₹{addon.price.toLocaleString()}</span>
                   </button>
                 ))}
              </div>
            </div>
          </div>

          {/* Right Column: Console Results */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
             <div className="bg-slate-950 rounded-[40px] md:rounded-[64px] p-8 md:p-12 text-white shadow-[0_60px_120px_-20px_rgba(15,23,42,0.6)] relative overflow-hidden">
               {/* Terminal Top Accent */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[100px] animate-pulse" />
               <div className="absolute top-6 left-6 md:top-10 md:left-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 backdrop-blur-md">
                     <Brain className="w-5 h-5 md:w-6 md:h-6 text-rose-400" />
                  </div>
               </div>

               <div className="relative z-10 pt-12 md:pt-16 space-y-8 md:space-y-12">
                  
                  <div className="space-y-4">
                     <p className="text-[9px] md:text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">Capital Estimate</p>
                     <div className="flex items-baseline gap-2">
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={displayPrice}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter ${calculating ? 'opacity-40 animate-pulse' : ''}`}
                          >
                            ₹{displayPrice.toLocaleString()}+
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-white/20 font-black text-sm uppercase">INR</span>
                     </div>
                     <div className="flex items-center gap-4 py-3 px-5 bg-white/5 rounded-2xl w-fit border border-white/5">
                        <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Market Value: Verifying...</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                     <div className="space-y-2 md:space-y-3 p-5 md:p-6 bg-white/5 rounded-[28px] md:rounded-[32px] border border-white/5 hover:bg-white/[0.08] transition-all">
                        <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest">Flow Velocity</p>
                        <div className="flex items-center gap-2 md:gap-3">
                           <FastForward className="w-4 h-4 md:w-5 md:h-5 text-rose-400" />
                           <span className="text-xl md:text-3xl font-black">{finalMetrics.days} Days</span>
                        </div>
                     </div>
                     <div className="space-y-2 md:space-y-3 p-5 md:p-6 bg-white/5 rounded-[28px] md:rounded-[32px] border border-white/5 hover:bg-white/[0.08] transition-all">
                        <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest">Tech Stack</p>
                        <div className="flex items-center gap-2 md:gap-3">
                           <Layers className="w-4 h-4 md:w-5 md:h-5 text-rose-400" />
                           <span className="text-lg md:text-xl font-black uppercase tracking-tight">{selectedClass.tech.length} Nodes</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 pt-6">
                    <button 
                      onClick={handleInitiate}
                      className="w-full py-5 md:py-6 bg-rose-500 hover:bg-white hover:text-black text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] md:text-[11px] shadow-2xl transition-all flex items-center justify-center gap-3 md:gap-4 group border-none cursor-pointer"
                    >
                      <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Initiate Primary Mission
                    </button>
                    <p className="text-[9px] text-center font-black text-white/20 uppercase tracking-widest">
                       Secure Escrow Protection Active
                    </p>
                  </div>
               </div>
            </div>

            <div className="mt-8 md:mt-12 flex items-center justify-center gap-4 md:gap-6 opacity-30 grayscale">
               <Database className="w-5 h-5 md:w-6 md:h-6" />
               <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
               <Cpu className="w-5 h-5 md:w-6 md:h-6" />
               <Infinity className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AiMarketEstimator;
