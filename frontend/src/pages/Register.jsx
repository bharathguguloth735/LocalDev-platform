import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import { KeyRound, ArrowRight, ShieldCheck, Mail, Lock, User, Ghost, Loader2, Zap } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    role: 'client',
    otp: ''
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    let currentOtp = (formData.otp || '').padEnd(6, ' ').split('');
    currentOtp[index] = element.value || ' ';
    const newOtp = currentOtp.join('');
    setFormData({ ...formData, otp: newOtp });
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!e.target.value && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
      let currentOtp = (formData.otp || '').padEnd(6, ' ').split('');
      currentOtp[index] = ' ';
      setFormData({ ...formData, otp: currentOtp.join('') });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.sendOtp(formData.email);
      setStep(2);
    } catch (err) {
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.message || 'Failed to send protocol key.');
      } catch {
        setError('Signal lost. Is the command server running?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = { ...formData, otp: formData.otp.replace(/\s/g, '') };
      const res = await api.register(payload);
      localStorage.setItem('token', res.token);
      if (res.sessionId) localStorage.setItem('sessionId', res.sessionId);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      if (res.user.role === 'student') navigate('/student-dashboard');
      else navigate('/client-dashboard');
      
    } catch (err) {
      try {
        const errorData = JSON.parse(err.message);
        setError(errorData.message || 'Registration failure.');
      } catch {
        setError('Decryption failed. Validate your protocol key.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.googleAuth({ credential: response.credential, role: formData.role });
      localStorage.setItem('token', res.token);
      if (res.sessionId) localStorage.setItem('sessionId', res.sessionId);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      if (res.user.role === 'student') navigate('/student-dashboard');
      else navigate('/client-dashboard');
    } catch (err) {
      setError('Google network link failed. Manual override required.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-12 bg-slate-50/50">
      <div className="bg-white p-10 rounded-[48px] shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden flex flex-col">
        
        {/* Abstract design elements */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="absolute top-10 left-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
          >
            ← Back
          </button>
        )}

        <div className="flex justify-center mb-6">
           <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-sm border border-primary/5">
              <Zap className="w-8 h-8 fill-primary/20" />
           </div>
        </div>

        <h2 className="text-3xl font-black font-heading mb-2 text-center text-slate-900 tracking-tighter">
          {step === 1 ? 'Join the Matrix' : 'Verify Identity'}
        </h2>
        <p className="text-center text-slate-400 font-bold text-xs mb-8 uppercase tracking-widest leading-loose">
          {step === 1 ? 'Elite Developer Marketplace' : `Signal sent to ${formData.email}`}
        </p>
        
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-3">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> {error}
          </div>
        )}
        
        {step === 1 ? (
          <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">First Name</label>
                <input 
                  type="text" required
                  placeholder="Lex"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Last Name</label>
                <input 
                  type="text" required
                  placeholder="Luthor"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Gmail Protocol</label>
                <input 
                  type="email" required
                  placeholder="identity@gmail.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Set Keycode</label>
                <input 
                  type="password" required
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-slate-700"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-slate-400 ml-1 tracking-widest">Mission Role</label>
                <select 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer font-bold text-slate-700"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="client">Client (Hire Operatives)</option>
                  <option value="student">Student (Development Specialist)</option>
                </select>
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-[0.25em] text-[11px] transition-all mt-4 flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/10 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Obtain Signal Key <ArrowRight className="w-4 h-4"/></>}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]"><span className="bg-white px-4 text-slate-300">Alternate Authorization</span></div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Third-party link failed.')}
                useOneTap
                shape="pill"
                theme="filled_blue"
                text="continue_with"
                width="100%"
              />
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> End-to-End Encrypted Link
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-8 animate-[fade-in_0.5s] py-4">
            <div className="bg-indigo-50/50 text-indigo-700 p-6 rounded-3xl text-xs font-bold border border-indigo-100 flex items-start gap-4 shadow-sm">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-indigo-50">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <p className="leading-relaxed">A 6-digit signal key has been transmitted to <strong className="text-slate-900">{formData.email}</strong>. Enter it below to verify your operative status.</p>
            </div>

            <div className="flex justify-center gap-3 px-2">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-16 text-center text-2xl font-black bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all focus:bg-white focus:shadow-sm"
                  value={formData.otp[index]?.trim() || ''}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                />
              ))}
            </div>

            <button 
              type="submit" disabled={loading || (formData.otp || '').replace(/\s/g, '').length < 6}
              className="w-full bg-slate-900 hover:bg-primary text-white py-5 rounded-[24px] font-black uppercase tracking-[0.25em] text-[11px] transition-all shadow-2xl shadow-slate-900/10 active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Validate Operative ID</>}
            </button>
            <div className="text-center">
               <button onClick={handleSendOtp} type="button" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline underline-offset-4">Resend Protocol Key</button>
            </div>
          </form>
        )}
        
        {step === 1 && (
          <p className="text-center text-xs font-bold text-slate-500 mt-10">
            Already Synced? <Link to="/login" className="text-primary hover:underline font-black uppercase tracking-widest ml-1">Access Terminal</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
