import { motion } from 'framer-motion';
import { Target, Zap, Clock, Send, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, isHired, theme, onTrack, onMessage }) => {
  const p = project;
  const navigate = useNavigate();
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-[32px] md:rounded-[50px] p-6 md:p-8 border shadow-sm hover:shadow-2xl transition-all group flex flex-col md:flex-row gap-6 md:gap-8 relative overflow-hidden ${isHired ? 'border-slate-100' : 'border-amber-100/50 bg-amber-50/10'}`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-0 opacity-40 group-hover:scale-110 transition-transform" />
      
      <div className="w-full md:w-1/4 shrink-0">
         <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[28px] ${theme.bg} ${theme.color} flex items-center justify-center mb-4 shadow-inner border border-white/50 transition-transform group-hover:rotate-12`}>
            {theme.icon}
         </div>
         <div className="space-y-2">
            <div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mission Budget</span>
               <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">₹{p.budget?.toLocaleString()}</span>
            </div>
            <div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Engagement Type</span>
               <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isHired ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isHired ? 'text-emerald-500' : 'text-amber-600'}`}>{isHired ? 'Active Mission' : 'Neural Request'}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col justify-between relative z-10">
         <div>
            <div className="flex items-center gap-3 mb-4">
               <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${isHired ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{isHired ? p.category : 'Pending Intake'}</span>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Initial Deployment: {new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight md:leading-[0.9] mb-2 md:mb-3 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic max-w-2xl line-clamp-2">"{p.description}"</p>
         </div>

         <div className="mt-3 md:mt-4 pt-4 md:pt-5 border-t border-slate-50 flex flex-col xl:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10 w-full xl:w-auto">
               <div className="flex flex-col gap-2 w-full sm:w-48">
                  <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                     <span>Mission Velocity</span>
                     <span className="text-indigo-600">{isHired ? (p.progress || 0) : 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${isHired ? (p.progress || 0) : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                     />
                  </div>
               </div>
               <div className="flex items-center gap-3 self-start sm:self-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Activity className="w-5 h-5" /></div>
                  <div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Last Signal</span>
                     <span className="text-[10px] font-black text-slate-900 uppercase mt-1">{isHired ? '2m ago' : 'Processing...'}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
               <button 
                 onClick={onTrack}
                 className={`flex-1 sm:flex-none px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${isHired ? 'bg-slate-950 text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
               >
                  {isHired ? <>Track Request <Target className="w-4 h-4" /></> : <>Awaiting Uplink <Clock className="w-4 h-4" /></>}
               </button>
               <button 
                 onClick={onMessage}
                 className="p-5 bg-white border border-slate-100 text-slate-900 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
               >
                  <Send className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
