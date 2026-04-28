import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Rocket, Users, Briefcase, Settings, MessageSquare, X, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isMac, setIsMac] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const actions = [
    { id: 1, name: 'Post Project', icon: <Rocket className="w-4 h-4" />, path: '/post-project' },
    { id: 2, name: 'Search Developers', icon: <Users className="w-4 h-4" />, path: '/client-dashboard/developers' },
    { id: 3, name: 'My Projects', icon: <Briefcase className="w-4 h-4" />, path: '/client-dashboard/projects' },
    { id: 4, name: 'Messages', icon: <MessageSquare className="w-4 h-4" />, path: '/client-dashboard/messages' },
    { id: 5, name: 'Account Settings', icon: <Settings className="w-4 h-4" />, path: '/client-dashboard/settings' },
  ];

  const filteredActions = actions.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 20);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white w-full max-w-xl mx-4 rounded-[32px] shadow-2xl border border-white overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-slate-100 flex items-center gap-4">
              <Search className="w-6 h-6 text-slate-300" />
              <input 
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 placeholder:text-slate-300"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400">
                {isMac ? '⌘' : 'CTRL'} K
              </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto no-scrollbar">
              <p className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">Available Actions</p>
              <div className="space-y-1">
                {filteredActions.length > 0 ? (
                  filteredActions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => {
                        navigate(action.path);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-4 hover:bg-indigo-50 rounded-2xl transition-all group text-left border-none bg-transparent cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white transition-all">
                          {action.icon}
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-slate-900">{action.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-600 transition-all" />
                    </button>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-sm font-bold text-slate-400 italic">No matching commands found.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-black">ESC</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">to close</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-black">ENTER</span>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">to select</span>
                </div>
              </div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">LocalDev Hub v4.1</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
  </svg>
);

export default CommandPalette;
