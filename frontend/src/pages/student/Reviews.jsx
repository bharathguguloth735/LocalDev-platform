import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MessageSquare, Clock, ShieldCheck, Zap, 
  TrendingUp, BarChart3, Users, 
  ArrowUpRight, Share2, MousePointer2, Phone,
  ChevronDown, Search, Filter, Plus, Target, CheckCircle, Loader2
} from 'lucide-react';
import { api } from '../../api';

const Reviews = () => {
  const [activeTab, setActiveTab] = useState('Reputation');
  const [realReviews, setRealReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?._id || user?.id;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;
      try {
        const data = await api.getDeveloperReviews(userId);
        setRealReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load reputation data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [userId]);

  const tabs = ['Overview', 'Development Leads', 'Web Presence', 'Reputation'];

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f2f5f9]">
       <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 pb-24 transition-colors duration-500">

      <div className="p-10 max-w-[1600px] mx-auto">
        {/* Top Row: Analytics Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                    {/* Overall Rating Card */}
          <div className="lg:col-span-3 bg-slate-950 rounded-[40px] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] p-10 border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700" />
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">Overall Reputation</h3>
            <div className="flex flex-col items-start gap-4 mb-2 relative z-10">
              <span className="text-7xl font-black tracking-tighter leading-none text-white">
                {realReviews.length > 0 
                  ? (realReviews.reduce((s, r) => s + r.rating, 0) / realReviews.length).toFixed(1)
                  : '0.0'}
              </span>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(realReviews.reduce((s,r)=>s+r.rating,0)/(realReviews.length||1)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                 Neural Sync Active
              </div>
            </div>
          </div>

          {/* Mission History Card */}
          <div className="lg:col-span-6 bg-slate-950 rounded-[40px] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] p-10 border border-slate-800 flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Mission Velocity</h3>
              <div className="flex items-center gap-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_#6366f1]" /> 
                Sector Telemetry
              </div>
            </div>
            <div className="flex gap-12 mb-10 items-end relative z-10">
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Mentions</p>
                <div className="text-5xl font-black tracking-tighter text-white">{realReviews.length}</div>
              </div>
              <div>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">Success Index</p>
                <div className="text-5xl font-black tracking-tighter text-emerald-500">100%</div>
              </div>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 min-h-[140px] relative z-10">
              {[30, 45, 60, 40, 55, 80, 65, 90, 75, 85, 95, 110].map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  className={`flex-1 rounded-t-lg transition-all duration-500 relative ${i > 8 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} 
                />
              ))}
            </div>
          </div>

          {/* Sentiment Card */}
          <div className="lg:col-span-3 bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] p-10 border border-white flex flex-col items-center group relative overflow-hidden transition-all hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] w-full italic mb-10">Client Sentiment</h3>
            <div className="relative w-48 h-24 mb-6 text-center z-10">
                 <div className="bg-emerald-50 dark:bg-emerald-500/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20 group-hover:rotate-12 transition-transform duration-500">
                    <MessageSquare className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
                 </div>
                 <h4 className="text-emerald-500 text-2xl font-black uppercase tracking-tighter">Elite Status</h4>
            </div>
            <div className="text-center mt-6 z-10">
               <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">98%</span>
               <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black max-w-[140px] mt-2 uppercase tracking-tight leading-3">of clients recommend your technical output</p>
            </div>
          </div>
        </div>

        {/* Second Row: Detailed Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-12 space-y-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Latest Feedback</h2>
              <div className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:shadow-md transition-all"><Filter className="w-4 h-4 text-slate-400" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {realReviews.length === 0 ? (
                <div className="col-span-full bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center opacity-40">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No battle-tested feedback found in session logs.</p>
                </div>
              ) : (
                realReviews.map((rv, i) => (
                  <motion.div 
                    key={rv._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.05)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-10 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="shrink-0 relative">
                      <img src={rv.client?.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${rv.client?.name || 'User'}`} className="w-20 h-20 rounded-[32px] border-4 border-slate-50 shadow-xl object-cover" />
                      <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-indigo-600 rounded-[14px] flex items-center justify-center shadow-lg border-4 border-white"><Star className="w-5 h-5 text-white fill-white" /></div>
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                          <h4 className="font-black text-slate-900 text-2xl uppercase tracking-tighter">{rv.client?.name}</h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Client Mission</p>
                        </div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-100 dark:border-indigo-500/20">{new Date(rv.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-slate-100 w-fit mb-6 shadow-sm">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star key={starIdx} className={`w-4 h-4 ${starIdx < rv.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-slate-600 text-lg leading-relaxed font-medium italic">"{rv.comment}"</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Right Column Metrics - REMOVED */}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
