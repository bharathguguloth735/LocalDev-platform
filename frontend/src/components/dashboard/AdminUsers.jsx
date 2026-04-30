import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Trash2, Shield, Search, Filter, 
  MoreVertical, Mail, UserCheck, UserX, 
  ChevronRight, ArrowUpDown, Loader2, Download,
  User, Briefcase, GraduationCap
} from 'lucide-react';
import { api } from '../../api';

/**
 * ADMIN USER MANAGEMENT (v5.0)
 * - Structured identity monitoring.
 * - Role-based segmentation (Student/Client/Admin).
 * - Kinetic table architecture with glassmorphism.
 */
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, student, client, admin
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to terminate this identity protocol?')) return;
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (e) {
      alert('Identity termination failed.');
    }
  };

  const filteredUsers = users
    .filter(u => {
      const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || u.role === activeTab;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Accessing User Database...</span>
        </div>
      </div>
    );
  }

  const roleStyles = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    student: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    client: 'bg-rose-100 text-rose-700 border-rose-200'
  };

  const roleIcons = {
    admin: <Shield size={10} />,
    student: <GraduationCap size={10} />,
    client: <Briefcase size={10} />
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto w-full animate-[fade-in_0.5s]">
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-3">
             <div className="h-[2px] w-12 bg-indigo-600 rounded-full" />
             <span className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.4em]">Directory Services</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Protocol</span></h1>
           <p className="text-slate-400 text-sm font-medium mt-4 uppercase tracking-widest">Managing <span className="text-slate-900 font-black">{users.length}</span> verified entities across sectors.</p>
        </div>

        <button className="bg-slate-900 text-white px-10 py-5 rounded-[22px] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3">
           <Download className="w-4 h-4" /> Export Ledger
        </button>
      </div>

      {/* ── FILTERS & SEARCH ────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 p-4 rounded-[32px] md:rounded-[45px] shadow-sm mb-10 flex flex-col md:flex-row gap-4">
         <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All Entities', icon: <Users size={14}/> },
              { id: 'student', label: 'Students', icon: <GraduationCap size={14}/> },
              { id: 'client', label: 'Clients', icon: <Briefcase size={14}/> },
              { id: 'admin', label: 'Admins', icon: <Shield size={14}/> }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-none outline-none
                ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
         </div>
         <div className="md:w-80 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search identities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
         </div>
      </div>

      {/* ── USER GRID / TABLE ────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-50">
                  <tr>
                     <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer group" onClick={() => requestSort('name')}>
                        <div className="flex items-center gap-2">
                           Entity Name <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                     </th>
                     <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Node</th>
                     <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer group" onClick={() => requestSort('role')}>
                        <div className="flex items-center gap-2">
                           Classification <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                     </th>
                     <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Onboarding</th>
                     <th className="p-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Protocols</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                     {filteredUsers.map((user, idx) => (
                        <motion.tr 
                          key={user._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/50 transition-all group cursor-default"
                        >
                           <td className="p-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                    <img 
                                      src={user.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=4f46e5`} 
                                      alt="" 
                                      className="w-full h-full object-cover"
                                    />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{user.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">UID: {user._id.slice(-8).toUpperCase()}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                 <Mail className="w-3.5 h-3.5 text-slate-300" />
                                 {user.email}
                              </div>
                           </td>
                           <td className="p-8">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${roleStyles[user.role]}`}>
                                 {roleIcons[user.role]} {user.role}
                              </span>
                           </td>
                           <td className="p-8">
                              <div className="flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${user.onboarded ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.onboarded ? 'Synchronized' : 'In Progress'}</span>
                              </div>
                           </td>
                           <td className="p-8 text-right">
                              <div className="flex justify-end gap-2">
                                 <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all border-none outline-none cursor-pointer">
                                    <UserCheck className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(user._id)}
                                   className="p-3 bg-rose-50 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all border-none outline-none cursor-pointer"
                                 >
                                    <UserX className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
                  {filteredUsers.length === 0 && (
                     <tr>
                        <td colSpan="5" className="p-20 text-center">
                           <div className="flex flex-col items-center gap-4 opacity-30">
                              <Search size={48} className="text-slate-300" />
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No identities found in this sector.</p>
                           </div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminUsers;
