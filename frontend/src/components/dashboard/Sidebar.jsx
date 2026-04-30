import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Home, Briefcase, Users, MessageSquare, CreditCard, 
  Settings, LogOut, CheckCircle, Star, UserCircle, 
  Award, ChevronRight, LayoutDashboard, Compass, 
  Wallet, ShieldCheck, Sparkles, Activity, X 
} from 'lucide-react';
import { api } from '../../api';
import useUserStore from '../../store/useUserStore';


const Sidebar = ({ role: propRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, setSidebarOpen, user: userData, isSyncing } = useUserStore();
  const path = location.pathname;

  // Use the actual role from the live user object if available, otherwise fallback to prop
  const role = userData?.role || propRole || 'client';

  const clientLinks = [
    { name: 'Overview', icon: <Home className="w-5 h-5" />, path: '/client-dashboard' },
    { name: 'My Projects', icon: <Briefcase className="w-5 h-5" />, path: '/client-dashboard/projects' },
    { name: 'Profile', icon: <UserCircle className="w-5 h-5" />, path: '/client-dashboard/profile' },
    { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/client-dashboard/messages' },
    { name: 'Deliveries', icon: <Sparkles className="w-5 h-5" />, path: '/client-dashboard/submissions' },
    { name: 'Payments', icon: <CreditCard className="w-5 h-5" />, path: '/client-dashboard/payments' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/client-dashboard/settings' },
  ];

  const studentLinks = [
    { name: 'Overview', icon: <Home className="w-5 h-5" />, path: '/student-dashboard' },
    { name: 'My Projects', icon: <Briefcase className="w-5 h-5" />, path: '/student-dashboard/projects' },
    { name: 'Job Request', icon: <Compass className="w-5 h-5" />, path: '/student-dashboard/explore' },
    { name: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/student-dashboard/messages' },
    { name: 'Profile', icon: <UserCircle className="w-5 h-5" />, path: '/student-dashboard/profile' },
    { name: 'Portfolio', icon: <Users className="w-5 h-5" />, path: '/student-dashboard/portfolio' },
    { name: 'Reviews', icon: <Star className="w-5 h-5" />, path: '/student-dashboard/reviews' },
    { name: 'Submissions', icon: <Sparkles className="w-5 h-5" />, path: '/student-dashboard/submissions' },
    { name: 'Earnings', icon: <CreditCard className="w-5 h-5" />, path: '/student-dashboard/earnings' },
    { name: 'Certificates', icon: <Award className="w-5 h-5" />, path: '/student-dashboard/certificates' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/student-dashboard/settings' },
  ];

  const adminLinks = [
    { name: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/admin' },
    { name: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
    { name: 'Projects', icon: <Briefcase className="w-5 h-5" />, path: '/admin/projects' },
    { name: 'Payments', icon: <CreditCard className="w-5 h-5" />, path: '/admin/payments' },
    { name: 'Certificates', icon: <CheckCircle className="w-5 h-5" />, path: '/admin/certificates' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/admin/settings' },
  ];

  const links = role === 'student' ? studentLinks : role === 'admin' ? adminLinks : clientLinks;

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false); 
  }, [location.pathname, setSidebarOpen]);

  const userName = userData?.name || 'Guest';
  const getAvatar = (u) => {
    if (!u) return '';
    return u.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || 'User'}&backgroundColor=4f46e5&textColor=ffffff`;
  };

  const profilePath = role === 'student' ? '/student-dashboard/profile'
    : role === 'admin' ? '/admin'
    : '/client-dashboard/profile';

  const [dbStatus, setDbStatus] = useState('syncing');

  useEffect(() => {
    const checkPulse = async () => {
      try {
        await api.checkHealth();
        setDbStatus('online');
      } catch (err) {
        setDbStatus('offline');
      }
    };
    checkPulse();
    const interval = setInterval(checkPulse, 60000); // Check once per minute
    return () => clearInterval(interval);
  }, []);

  return (
    <>
    {/* Mobile Overlay */}
    {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1100] md:hidden transition-all duration-500"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    <aside className={`w-[280px] bg-white border-r border-slate-100 flex flex-col h-full fixed left-0 top-0 md:top-[74px] md:h-[calc(100vh-74px)] z-[1110] shadow-[10px_0_40px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      
      {/* Brand Section with Mobile Close */}
      <div className="p-6 pb-3 border-b border-slate-50 relative overflow-hidden group">
        <div className="flex justify-between items-center md:block mb-4 md:mb-0">
          <Link 
            to={role === 'student' ? '/student-dashboard' : role === 'admin' ? '/admin' : '/client-dashboard'} 
            className="flex items-center gap-4 relative z-10 group"
          >
            <div className="flex items-center">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-[16px] shadow-sm border border-slate-100 flex items-center justify-center p-2 transition-transform group-hover:scale-105 relative">
                 <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
               </div>
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-black text-base md:text-lg text-slate-900 tracking-tighter leading-none">LocalDev</span>
              <span className="text-[8px] md:text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-[0.2em]">Platform</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 bg-slate-50 rounded-xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm border
            ${role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
              role === 'student' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
              'bg-rose-50 text-rose-500 border-rose-100'}`}>
            {role} PRIVILEGE
          </span>
          <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dbStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : dbStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="flex-1 overflow-y-auto pt-3 pb-2 px-4 space-y-1.5 no-scrollbar relative z-10">
        <p className="px-4 mb-1 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Navigation Links</p>
        
        {links.map((link) => {
          const isActive = path === link.path;
          return (
             <Link
              key={link.name}
              to={link.path}
              className={`group flex items-center justify-between px-5 py-3.5 rounded-[18px] transition-all duration-300 font-black relative overflow-hidden ${
                isActive 
                  ? (role === 'client' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20')
                  : 'text-slate-500 hover:bg-slate-950 hover:text-white border border-transparent transition-all duration-200'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {link.icon}
                </div>
                <span className="text-sm tracking-tight uppercase leading-none">{link.name}</span>
              </div>
              
              {isActive ? (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile Section with System Pulse */}
      <div className="p-4 mt-auto border-t border-slate-50 bg-white">
        <div className="mb-3 px-3 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Activity className={`w-3 h-3 ${dbStatus === 'online' ? 'text-emerald-500' : 'text-slate-300'}`} />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Database Node</span>
           </div>
           <span className={`text-[7px] font-black uppercase ${dbStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'}`}>{dbStatus}</span>
        </div>

        <Link to={profilePath} className={`flex items-center gap-3 mb-4 px-3 py-2.5 rounded-[20px] bg-white border border-slate-100 shadow-sm hover:shadow-lg ${role === 'client' ? 'hover:border-rose-100' : 'hover:border-indigo-100'} transition-all group relative overflow-hidden ${isSyncing ? (role === 'client' ? 'ring-2 ring-rose-500/20 animate-pulse' : 'ring-2 ring-indigo-500/20 animate-pulse') : ''}`}>
          {isSyncing && (
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${role === 'client' ? 'via-rose-500/5' : 'via-indigo-500/5'} to-transparent -translate-x-full animate-[shimmer_2s_infinite]`} />
          )}
          <div className={`relative shrink-0 transition-transform duration-500 ${isSyncing ? 'scale-110' : 'scale-100'}`}>
            <img 
              src={getAvatar(userData)} 
              alt="Profile" 
              className={`w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md transition-all duration-700 ${isSyncing ? 'blur-[2px] brightness-110' : 'blur-0 brightness-100'}`} 
            />
            {isSyncing && (
              <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse backdrop-blur-sm flex items-center justify-center">
                <Sparkles className={`w-4 h-4 ${role === 'client' ? 'text-rose-500' : 'text-indigo-500'} animate-spin`} />
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${dbStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-black text-slate-900 truncate uppercase tracking-tight">{userName}</p>
              {isSyncing && <Sparkles className={`w-2.5 h-2.5 ${role === 'client' ? 'text-rose-500' : 'text-indigo-500'} animate-spin`} />}
            </div>
            <p className={`text-[7px] font-black ${role === 'client' ? 'text-rose-500 bg-rose-50' : 'text-indigo-500 bg-indigo-50'} uppercase tracking-widest mt-0.5 mb-1 w-fit px-1.5 py-0.5 rounded-sm`}>{role} View</p>
            <span className="text-[8px] font-black text-slate-400 truncate uppercase mt-0.5 flex items-center gap-1 italic">
               <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? (role === 'client' ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500 animate-pulse') : dbStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               {isSyncing ? 'Neural Sync...' : dbStatus === 'online' ? 'Protocol Online' : 'Node Disconnected'}
            </span>
          </div>
        </Link>

        <button 
          onClick={async () => {
             const sessionId = localStorage.getItem('sessionId');
             if (sessionId) try { await api.logout(sessionId); } catch (e) {}
             localStorage.clear();
             navigate('/login');
          }}
          className={`group flex items-center justify-center gap-2 w-full px-5 py-4 bg-slate-950 text-white rounded-[18px] transition-all duration-300 font-black text-[9px] uppercase tracking-[0.2em] shadow-lg outline-none border-none cursor-pointer ${role === 'client' ? 'hover:bg-rose-600' : 'hover:bg-indigo-600'}`}
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </aside>
    </>
  );
};

export default Sidebar;
