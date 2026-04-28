import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, LogOut, Activity, ArrowLeft, Sparkles } from 'lucide-react';
import NotificationCenter from '../dashboard/NotificationCenter';
import AiLogo from './AiLogo';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userData, setUserData] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    const onUpdate = () => {
      try {
        const u = localStorage.getItem('user');
        setUserData(u ? JSON.parse(u) : null);
      } catch { setUserData(null); }
    };
    window.addEventListener('userUpdated', onUpdate);
    
    // Force light mode
    document.documentElement.classList.remove('dark');

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('userUpdated', onUpdate);
    };
  }, []);

  // Force sync on route change to prevent "transient" logged-out states on dashboard pages
  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      setUserData(u ? JSON.parse(u) : null);
    } catch { setUserData(null); }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    navigate('/');
  };

  // Dark mode toggle decommissioned per user request

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-[1050] transition-all duration-300 border-b
      ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg py-2 border-slate-100' : 'bg-white py-3 border-transparent'}`}>
      
      <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
        
        {/* Left Side: Logo + Nav Links */}
        <div className="flex items-center gap-12 flex-1">
          <Link to={userData ? `/${userData.role}-dashboard` : "/"} className="flex items-center gap-4 group shrink-0">
             <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-[14px] shadow-sm border border-slate-100 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 relative">
                   <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
             </div>
              {!userData && (
                <div className="flex items-center gap-3">
                   <div className="flex flex-col">
                      <span className="font-sans font-black text-lg text-slate-900 tracking-tighter leading-none">LocalDev</span>
                      <span className="text-[8px] font-black text-indigo-500 mt-0.5 uppercase tracking-[0.2em] flex items-center gap-1">
                        <Sparkles className="w-2 h-2" /> AI-PLATFORM
                      </span>
                   </div>
                </div>
              )}
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center Side: Identity Pill */}
        <div className="flex-1 flex justify-center">
          {userData ? (
            <motion.div 
               initial={{ y: -20, opacity: 0, scale: 0.9 }} 
               animate={{ y: 0, opacity: 1, scale: 1 }}
               transition={{ type: "spring", stiffness: 300, damping: 25 }}
               className="flex items-center"
            >
              <Link 
                to={`/${userData.role}-dashboard`}
                className="relative group px-10 py-3.5 rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-95 flex items-center"
              >
                {/* Cinematic Background with Animated Border */}
                <div className="absolute inset-0 bg-slate-950" />
                <motion.div 
                  className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.5),transparent,rgba(168,85,247,0.5),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-[1px] bg-slate-950 rounded-full z-0" />
                
                {/* Content */}
                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1]" 
                  />
                  {userData.role === 'student' ? 'Student Terminal' : 'Client Terminal'}
                </span>

                {/* Shimmer Effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%]"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
                />

                {/* Glass Highlight */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none" />
              </Link>
            </motion.div>
          ) : (
            <div className="hidden"></div>
          )}
        </div>

        {/* Right Side: Auth Actions */}
        <div className="flex-1 flex justify-end items-center gap-6">
          {userData ? (
             <div className="flex items-center gap-6">
                {/* Neural Back Protocol - Relocated for Better Flow */}
                {location.pathname.split('/').length > 2 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Back Protocol</span>
                  </motion.button>
                )}
                <NotificationCenter />
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
             </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="bg-slate-950 text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                Join Network
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
