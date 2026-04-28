import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard, ShieldCheck, Loader2, Smartphone, Landmark,
  ArrowLeft, CheckCircle, Zap, Lock, ArrowRight, Wallet,
  Tag, Percent, Sparkles, IndianRupee, Download
} from 'lucide-react';
import { api } from '../../api';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const STEPS = [
  { id: 'init',       label: 'Uplinking to NPCI Protocol', icon: Zap },
  { id: 'auth',       label: 'BHIM Auth Node Synchronizing',    icon: Lock },
  { id: 'processing', label: 'Processing UPI Payload',         icon: Loader2 },
  { id: 'confirming', label: 'Settlement Ledger Verification',     icon: ShieldCheck },
  { id: 'done',       label: 'Transaction Finalized',            icon: CheckCircle },
];

const Checkout = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const location      = useLocation();
  const searchParams  = new URLSearchParams(location.search);
  const selectedStudentId = searchParams.get('studentId');

  const [project, setProject]               = useState(null);
  const [loading, setLoading]               = useState(true);
  const [method, setMethod]                 = useState('upi');
  const [upiId, setUpiId]                   = useState('');
  const [bank, setBank]                     = useState('');
  const [upiApp, setUpiApp]                 = useState('');
  const [promoCode, setPromoCode]           = useState('');
  const [appliedPromo, setAppliedPromo]     = useState(null);
  const [promoError, setPromoError]         = useState('');
  const [step, setStep]                     = useState(null); // null | step-id | 'done'
  const [txnId, setTxnId]                   = useState('');
  const [error, setError]                   = useState('');
  const [submitting, setSubmitting]         = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.getProjectById(id);
        setProject(data);
        
        // ── Strategic Lock Check ──
        if (data.status !== 'review' && data.status !== 'completed') {
           setError('Strategic Lock: This mission has not been submitted for final audit yet. Payout protocol is currently offline.');
        }
      } catch (err) {
        console.error(err);
        try {
          const all = await api.getProjects();
          const found = all.find(p => p._id === id);
          if (found) { setProject(found); }
          else { navigate('/client-dashboard/projects'); }
        } catch { navigate('/client-dashboard/projects'); }
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, navigate]);

  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'LOCAL50')  setAppliedPromo({ code, discountPercent: 50 });
    else if (code === 'STUDENT') setAppliedPromo({ code, discountPercent: 100 });
    else if (code === 'LOCALDEV10') setAppliedPromo({ code, discountPercent: 100, label: 'Zero Platform Fee' });
    else { setPromoError('Invalid promo code. Try LOCALDEV10 or LOCAL50.'); setAppliedPromo(null); }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    if (method === 'upi' && !upiApp && !upiId) { setError('Please select a UPI app or enter your UPI ID.'); return; }
    if (method === 'netbanking' && !bank) { setError('Please select a bank.'); return; }

    for (const s of STEPS) {
      setStep(s.id);
      await sleep(s.id === 'processing' ? 200 : 100);
    }

    try {
      setSubmitting(true);
      const studentId = selectedStudentId
        || project.developer?._id
        || project.developer
        || project.applicants?.[0]?._id
        || project.applicants?.[0]
        || null;

      const data = await api.processCheckout({
        projectId: project._id,
        studentId,
        amount: finalTotal,
        method
      });

      setTxnId(data.payment?.transactionId || `TXN-${Date.now()}`);
      setStep('success');
    } catch (err) {
      console.error(err);
      setStep(null);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center items-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
  if (!project) return null;

  const budget          = parseFloat(project.budget) || 0;
  const platformFee     = budget * 0.10;
  const promoDiscount   = appliedPromo ? platformFee * (appliedPromo.discountPercent / 100) : 0;
  const finalPlatformFee = platformFee - promoDiscount;
  const finalTotal      = budget + finalPlatformFee;

  const upiUrl = `upi://pay?pa=bharathguguloth735@ybl&pn=LocalDev%20Checkout&am=${finalTotal}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const upiApps = [
    { id: 'gpay',   label: 'GPay',    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg' },
    { id: 'phonepe',label: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
    { id: 'paytm',  label: 'Paytm',   logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
    { id: 'bhim',   label: 'BHIM',    logo: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23f97316"/><circle cx="50" cy="50" r="38" fill="white"/><text x="50" y="58" font-family="Arial" font-weight="900" font-size="24" fill="%2315803d" text-anchor="middle">BHIM</text></svg>` },
  ];

  const banks = ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak', 'PNB', 'Bank of Baroda', 'Yes Bank'];

  if (step === 'success') {
    return (
      <div className="p-8 max-w-xl mx-auto w-full py-16 animate-[fade-in_0.5s]">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #printable-receipt, #printable-receipt * { visibility: visible; }
            #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none; shadow: none; }
          }
        `}</style>
        <div id="printable-receipt" className="bg-white rounded-[40px] border border-slate-100 shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] overflow-hidden relative">
          <div className="bg-emerald-500 p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest">Payment Success</h2>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">LocalDev Technologies NPCI Node</p>
             </div>
          </div>
          
          <div className="p-10 space-y-6">
             <div className="text-center">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">₹{finalTotal.toLocaleString()}</span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Authorized by LocalDev Technologies</p>
             </div>

             <div className="h-px bg-slate-100 border-dashed border-b border-slate-200" />

             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Transaction ID</span>
                   <span className="font-mono font-black text-slate-700 tracking-tighter">{txnId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Bank Ref No.</span>
                   <span className="font-mono font-black text-slate-700 tracking-tighter">NPCI-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Status</span>
                   <span className="text-emerald-600 font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">Settled Full</span>
                </div>
             </div>

             <div className="bg-slate-50 rounded-3xl p-6 space-y-3">
                <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">To Project</span>
                   <span className="font-black text-slate-900 text-right max-w-[60%] line-clamp-1">{project.title}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Direct Payout</span>
                   <span className="font-black text-slate-900">₹{budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500 font-bold uppercase tracking-widest">Network Fee</span>
                   <span className="font-black text-slate-900">₹{finalPlatformFee.toLocaleString()}</span>
                </div>
             </div>

             <div className="flex gap-3 pt-4 no-print">
               <button
                 onClick={() => navigate('/client-dashboard/projects')}
                 className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-colors text-[10px] uppercase tracking-widest"
               >
                 My Ventures
               </button>
               <button
                 onClick={() => window.print()}
                 className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-colors text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <Download className="w-3.5 h-3.5" /> Save Receipt
               </button>
             </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-8 no-print">
           <ShieldCheck className="w-4 h-4 text-slate-300" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NPCI Authenticated Transaction</p>
        </div>
      </div>
    );
  }

  if (step !== null) {
    return (
      <div className="p-8 max-w-md mx-auto w-full py-16 animate-[fade-in_0.3s]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">NPCI Processing Gateway</h2>
          <p className="text-slate-500 font-bold mt-1 text-sm">₹{finalTotal.toLocaleString()} Payload Integration</p>
        </div>

        <div className="space-y-3">
          {STEPS.map((s, i) => {
            const Icon    = s.icon;
            const isActive = s.id === step;
            const isDone   = i < stepIndex && step !== 'success';
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-500
                  ${isActive ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                    : isDone ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-transparent'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors
                  ${isActive ? 'bg-indigo-600' : isDone ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  {isDone
                    ? <CheckCircle className="w-5 h-5 text-white" />
                    : <Icon className={`w-5 h-5 text-white ${isActive && s.id === 'processing' ? 'animate-spin' : ''}`} />
                  }
                </div>
                <span className={`font-black text-sm flex-1
                  ${isActive ? 'text-indigo-700' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
                {isActive && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                {isDone   && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full animate-[fade-in_0.3s]">
      <button onClick={() => navigate('/client-dashboard/projects')} className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 mb-7">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="mb-7">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Checkout</h1>
        <p className="text-slate-500 font-bold text-sm mt-1">Settling mission payload for <span className="text-slate-800">{project.title}</span></p>
      </div>

      <form onSubmit={handlePay} className="grid lg:grid-cols-12 gap-7">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border-2 border-slate-100 rounded-[28px] p-6 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)]">
            <h2 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-indigo-500" /> Order Summary
            </h2>
            <div className="bg-indigo-50 rounded-2xl p-4 mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Project</p>
              <p className="font-black text-slate-900">{project.title}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Developer Payout</span>
                <span className="font-black text-slate-900">₹{budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-bold">
                <span>Network Fee</span>
                <span className="font-black text-slate-900">₹{finalPlatformFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t-2 border-slate-100 flex justify-between items-center text-2xl font-black text-indigo-700">
              <span className="text-slate-900 text-lg">Total</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-[28px] p-6 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-black text-slate-900 text-base flex items-center gap-2"><Tag className="w-5 h-5 text-pink-500" /> Promo Code</h2>
              <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Zero Platform Fee</span>
            </div>
            {!appliedPromo ? (
              <div className="flex gap-2">
                <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="LOCALDEV10 (0% FEES)" className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold uppercase outline-none focus:border-indigo-500" />
                <button type="button" onClick={handleApplyPromo} className="px-5 py-3 bg-slate-900 text-white font-black rounded-xl text-sm transition-colors">Apply</button>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                   <p className="font-black text-emerald-800 text-sm">"{appliedPromo.code}" Active!</p>
                   <p className="text-xs text-emerald-600 font-bold">Zero Fee Clearance</p>
                </div>
                <button type="button" onClick={() => setAppliedPromo(null)} className="text-xs font-black text-red-400">Remove</button>
              </div>
            )}
            {promoError && <p className="text-red-500 text-xs font-bold mt-2">{promoError}</p>}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border-2 border-slate-100 rounded-[28px] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.1)] flex flex-col overflow-hidden">
          <div className="flex border-b-2 border-slate-100">
            {[{ id: 'upi', icon: Smartphone, label: 'UPI' }, { id: 'card', icon: CreditCard, label: 'Card' }, { id: 'netbanking', icon: Landmark, label: 'Net Banking' }].map(m => (
              <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-black border-b-4 transition-all ${method === m.id ? 'border-indigo-600 text-indigo-700 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}>
                <m.icon className="w-4 h-4" /> {m.label}
              </button>
            ))}
          </div>

          <div className="p-8 flex-1">
            {method === 'upi' && (
              <div className="animate-[fade-in_0.2s]">
                <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-8 rounded-[40px] border border-slate-100 mb-8">
                  <div className="w-48 h-48 bg-white p-4 rounded-3xl border border-slate-200 shadow-xl flex items-center justify-center shrink-0">
                    <img src={qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="text-center md:text-left">
                     <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white px-4 py-1 rounded-full border border-indigo-100 mb-3 inline-block">NPCI Secure Node</span>
                     <h4 className="text-xl font-black text-slate-900 line-clamp-2 leading-none mb-4 tracking-tighter uppercase">Scan to authorize Payload</h4>
                     <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">Direct settlement via any UPI protocol. Encrypted P2P tunnel established.</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {upiApps.map(app => (
                    <button key={app.id} type="button" onClick={() => setUpiApp(app.id)} className={`flex flex-col items-center gap-2 py-5 rounded-[24px] border-2 transition-all ${upiApp === app.id ? 'border-indigo-500 bg-indigo-50 shadow-lg' : 'border-slate-100 hover:border-slate-300'}`}>
                       <img src={app.logo} alt={app.label} className="w-10 h-10 object-contain rounded-full shadow-sm bg-white p-1" />
                       <span className="text-[10px] font-black text-slate-700">{app.label}</span>
                    </button>
                  ))}
                </div>
                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="Enter BHIM / UPI ID" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all font-mono uppercase tracking-widest" />
              </div>
            )}
            
            {method === 'card' && (
              <div className="space-y-5 animate-[fade-in_0.2s]">
                 <div className="relative">
                   <CreditCard className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                   <input type="text" placeholder="Card Number" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-mono tracking-[0.2em] outline-none focus:border-indigo-500" />
                 </div>
                 <input type="text" placeholder="Card Holder Name" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black uppercase tracking-widest outline-none focus:border-indigo-500" />
                 <div className="grid grid-cols-2 gap-5">
                    <input type="text" placeholder="MM/YY" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-mono tracking-widest outline-none focus:border-indigo-500" />
                    <input type="password" placeholder="CVV" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-mono tracking-widest outline-none focus:border-indigo-500" />
                 </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="animate-[fade-in_0.2s]">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {banks.map(b => (
                    <button key={b} type="button" onClick={() => setBank(b)} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 font-black text-xs transition-all ${bank === b ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-50 hover:border-slate-200 text-slate-500'}`}>
                      <Landmark className="w-4 h-4 opacity-30" /> {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="mt-6 text-red-500 text-xs font-black bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
            
            <div className="mt-10 pt-6 border-t border-slate-100">
               <button 
                type="submit" 
                disabled={project.status !== 'review' || !!error || submitting}
                className={`w-full py-5 text-white font-black rounded-3xl shadow-2xl flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]
                  ${project.status === 'review' ? 'bg-slate-950 hover:bg-indigo-600' : 'bg-slate-300 cursor-not-allowed grayscale'}`}
               >
                 <Zap className="w-5 h-5 fill-white" /> {project.status === 'review' ? `Pay ₹${finalTotal.toLocaleString()} Securely` : 'Awaiting Submission'} <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
