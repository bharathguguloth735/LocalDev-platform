import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, Shield, Star, Rocket, Send, ArrowLeft, ArrowRight, IndianRupee, Terminal, Activity, MessageCircle, Cpu, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { socket } from '../../socket.js';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });
  const userId = user?._id || user?.id;

  // Sync with Navbar's user state
  useEffect(() => {
    const onUpdate = () => {
      try {
        const u = localStorage.getItem('user');
        setUser(u ? JSON.parse(u) : null);
      } catch { setUser(null); }
    };
    window.addEventListener('userUpdated', onUpdate);
    return () => window.removeEventListener('userUpdated', onUpdate);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      if (!socket.connected) socket.connect();
      socket.emit('join', userId);
    }

    const handleNewNotif = (notif) => {
      console.log('[Diagnostic] New signal alert received in monitor:', notif);
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification:new', handleNewNotif);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      socket.off('notification:new', handleNewNotif);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) { console.error(err); }
  };

  const handleNotifyClick = async (notif) => {
    // 1. Mark as Read
    if (!notif.isRead) {
      try {
        await api.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) { console.error(err); }
    }

    // 2. Navigate based on type
    const role = user?.role || 'student';
    
    // Check if there is a direct deep-link
    if (notif.link) {
       let targetPath = notif.link;
       // If the link is already absolute (starts with /), use it directly
       if (targetPath.startsWith('/')) {
          navigate(targetPath);
       } else {
          // Otherwise, prefix it with the role-dashboard to ensure it lands in the right sector
          navigate(`/${role}-dashboard/${targetPath.startsWith('/') ? targetPath.slice(1) : targetPath}`);
       }
       setIsOpen(false);
       return;
    }

    switch (notif.type) {
      case 'message':
        navigate(`/${role}-dashboard/messages?userId=${notif.sender?._id || notif.sender}`);
        break;
      case 'hire':
        navigate(role === 'student' ? '/student-dashboard/projects' : '/client-dashboard/projects');
        break;
      case 'invitation':
        navigate('/student-dashboard/explore');
        break;
      case 'application':
        if (notif.projectId) navigate(`/client-dashboard/track/${notif.projectId}`);
        else navigate('/client-dashboard/projects');
        break;
      case 'submission':
      case 'approval':
        if (notif.projectId) navigate(`/${role}-dashboard/track/${notif.projectId}`);
        else navigate(role === 'client' ? '/client-dashboard/projects' : '/student-dashboard/projects');
        break;
      case 'review':
        navigate(role === 'student' ? '/student-dashboard/reviews' : '/client-dashboard/projects');
        break;
      case 'payment':
        navigate(role === 'student' ? '/student-dashboard/earnings' : '/client-dashboard/payments');
        break;
      default:
        if (role === 'admin') navigate('/admin');
        else navigate(role === 'client' ? '/client-dashboard' : '/student-dashboard');
    }
    
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => notifications.find(n => n._id === id && !n.isRead) ? Math.max(0, prev - 1) : prev);
    } catch (err) { console.error(err); }
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-4 h-4 text-indigo-500" />;
      case 'hire': return <Rocket className="w-4 h-4 text-emerald-500" />;
      case 'invitation': return <Target className="w-4 h-4 text-indigo-600" />;
      case 'application': return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'submission': return <Send className="w-4 h-4 text-blue-500" />;
      case 'approval': return <Shield className="w-4 h-4 text-indigo-500" />;
      case 'review': return <Star className="w-4 h-4 text-amber-500" />;
      case 'payment': return <IndianRupee className="w-4 h-4 text-indigo-600" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);

    if (diffMin < 60) return `${diffMin}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    return then.toLocaleDateString();
  };

  const today = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const older = notifications.filter(n => {
    const d = new Date(n.createdAt);
    const now = new Date();
    return !(d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          const newState = !isOpen;
          setIsOpen(newState);
          if (newState && window.navigator.vibrate) window.navigator.vibrate(10);
        }}
        className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] transition-all group overflow-visible"
      >
        <Bell className={`w-5 h-5 transition-all duration-500 ${isOpen ? 'text-indigo-600 scale-110' : 'text-slate-400 group-hover:text-slate-900 group-hover:rotate-12'}`} />
        
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white text-[9px] font-black flex items-center justify-center rounded-lg border-2 border-white shadow-lg z-20">
              {unreadCount}
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-16 right-0 z-[2000] w-[calc(100vw-2rem)] md:w-[420px] bg-white rounded-[40px] shadow-[0_40px_80px_-15px_rgba(79,70,229,0.2)] border border-slate-100 overflow-hidden"
          >

            {/* Realistic Header */}
            <div className="p-8 pb-6 bg-slate-50/50 backdrop-blur-xl border-b border-slate-100">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <Terminal className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Notification Alert</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">System Monitor Active</p>
                     </div>
                  </div>
                   <div className="flex items-center gap-2">
                      <button onClick={handleClearAll} className="px-4 py-2 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                        Clear All
                      </button>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="px-5 py-2 bg-white text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm border border-slate-100 hover:bg-slate-950 hover:text-white transition-all">
                          Archive All
                        </button>
                      )}
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-2xl flex items-center justify-center transition-all group shadow-sm hover:shadow-xl active:scale-90 ml-2"
                        title="Close Monitor"
                      >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      </button>
                   </div>
               </div>
            </div>

            {/* Scrollable Alerts */}
            <div className="max-h-[500px] overflow-y-auto p-4 custom-scrollbar bg-white">
              {notifications.length === 0 ? (
                <div className="py-24 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg width="100%" height="100%"><pattern id="mesh" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#mesh)" /></svg>
                  </div>
                  <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-6 relative z-10 border border-slate-100 shadow-inner">
                    <Bell className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 relative z-10">Zero Mission Alerts Detected</p>
                  <div className="mt-4 w-12 h-[2px] bg-slate-100 rounded-full relative z-10" />
                </div>
              ) : (
                <div className="space-y-8 p-2">
                  {today.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">Real-Time Intake</h4>
                      {today.map(n => (
                        <NotificationItem key={n._id} notif={n} onClick={() => handleNotifyClick(n)} onDelete={(e) => handleDeleteNotification(e, n._id)} icon={getTypeIcon(n.type)} timestamp={formatTimestamp(n.createdAt)} />
                      ))}
                    </div>
                  )}

                  {older.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">Dossier Archives</h4>
                      {older.map(n => (
                        <NotificationItem key={n._id} notif={n} onClick={() => handleNotifyClick(n)} onDelete={(e) => handleDeleteNotification(e, n._id)} icon={getTypeIcon(n.type)} timestamp={formatTimestamp(n.createdAt)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Realistic Footer */}
            <div className="p-6 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 text-center">
               <button 
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
               >
                 Terminate Session Monitor
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const NotificationItem = ({ notif, onClick, onDelete, icon, timestamp }) => {
  const getIconBg = (type) => {
    switch (type) {
      case 'hire': return 'bg-emerald-50 border-emerald-100';
      case 'invitation': return 'bg-indigo-50 border-indigo-100';
      case 'application': return 'bg-blue-50 border-blue-100';
      case 'message': return 'bg-indigo-50/50 border-indigo-100';
      case 'approval': return 'bg-indigo-50 border-indigo-100';
      case 'payment': return 'bg-indigo-50 border-indigo-100';
      default: return 'bg-white border-slate-100';
    }
  };

  return (
    <motion.div 
      whileHover={{ x: 5 }}
      onClick={onClick}
      className={`group p-5 rounded-[28px] transition-all cursor-pointer relative overflow-hidden flex gap-5 
      ${notif.isRead ? 'bg-white hover:bg-slate-50 border border-transparent' : 'bg-slate-50 hover:bg-white shadow-[0_15px_35px_-5px_rgba(79,70,229,0.1)] border border-slate-100'}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110 ${getIconBg(notif.type)}`}>
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-sm font-black text-slate-900 truncate pr-6 uppercase tracking-tight">{notif.title}</h4>
          <span className="text-[8px] font-black text-slate-400 shrink-0 uppercase tracking-widest">{timestamp} ago</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic pr-4">{notif.message}</p>
        
        {!notif.isRead && (
          <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping" />
        )}
      </div>

      <div className="flex flex-col gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
           onClick={onDelete}
           className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
           title="Delete Alert"
         >
            <X className="w-4 h-4" />
         </button>
         <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-indigo-600" />
         </div>
      </div>
    </motion.div>
  );
};

export default NotificationCenter;
