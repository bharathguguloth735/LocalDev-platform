import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Code, Layout } from 'lucide-react';
import AiLogo from '../layout/AiLogo';

const Hero = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const dashboardLink = user.role === 'client' ? '/client-dashboard' : '/student-dashboard';

  return (
    <section className="relative pt-20 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-15 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 blur-3xl rounded-full mix-blend-multiply"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs mb-8 border border-indigo-100 shadow-sm">
            <AiLogo className="w-4 h-4" />
            <span className="uppercase tracking-widest">AI-Powered Developer Matching</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-heading text-slate-900 mb-6 leading-tight">
            Build Your Business Website<br className="hidden md:block" />
            with <span className="text-gradient">Student Developers</span>
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with talented local students to build affordable websites, apps, and designs. Get AI-matched developers instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-white font-medium hover:bg-primary-light transition-all shadow-[0_20px_50px_-12px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 text-lg">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/explore" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-700 font-medium hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center gap-2 text-lg">
                  Explore Developers
                </Link>
              </>
            ) : (
               <div className="flex flex-col gap-8 w-full max-w-lg">
                   <Link to={dashboardLink} className="w-full px-10 py-5 rounded-full bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-primary transition-all shadow-[0_32px_64px_-12px_rgba(15,23,42,0.3)] flex items-center justify-center gap-3 text-sm">
                      Enter Mission Control
                      <ArrowRight className="w-5 h-5" />
                   </Link>
               </div>
            )}
          </div>
        </motion.div>

        {/* High-Definition Visual Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16 relative mx-auto max-w-5xl rounded-t-[2.5rem] p-4 sm:p-6 bg-slate-900/5 shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] border-t border-x border-slate-200/50 backdrop-blur-3xl overflow-hidden"
        >
          <div className="rounded-[2rem] overflow-hidden shadow-2xl relative border-4 border-white/50 bg-slate-900 group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 z-10 transition-opacity group-hover:opacity-60 duration-500"></div>
            <img
              src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
              alt="Modern Software Development"
              className="w-full object-cover h-[350px] md:h-[500px] scale-105 group-hover:scale-100 transition-transform duration-700"
            />

            <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col md:flex-row gap-4 text-left">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex-1 text-white shadow-xl hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                  <Code className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="font-bold text-xl mb-1 font-heading">Top Tier Talent</h3>
                <p className="text-white/70 text-sm">Hire university students specifically trained in modern stacks.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex-1 text-white shadow-xl hidden sm:block hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                  <Layout className="w-5 h-5 text-emerald-300" />
                </div>
                <h3 className="font-bold text-xl mb-1 font-heading">Secure Escrow</h3>
                <p className="text-white/70 text-sm">Your money stays absolutely safe with our multi-step Smart Escrow system.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
