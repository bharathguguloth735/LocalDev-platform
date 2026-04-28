import Footer from '../../components/landing/Footer';
import { Check, Star, Sparkles, ArrowRight, Lock, Loader2, X, Smartphone, CreditCard, Landmark, ShieldCheck, CheckCircle, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useUserStore from '../../store/useUserStore';
import { api } from '../../api';

const PLANS = {
  free: { name: 'Pay As You Go', price: 0, priceINR: 0 },
  pro: { name: 'Business Pro', price: 2199, priceINR: 2199 },
  enterprise: { name: 'Enterprise Hub', price: 3199, priceINR: 3199 },
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const Pricing = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  // ── Payment Modal State ──
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payMethod, setPayMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [upiApp, setUpiApp] = useState('');
  const [bank, setBank] = useState('');
  const [payStep, setPayStep] = useState(null); // null | 'processing' | 'success'
  const [payError, setPayError] = useState('');

  // Fallback: read user from localStorage if Zustand is empty
  const resolvedUser = user || (() => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; } catch { return null; }
  })();

  const currentPlan = resolvedUser?.plan || 'free';

  const openPayment = (plan) => {
    if (!resolvedUser) { navigate('/register'); return; }
    if (currentPlan === plan) return;
    setSelectedPlan(plan);
    setPayStep(null);
    setPayError('');
    setUpiId('');
    setUpiApp('');
    setBank('');
    setPayMethod('upi');
    setShowModal(true);
  };

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setPayError('');
    
    // If it's not UPI/Card/Netbanking (the manual UI), but we want to use Razorpay popup:
    setPayStep('processing');
    
    try {
      const planInfo = PLANS[selectedPlan];
      
      // 1. Create order on backend
      const order = await api.createSimulatedOrder({ 
        amount: planInfo.priceINR, 
        isSubscription: true 
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: 'rzp_test_Sh50bW9xKUqb7E', // Using the test key from .env
        amount: order.amount,
        currency: order.currency,
        name: 'LocalDev Connect',
        description: `Upgrade to ${planInfo.name}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            // In a real app, verify signature here. For now, update profile.
            const userId = resolvedUser.id || resolvedUser._id;
            const res = await api.updateProfile(userId, { 
              plan: selectedPlan,
              paymentId: response.razorpay_payment_id
            });
            
            setUser(res);
            localStorage.setItem('user', JSON.stringify(res));
            window.dispatchEvent(new Event('userUpdated'));
            setPayStep('success');
          } catch (err) {
            setPayError('Failed to update account. Please contact support.');
            setPayStep(null);
          }
        },
        prefill: {
          name: resolvedUser.name,
          email: resolvedUser.email
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setPayError(resp.error.description || 'Payment failed.');
        setPayStep(null);
      });
      
      // Handle modal dismissal (user closes the Razorpay window)
      rzp.on('modal.ondismiss', () => {
        setPayStep(null);
        setPayError('Payment was cancelled.');
      });

      rzp.open();
      
    } catch (err) {
      console.error(err);
      setPayStep(null);
      setPayError(err.message || 'Could not initiate payment.');
    }
  };

  const planInfo = selectedPlan ? PLANS[selectedPlan] : null;
  const upiUrl = planInfo ? `upi://pay?pa=bharathguguloth735@ybl&pn=LocalDev%20Subscription&am=${planInfo.priceINR}&cu=INR` : '';
  const qrCodeUrl = planInfo ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}` : '';

  const upiApps = [
    { id: 'gpay', label: 'GPay', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
    { id: 'phonepe', label: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
    { id: 'paytm', label: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
    { id: 'bhim', label: 'BHIM', logo: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23f97316"/><circle cx="50" cy="50" r="38" fill="white"/><text x="50" y="58" font-family="Arial" font-weight="900" font-size="24" fill="%2315803d" text-anchor="middle">BHIM</text></svg>` },
  ];
  const banks = ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak', 'PNB', 'Bank of Baroda', 'Yes Bank'];

  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50">
      <div className="flex-grow pt-32 pb-20 max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Exclusive Infrastructure
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pricing</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">No hidden fees, no agency markups. Pay directly for the talent you hire, protected by our Smart Escrow.</p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className={`bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] border flex flex-col transition-all ${currentPlan === 'free' ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-200'}`}>
            <div className="flex-grow">
              <div className="text-slate-500 font-bold tracking-widest uppercase text-[10px] mb-4">Pay As You Go</div>
              <div className="flex items-baseline gap-2 mb-6"><span className="text-5xl font-black text-slate-900">₹0</span><span className="text-slate-500 font-medium text-sm">/month</span></div>
              <p className="text-slate-600 text-sm mb-8 border-b border-slate-100 pb-8">Perfect for single projects and small gigs.</p>
              <ul className="space-y-4 mb-8">
                {['Access to all students', 'Standard Matchmaking', 'Basic Escrow Protection', '10% Platform Fee'].map(f => (
                  <li key={f} className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500" /><span className="text-slate-700 text-sm font-medium">{f}</span></li>
                ))}
              </ul>
            </div>
            <button disabled className="w-full py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl bg-indigo-50 text-indigo-600 cursor-default">
              {currentPlan === 'free' ? 'Current Plan' : 'Free Tier'}
            </button>
          </div>

          {/* Pro Tier */}
          <div className={`bg-slate-950 rounded-[2.5rem] p-8 shadow-[0_60px_120px_-20px_rgba(79,70,229,0.3)] border relative md:-translate-y-4 z-10 overflow-hidden flex flex-col transition-all ${currentPlan === 'pro' ? 'border-indigo-400 ring-4 ring-indigo-500/20' : 'border-slate-800'}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-[80px] rounded-full opacity-30" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2 rounded-b-2xl shadow-lg">Most Popular</div>
            <div className="flex-grow">
              <div className="text-indigo-400 font-bold tracking-widest uppercase text-[10px] mb-4 mt-4 flex items-center gap-2"><Star className="w-3 h-3 fill-indigo-400" /> Business Pro</div>
              <div className="flex items-baseline gap-2 mb-6 text-white"><span className="text-6xl font-black tracking-tighter">₹2199</span><span className="text-slate-400 font-medium text-sm">/month</span></div>
              <p className="text-slate-400 text-sm mb-8 border-b border-slate-800 pb-8">For growing businesses needing continuous dev support.</p>
              <ul className="space-y-4 mb-8 text-slate-300">
                {['Premium AI Matching', 'Priority Developer Access', 'Dedicated Support Agent', 'Reduced 4% Platform Fee'].map(f => (
                  <li key={f} className="flex items-center gap-3"><Check className="w-4 h-4 text-indigo-400" /><span className="text-sm font-medium">{f}</span></li>
                ))}
              </ul>
            </div>
            <button disabled={currentPlan === 'pro'} onClick={() => openPayment('pro')}
              className={`w-full py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
                ${currentPlan === 'pro' ? 'bg-slate-800 text-indigo-300 cursor-default shadow-none' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25 hover:-translate-y-0.5'}`}>
              {currentPlan === 'pro' ? 'Current Plan' : <>Upgrade to Pro <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className={`bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] border flex flex-col transition-all ${currentPlan === 'enterprise' ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-200'}`}>
            <div className="flex-grow">
              <div className="text-slate-500 font-bold tracking-widest uppercase text-[10px] mb-4">Enterprise Hub</div>
              <div className="flex items-baseline gap-2 mb-6"><span className="text-5xl font-black text-slate-900">₹3199</span><span className="text-slate-500 font-medium text-sm">/month</span></div>
              <p className="text-slate-600 text-sm mb-8 border-b border-slate-100 pb-8">For agencies building entire teams of students.</p>
              <ul className="space-y-4 mb-8">
                {['Unlimited Active Projects', '0% Platform Fee', 'White-label Invoicing', 'Custom NDA Contracts'].map(f => (
                  <li key={f} className="flex items-center gap-3"><Check className="w-4 h-4 text-indigo-600" /><span className="text-slate-700 text-sm font-medium">{f}</span></li>
                ))}
              </ul>
            </div>
            <button disabled={currentPlan === 'enterprise'} onClick={() => openPayment('enterprise')}
              className={`w-full py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 shadow-lg
                ${currentPlan === 'enterprise' ? 'bg-indigo-50 text-indigo-600 cursor-default shadow-none' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              {currentPlan === 'enterprise' ? 'Current Plan' : <>Upgrade to Enterprise <ArrowRight className="w-4 h-4 inline ml-2" /></>}
            </button>
          </div>
        </div>

        {resolvedUser?.role === 'student' && (
          <div className="max-w-xl mx-auto mt-16 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-center gap-6">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0"><Lock className="w-6 h-6 text-amber-600" /></div>
            <div>
              <h4 className="font-black text-amber-900 uppercase tracking-widest text-xs">Note to Students</h4>
              <p className="text-amber-700 text-[11px] font-medium leading-relaxed mt-1">Subscription plans are for business clients. As a student, you have unlimited free access to apply for any mission.</p>
            </div>
          </div>
        )}

        <div className="flex justify-center w-full mt-12 mb-4">
          <Link to="/" className="px-8 py-3 bg-white border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center gap-2">&larr; Go Back to Home</Link>
        </div>
      </div>
      <Footer />

      {/* ══════════════ PAYMENT MODAL ══════════════ */}
      {showModal && planInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none" onClick={() => { if (payStep !== 'processing') setShowModal(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[2rem] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>

            {/* Close */}
            {payStep !== 'processing' && (
              <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 z-50 w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 flex items-center justify-center transition-colors group">
                <X className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
              </button>
            )}

            {/* ── SUCCESS ── */}
            {payStep === 'success' ? (
              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-100">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Upgrade Successful!</h2>
                <p className="text-slate-500 text-sm">You are now on the <span className="font-black text-indigo-600">{planInfo.name}</span> plan.</p>
                <div className="bg-slate-50 rounded-2xl p-5 space-y-2 text-left">
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold uppercase tracking-widest">Plan</span><span className="font-black text-slate-900">{planInfo.name}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold uppercase tracking-widest">Amount</span><span className="font-black text-slate-900">₹{planInfo.priceINR.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold uppercase tracking-widest">Status</span><span className="text-emerald-600 font-black">Confirmed</span></div>
                </div>
                <button onClick={() => { setShowModal(false); navigate(resolvedUser?.role === 'student' ? '/student-dashboard' : '/client-dashboard'); }}
                  className="w-full py-4 bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-indigo-600 transition-all active:scale-95">
                  Go to Dashboard
                </button>
              </div>
            ) : payStep === 'processing' ? (
              /* ── PROCESSING ── */
              <div className="p-10 text-center space-y-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
                <h2 className="text-xl font-black text-slate-900">Processing Payment</h2>
                <p className="text-slate-500 text-sm">Authorizing ₹{planInfo.priceINR.toLocaleString()} for {planInfo.name}...</p>
                <div className="space-y-3">
                  {['Connecting to NPCI', 'Verifying Payment', 'Upgrading Account'].map((s, i) => (
                    <div key={s} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span className="text-indigo-700 font-bold text-xs">{s}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => { setPayStep(null); setPayError('Transaction aborted by user.'); }}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                  Cancel & Go Back
                </button>
              </div>
            ) : (
              /* ── PAYMENT FORM ── */
              <>
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white relative overflow-hidden rounded-t-[2rem]">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-2">Upgrade Subscription</p>
                    <h2 className="text-2xl font-black">{planInfo.name}</h2>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-black">₹{planInfo.priceINR.toLocaleString()}</span>
                      <span className="text-indigo-200 text-sm font-medium">/month</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Plan Benefits</h4>
                    <ul className="space-y-3">
                      {['Priority Support', 'Reduced Platform Fees', 'Advanced Matchmaking'].map(f => (
                        <li key={f} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {payError && <p className="text-red-500 text-xs font-black bg-red-50 p-4 rounded-xl border border-red-100">{payError}</p>}

                  <button 
                    onClick={handlePay}
                    disabled={payStep === 'processing'}
                    className="w-full py-5 bg-slate-950 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]">
                    <Zap className="w-5 h-5 fill-white" /> {payStep === 'processing' ? 'Opening Gateway...' : `Pay ₹${planInfo.priceINR.toLocaleString()} via Razorpay`} <ArrowRight className="w-5 h-5" />
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <ShieldCheck className="w-4 h-4 text-slate-300" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Razorpay Integration • 256-bit SSL</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pricing;
