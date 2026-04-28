import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.login(email, password);
      localStorage.setItem('token', res.token);
      if (res.sessionId) localStorage.setItem('sessionId', res.sessionId);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      if (res.user.role === 'student') navigate('/student-dashboard');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/client-dashboard');
    } catch (err) {
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.message || 'Login failed.');
      } catch {
        setError('Login failed. Check your credentials or server status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      // Send the credential (ID Token) to our backend
      const res = await api.googleAuth({ credential: response.credential });
      localStorage.setItem('token', res.token);
      if (res.sessionId) localStorage.setItem('sessionId', res.sessionId);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      if (res.user.role === 'student') navigate('/student-dashboard');
      else if (res.user.role === 'admin') navigate('/admin');
      else navigate('/client-dashboard');
    } catch (err) {
      setError('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 bg-slate-50/50">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100 flex flex-col relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="flex justify-center mb-6">
           <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/5">
              <Zap className="w-8 h-8 fill-primary/10" />
           </div>
        </div>

        <h2 className="text-3xl font-black font-heading tracking-tighter text-slate-900 text-center mb-2">Welcome Back</h2>
        <p className="text-slate-500 font-bold text-sm text-center mb-8 uppercase tracking-widest flex items-center justify-center gap-2">
           <ShieldCheck className="w-4 h-4 text-emerald-500" /> Neural Link Active
        </p>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gmail Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                placeholder="operative@gmail.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</label>
              <Link to="/forgot-password-placeholder" className="text-[10px] font-black uppercase text-primary hover:underline">Lost Protocol?</Link>
            </div>
            <div className="relative">
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all mt-2 shadow-2xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Console <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="bg-white px-6 text-slate-300">Third-Party Link</span></div>
        </div>

        <div className="flex justify-center flex-col items-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-In was cancelled')}
            useOneTap
            shape="pill"
            theme="filled_blue"
            text="signin_with"
            size="large"
            width="100%"
          />
          <p className="text-[9px] font-black uppercase text-slate-400 mt-4 tracking-widest text-center">Secure 256-Bit Encrypted Google Protocol</p>
        </div>
        
        <p className="text-center text-xs font-bold text-slate-500 mt-10">
          New Operative? <Link to="/register" className="text-primary hover:underline font-black uppercase tracking-widest ml-1">Register Interface</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
