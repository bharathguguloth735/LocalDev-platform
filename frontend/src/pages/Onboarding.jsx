import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Zap, Shield, Loader2, LogOut } from 'lucide-react';
import { api } from '../api';

const Onboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // If already onboarded, redirect to dashboard
    if (parsedUser.onboarded) {
       redirectUser(parsedUser.role);
    }
  }, [navigate]);

  const redirectUser = (role) => {
    if (role === 'student') navigate('/student-dashboard');
    else if (role === 'admin') navigate('/admin');
    else navigate('/client-dashboard');
  };

  const handleFinalizeRole = async (role) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.updateRole(role);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      redirectUser(res.user.role);
    } catch (err) {
      try {
        const data = JSON.parse(err.message);
        setError(data.message || 'Verification failed.');
      } catch {
        setError('Connection failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-2xl bg-white rounded-[48px] shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] overflow-hidden flex flex-col items-center p-12 relative border border-white/20">
        
        {/* Background Accents */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center mb-8 shadow-xl shadow-indigo-600/20 rotate-6 hover:rotate-0 transition-transform duration-500">
           <Shield className="w-10 h-10 text-white" />
        </div>

        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-heading">Identity Protocol</h1>
          <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Welcome, <span className="text-indigo-600 font-bold">{user?.name}</span>. Configure your network identity to access the terminal.
          </p>
        </div>

        {error && (
          <div className="w-full mb-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
           <button 
             onClick={() => handleFinalizeRole('client')}
             disabled={loading}
             className="relative group p-8 bg-slate-50 border-2 border-transparent hover:border-indigo-600 hover:bg-white rounded-[32px] transition-all duration-300 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] active:scale-[0.98] outline-none"
           >
              <div className="mb-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-50 transition-colors">
                <User className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 mb-1">CLIENT</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">Hiring & Projects</p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-indigo-600 rounded-full" />
              </div>
           </button>

           <button 
             onClick={() => handleFinalizeRole('student')}
             disabled={loading}
             className="relative group p-8 bg-slate-100/50 border-2 border-transparent hover:border-indigo-600 hover:bg-white rounded-[32px] transition-all duration-300 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] active:scale-[0.98] outline-none"
           >
              <div className="mb-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-indigo-50 transition-colors">
                <Zap className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 mb-1">DEVELOPER</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">Solving & Earning</p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              </div>
           </button>
        </div>

        {loading && (
          <div className="mt-8 flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <Loader2 className="w-5 h-5 animate-spin" /> Calibrating Link...
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="mt-12 text-slate-300 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 transition-colors transition-transform active:scale-95"
        >
          <LogOut className="w-3 h-3" /> Terminate Auth Session
        </button>

      </div>
    </div>
  );
};

export default Onboarding;
