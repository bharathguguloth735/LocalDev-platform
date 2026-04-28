import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Eye, EyeOff, AlertCircle, Shield, Zap, Mail, User, ArrowRight, CheckCircle, X, KeyRound, Sparkles, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import { connectSocket } from '../socket';
import useUserStore from '../store/useUserStore';

const Auth = () => {
  const { setUser } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1=details, 2=otp, 3=role

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regData, setRegData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'client', otp: ''
  });

  useEffect(() => {
    setIsSignUp(location.pathname === '/register');
    setStep(1);
    setError('');
  }, [location.pathname]);

  const togglePanel = (toSignUp) => {
    setIsSignUp(toSignUp);
    setError('');
    setStep(1);
    navigate(toSignUp ? '/register' : '/login', { replace: true });
  };

  // ── STEP 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!regData.firstName.trim() || !regData.email.trim() || !regData.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (regData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true); setError('');
    try {
      await api.sendOtp(regData.email);
      setStep(2);
    } catch (err) {
      setError(parseError(err));
    } finally { setLoading(false); }
  };

  // ── STEP 2: Verify OTP → Register → Go to role selection ─────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = (regData.otp || '').replace(/\s/g, '');
    if (cleanOtp.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setLoading(true); setError('');
    try {
      // Register the user with default role — role is updated in step 3
      const res = await api.register({
        firstName: regData.firstName,
        lastName: regData.lastName,
        email: regData.email,
        password: regData.password,
        role: 'client', // temp default, overwritten in step 3
        otp: cleanOtp
      });
      // Store token immediately so updateRole can auth
      localStorage.setItem('token', res.token);
      if (res.sessionId) localStorage.setItem('sessionId', res.sessionId);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user); // Sync Zustand Store
      setStep(3);
    } catch (err) {
      setError(parseError(err));
    } finally { setLoading(false); }
  };

  // ── STEP 3: Finalize role ─────────────────────────────────────────────────
  const handleFinalizeRole = async (selectedRole) => {
    setLoading(true); setError('');
    try {
      const res = await api.updateRole(selectedRole);
      handleAuthSuccess(res);
    } catch (err) {
      // updateRole failed — use stored token and navigate manually
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.role = selectedRole;
      storedUser.onboarded = true;
      localStorage.setItem('user', JSON.stringify(storedUser));
      setUser(storedUser); // Sync Zustand Store
      connectSocket(storedUser.id);
      window.dispatchEvent(new Event('userUpdated'));
      navigate(selectedRole === 'student' ? '/student-dashboard' : '/client-dashboard');
    } finally { setLoading(false); }
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.login(loginEmail, loginPassword);
      handleAuthSuccess(res);
    } catch (err) {
      setError(parseError(err));
    } finally { setLoading(false); }
  };

  // ── GOOGLE AUTH ───────────────────────────────────────────────────────────
  const handleGoogleAuth = async (credentialOrProfile) => {
    setLoading(true); setError('');
    try {
      const res = await api.googleAuth({ credential: credentialOrProfile.credential });
      if (res.isNewUser) {
        localStorage.setItem('token', res.token);
        if (res.sessionId) localStorage.setItem('sessionId', res.sessionId);
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user); // Sync Zustand Store
        navigate('/onboarding');
      } else {
        handleAuthSuccess(res);
      }
    } catch (err) {
      setError(parseError(err));
    } finally { setLoading(false); }
  };

  const handleAuthSuccess = (res) => {
    localStorage.setItem('token', res.token);
    if (res.sessionId) localStorage.setItem('sessionId', res.sessionId);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user); // Sync Zustand Store
    connectSocket(res.user.id);
    window.dispatchEvent(new Event('userUpdated'));
    if (res.user.onboarded === false) {
      navigate('/onboarding');
    } else {
      navigate(res.user.role === 'student' ? '/student-dashboard' : (res.user.role === 'admin' ? '/admin' : '/client-dashboard'));
    }
  };

  const parseError = (err) => {
    try {
      const data = JSON.parse(err.message);
      return data.message || 'Something went wrong.';
    } catch {
      return err.message || 'Server unreachable. Try again later.';
    }
  };

  const handleOtpInput = (val, index) => {
    if (!/^\d*$/.test(val)) return;
    const current = (regData.otp || '').padEnd(6, ' ').split('');
    current[index] = val || ' ';
    setRegData({ ...regData, otp: current.join('') });
    if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !regData.otp[index]?.trim() && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans select-none overflow-hidden">
      <div className={`relative bg-white w-full max-w-4xl min-h-[600px] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.2)] rounded-[40px] overflow-hidden flex transition-all duration-700 ${isSignUp ? 'flex-row-reverse' : 'flex-row'}`}>

        {/* Close Button */}
        <Link to="/" className="absolute top-8 right-8 z-[100] w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-slate-950 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 hover:border-transparent group shadow-2xl backdrop-blur-md">
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </Link>

        {/* ── Form Side ── */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white z-20">
          <div className="max-w-sm mx-auto w-full">

            {/* ══ STEP 3: Role Selection ══ */}
            {step === 3 && isSignUp ? (
              <div className="space-y-7 animate-fade-in-up">
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-100">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">You're Verified!</h1>
                  <p className="text-slate-400 font-medium text-sm">Now choose how you'll use LocalDev Connect.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => handleFinalizeRole('client')} disabled={loading}
                    className="group flex items-center gap-5 p-6 bg-indigo-50 border-2 border-transparent hover:border-indigo-500 rounded-3xl transition-all hover:shadow-xl active:scale-95">
                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:bg-indigo-100 transition-all">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-black text-slate-900 text-sm">I'm a Client</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Hire developers & post projects</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button onClick={() => handleFinalizeRole('student')} disabled={loading}
                    className="group flex items-center gap-5 p-6 bg-violet-50 border-2 border-transparent hover:border-violet-500 rounded-3xl transition-all hover:shadow-xl active:scale-95">
                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:bg-violet-100 transition-all">
                      <Zap className="w-6 h-6 text-violet-600" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-black text-slate-900 text-sm">I'm a Student</h3>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Solve challenges & earn rewards</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>

                {loading && <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>}
                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
              </div>

            ) : (
              <>
                {/* ── Page Title ── */}
                <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">
                  {isSignUp ? (step === 1 ? 'Create Account' : 'Verify Email') : 'Welcome Back'}
                </h1>
                <p className="text-slate-400 font-medium text-sm mb-7">
                  {isSignUp
                    ? step === 1 ? 'Join LocalDev Connect for free.'
                      : `We emailed a 6-digit code to ${regData.email}`
                    : 'Log in to your workspace.'}
                </p>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                {/* ══ LOGIN FORM ══ */}
                {!isSignUp && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                      <input type="email" placeholder="you@email.com" required
                        className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white px-5 py-4 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all"
                        value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" required
                          className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-400 focus:bg-white px-5 py-4 rounded-2xl text-sm font-bold text-slate-700 outline-none transition-all"
                          value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3 mt-2">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                )}

                {/* ══ REGISTER: STEP 1 — Details ══ */}
                {isSignUp && step === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                        <input type="text" placeholder="John" required
                          className="w-full bg-slate-50 border border-slate-100 px-4 py-4 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-400 transition-all text-slate-700"
                          value={regData.firstName} onChange={e => setRegData({ ...regData, firstName: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                        <input type="text" placeholder="Doe"
                          className="w-full bg-slate-50 border border-slate-100 px-4 py-4 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-400 transition-all text-slate-700"
                          value={regData.lastName} onChange={e => setRegData({ ...regData, lastName: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input type="email" placeholder="you@email.com" required
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-400 transition-all text-slate-700"
                        value={regData.email} onChange={e => setRegData({ ...regData, email: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" required
                          className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-400 transition-all text-slate-700"
                          value={regData.password} onChange={e => setRegData({ ...regData, password: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-1">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Verification Code</>}
                    </button>
                  </form>
                )}

                {/* ══ REGISTER: STEP 2 — OTP ══ */}
                {isSignUp && step === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-center">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center ring-4 ring-indigo-100/60">
                        <KeyRound className="w-7 h-7 text-indigo-600" />
                      </div>
                    </div>

                    {/* OTP Boxes */}
                    <div className="flex justify-center gap-2">
                      {[...Array(6)].map((_, i) => (
                        <input
                          key={i} id={`otp-${i}`}
                          type="text" inputMode="numeric" maxLength="1"
                          className="w-11 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-indigo-700"
                          style={{ height: '52px' }}
                          value={regData.otp[i]?.trim() || ''}
                          onChange={e => handleOtpInput(e.target.value, i)}
                          onKeyDown={e => handleOtpKeyDown(e, i)}
                        />
                      ))}
                    </div>

                    <p className="text-center text-[11px] text-slate-400 font-semibold">
                      Didn't receive it?{' '}
                      <button type="button" onClick={() => { setStep(1); setRegData({ ...regData, otp: '' }); }}
                        className="text-indigo-600 font-black hover:underline">
                        Resend Code
                      </button>
                    </p>

                    <button type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-slate-900 hover:to-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] shadow-xl shadow-indigo-600/25 transition-all active:scale-95 flex items-center justify-center gap-3">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Verify &amp; Activate Account</>}
                    </button>
                  </form>
                )}

                {/* Google Auth — Step 1 only */}
                {step === 1 && (
                  <>
                    <div className="relative my-7">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                      <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.3em]">
                        <span className="bg-white px-6 text-slate-300">Or continue with</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-full max-w-sm">
                        <GoogleLogin onSuccess={handleGoogleAuth} shape="pill" theme="outline" size="large" width="340px" text="continue_with" />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Overlay Panel ── */}
        <div className="hidden md:flex w-1/2 relative flex-col items-center justify-center p-12 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-5">
            <h2 className="text-4xl font-black tracking-tight">
              {step === 3 ? 'Almost There!' : isSignUp ? 'Welcome Friend!' : 'Hello Again!'}
            </h2>
            <p className="text-indigo-100 font-medium max-w-xs mx-auto text-sm leading-relaxed">
              {step === 3
                ? 'Pick your role to unlock your personalized dashboard experience.'
                : isSignUp
                  ? 'Already have an account? Sign in and continue your journey.'
                  : 'New here? Sign up and start your real-time dev mission today.'}
            </p>
            {step !== 3 && (
              <button onClick={() => togglePanel(!isSignUp)}
                className="mt-4 border-2 border-white px-10 py-3 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-indigo-600 transition-all active:scale-95 shadow-xl">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
