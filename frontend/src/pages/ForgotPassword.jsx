import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.forgotPassword(email);
      setSuccess('Verification code sent to your email.');
      setStep(2);
    } catch (err) {
      try { setError(JSON.parse(err.message).message); }
      catch { setError('Failed to send verification code.'); }
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanOtp = (otp || '').replace(/\s/g, '');
    if (cleanOtp.length < 6) { setError('Please enter the 6-digit code.'); return; }
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    
    setLoading(true);
    setError('');
    try {
      await api.resetPassword(email, cleanOtp, newPassword);
      setSuccess('Password reset successfully. You can now sign in.');
      setTimeout(() => navigate('/login'), 500);
    } catch (err) {
      try { setError(JSON.parse(err.message).message); }
      catch { setError('Failed to reset password.'); }
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, index) => {
    if (isNaN(val)) return;
    let currentOtp = (otp || '').padEnd(6, ' ').split('');
    currentOtp[index] = val || ' ';
    setOtp(currentOtp.join(''));
    if (val !== '' && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!e.target.value && index > 0) document.getElementById(`otp-${index - 1}`).focus();
      let currentOtp = (otp || '').padEnd(6, ' ').split('');
      currentOtp[index] = ' ';
      setOtp(currentOtp.join(''));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-transparent">
      <div className="bg-white w-full max-w-md shadow-[0_60px_120px_-20px_rgba(220,38,38,0.15)] rounded-3xl p-8 md:p-12 relative overflow-hidden border border-slate-100 mt-20">
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-2 font-heading">Reset Password</h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <input type="email" placeholder="Email Address" required
                className="w-full bg-slate-100 border-none px-5 py-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <button type="submit" disabled={loading}
              className="mt-8 w-full bg-red-600 text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Reset Code'}
            </button>
            <Link to="/login" className="text-xs text-slate-500 mt-6 block hover:text-red-600 transition underline underline-offset-4 decoration-slate-200">
              &larr; Back to Sign In
            </Link>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-2 font-heading">Verify Code</h1>
            <p className="text-xs text-slate-500 mb-6">We sent a secure code to<br/><span className="text-slate-900 font-bold font-heading">{email}</span></p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> <span className="text-left">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-xs rounded-xl border border-emerald-100 flex items-center justify-center gap-2 font-medium">
                {success}
              </div>
            )}

            <div className="flex justify-center gap-1 sm:gap-2 mb-6">
              {[...Array(6)].map((_, i) => (
                <input key={i} id={`otp-${i}`} type="text" maxLength="1"
                  className="w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-center text-lg md:text-xl font-bold bg-slate-100 border-none rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
                  value={otp[i]?.trim() || ''} onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleOtpKeyDown(e, i)} />
              ))}
            </div>

            <div className="relative mb-8">
              <input type={showPassword ? 'text' : 'password'} placeholder="New Password" required
                className="w-full bg-slate-100 border-none px-5 py-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner pr-12"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button type="submit" disabled={loading || (otp || '').replace(/\s/g, '').length < 6 || !newPassword}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-full font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-red-500/30 active:scale-95 disabled:opacity-50">
              {loading && !success ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Reset Password'}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }} className="mt-8 text-xs text-slate-400 hover:text-slate-900 transition underline underline-offset-4 font-medium">
              &larr; Try another email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
