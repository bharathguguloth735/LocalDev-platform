import { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Loader2, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, CheckCircle, Clock, Download, Plus, Filter, IndianRupee, X, Zap, Lock, Smartphone, Landmark, ArrowRight, Sparkles, Receipt, History, AlertCircle } from 'lucide-react';
import { api } from '../../api.js';
import { socket } from '../../socket.js';

// ── Withdrawal Modal (NPCI Outbound) ──────────────────────────────────────────
const WithdrawModal = ({ onClose, onSuccess, currentBalance, isClient }) => {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(null); // 'processing', 'confirm', 'done'

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError('Invalid amount');
    if (amt > currentBalance) return setError('Insufficient balance');
    if (!upiId.includes('@')) return setError('Enter a valid UPI ID');

    setError('');
    setLoading(true);
    setStep('processing');

    try {
      await new Promise(r => setTimeout(r, 200));
      setStep('confirm');
      await new Promise(r => setTimeout(r, 100));
      const res = await api.withdrawFunds(amt, upiId);
      setStep('done');
      onSuccess(res);
    } catch (err) {
      setError(err.message || 'Withdrawal failed. NPCI Link Interrupted.');
      setStep(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] w-full max-w-md overflow-hidden animate-[pop_0.4s] border border-slate-100 my-auto">
        {/* Header */}
        <div className="bg-indigo-600 p-6 md:p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10 flex justify-between items-center text-left">
            <div>
              <h2 className="text-lg md:text-xl font-bold">Liquidate Funds</h2>
              <p className={`text-[10px] md:text-xs mt-1 ${isClient ? 'text-rose-100' : 'text-indigo-100'}`}>Real-time NPCI Settlement</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {step === 'done' ? (
            <div className="text-center py-6 md:py-10 space-y-6 animate-[fade-in_0.3s]">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">Success!</h3>
                <p className="text-slate-500 text-xs mt-2 truncate">₹{parseFloat(amount).toLocaleString()} sent to {upiId}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl transition-all uppercase tracking-widest text-[10px]"
              >
                Close Gateway
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-[fade-in_0.3s]">
              <div>
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block text-left">Withdrawal Value (INR)</label>
                <div className="relative text-left">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-300">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 md:py-4 pl-10 pr-6 text-lg md:text-xl font-bold text-slate-900 outline-none focus:border-indigo-500 transition-all font-black"
                  />
                  <button 
                    onClick={() => setAmount(currentBalance.toString())}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] md:text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-tighter"
                  >
                    Max Out
                  </button>
                </div>
                <p className="text-[9px] md:text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-black uppercase text-left">
                  <Wallet className="w-3 h-3" /> Available: ₹{currentBalance.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block text-left">UPI Destination (ID)</label>
                <div className="relative">
                  <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    placeholder="name@bank/upi"
                    className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 md:py-4 pl-12 pr-6 text-xs md:text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 font-black uppercase tracking-tight ${isClient ? 'focus:border-rose-500' : 'focus:border-indigo-500'}`}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 text-red-600 p-3 md:p-4 rounded-2xl text-[10px] font-bold border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={loading || !amount || !upiId}
                className={`w-full py-4 md:py-5 rounded-[22px] md:rounded-[24px] font-bold uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3
                  ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : (isClient ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/30 hover:bg-slate-950' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:bg-slate-950')}`}
              >
                {step === 'processing' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> NPCI Linking...</>
                ) : step === 'confirm' ? (
                  <><ShieldCheck className="w-4 h-4" /> Finalizing Ledger...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Initialize Payout</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── BHIM/NPCI Deposit Gateway ──────────────────────────────────────────────
const DepositModal = ({ onClose, onSuccess, isClient }) => {
  const [amount, setAmount] = useState('1000');
  const [method, setMethod] = useState('upi');
  const [selectedBank, setSelectedBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(null);
  const [lastTrx, setLastTrx] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const banks = [
    { name: 'HDFC Bank', code: 'HDFC' },
    { name: 'ICICI Bank', code: 'ICICI' },
    { name: 'SBI', code: 'SBI' },
    { name: 'Axis Bank', code: 'AXIS' }
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 10) return setError('Minimum deposit is ₹10');
    setError('');
    setLoading(true);
    setStep('processing');
    
    try {
      const res = await loadRazorpayScript();
      if (!res) throw new Error('Razorpay SDK failed to load. Check your connection.');

      setStep('confirm');
      // 1. Create Order on Backend
      const order = await api.createSimulatedOrder({ amount: amt, isDeposit: true });

      // 2. Open Razorpay Checkout Window
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Sh50bW9xKUqb7E', // Test Key fallback
        amount: order.amount,
        currency: order.currency,
        name: 'LocalDev Connect',
        description: 'Wallet Capital Injection',
        order_id: order.orderId,
        handler: async function (response) {
           setStep('processing');
           try {
             const verifyRes = await api.verifyRazorpayDeposit({
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature,
               amount: amt
             });
             setLastTrx(verifyRes.transaction);
             setStep('done');
             onSuccess(verifyRes);
           } catch (err) {
             setError(err.message || 'Payment Verification Failed');
             setStep(null);
           }
        },
        prefill: {
          name: "LocalDev User",
          email: "user@localdevconnect.com"
        },
        theme: { color: isClient ? '#e11d48' : '#4f46e5' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
         setError('Payment Failed or Cancelled');
         setStep(null);
      });
      rzp.open();
      
    } catch (err) {
      setError(err.message || 'Deposit failed');
      setStep(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="bg-white rounded-[40px] shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] w-full max-w-md overflow-hidden animate-[pop_0.4s] border border-slate-100 my-auto">
        <div className="bg-slate-950 p-6 md:p-8 text-white relative">
           <div className={`absolute top-0 right-0 w-32 h-32 ${isClient ? 'bg-rose-600/20' : 'bg-indigo-600/20'} rounded-full blur-3xl`} />
           <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Smartphone className="w-5 h-5 text-rose-400" />
                 </div>
                 <div>
                    <h2 className="text-base md:text-lg font-black uppercase tracking-tight leading-none">BHIM UPI Gateway</h2>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1.5">Secure NPCI Link Active</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
           </div>
        </div>

        <div className="p-6 md:p-8">
           {step === 'done' ? (
             <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-xl shadow-emerald-500/10">
                   <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                </div>
                <div>
                   <h3 className="text-xl md:text-2xl font-black text-slate-900">Capital Injected!</h3>
                   <p className="text-slate-500 text-[10px] md:text-xs mt-2 uppercase font-bold tracking-widest">₹{amount} successfully settled to wallet</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-2xl hover:bg-slate-200 transition-all">Close</button>
                  <button 
                    onClick={() => setShowReceipt(true)}
                    className={`flex-[2] py-4 bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 ${isClient ? 'hover:bg-rose-600' : 'hover:bg-indigo-600'}`}
                  >
                    <Download className="w-3.5 h-3.5" /> Export Receipt
                  </button>
                </div>
             </div>
           ) : (
             <div className="space-y-6 md:space-y-8">
                <div className="text-center bg-slate-50/50 py-8 rounded-[32px] border border-slate-100 border-dashed">
                   <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Amount to Inject</p>
                   <div className="flex items-center justify-center gap-2 md:gap-3">
                      <span className="text-3xl md:text-4xl font-black text-slate-300">₹</span>
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        className="w-32 md:w-48 text-center text-5xl md:text-6xl font-black text-slate-900 outline-none bg-transparent" 
                      />
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">Powered by Razorpay Secure Routing</p>
                </div>

                {error && <div className={`p-3 md:p-4 rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border text-center ${isClient ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{error}</div>}

                <button onClick={handleDeposit} disabled={loading} className={`w-full py-4 md:py-5 text-white font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] rounded-[20px] md:rounded-[24px] shadow-2xl transition-all flex items-center justify-center gap-2 md:gap-3 ${isClient ? 'bg-rose-600 shadow-rose-600/20 hover:bg-slate-900' : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-slate-900'}`}>
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Proceed to Secure Checkout</>}
                </button>
             </div>
           )}
        </div>
      </div>
      {showReceipt && lastTrx && <ReceiptModal trx={lastTrx} isClient={isClient} onClose={() => setShowReceipt(false)} />}
    </div>
  );
};

// ── BHIM/NPCI Transaction Receipt Modal ──────────────────────────────────────
const ReceiptModal = ({ trx, onClose, isClient }) => {
  if (!trx) return null;
  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          * { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important; }
          .no-print, .sidebar, .navbar { display: none !important; }
          .fixed.inset-0.z-[110] { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; background: white !important; display: block !important; }
          #receipt-dossier { display: block !important; width: 100% !important; padding: 2cm !important; box-shadow: none !important; border: none !important; }
        }
      `}} />
      <div className="bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden animate-[pop_0.5s] border border-slate-200 my-auto no-print-bg">
        <div id="receipt-dossier" className="p-8 md:p-12 relative bg-white print-pure-white">
           <div className="absolute top-0 right-0 w-64 h-64 ${isClient ? 'bg-rose-50' : 'bg-indigo-50'} rounded-full -mr-32 -mt-32 opacity-40 no-print" />
           
           <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 ${isClient ? 'bg-rose-600' : 'bg-indigo-600'} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
                       <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                       <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">BHIM UPI</h2>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Sovereign Payment Node</p>
                    </div>
                 </div>
                 <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                       <CheckCircle className="w-3 h-3" /> Settlement Verified
                    </div>
                    <p className="text-[7px] text-slate-300 font-bold uppercase mt-1">NPCI-ID: {trx._id?.slice(-12).toUpperCase()}</p>
                 </div>
              </div>

              <div className="text-center py-6 md:py-10 bg-slate-50/50 rounded-[35px] border border-slate-100 border-dashed px-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Transacted Value</p>
                 <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-sm md:text-xl font-black text-slate-400">₹</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter truncate max-w-full">{trx.totalAmount?.toLocaleString()}</h2>
                 </div>
                 <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Digital Asset Release Verified</span>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</p>
                       <p className="text-xs font-black text-slate-900">{new Date(trx.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Payment Reference (RRN)</p>
                       <p className="text-xs font-mono font-black ${isClient ? 'text-rose-600' : 'text-indigo-600'}">{trx.transactionId?.replace('order_sim_', '').substring(0, 12).toUpperCase()}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sender VPA</p>
                       <p className="text-xs font-black text-slate-900 uppercase">localdev@axisbank</p>
                    </div>
                    <div className="space-y-1 text-right">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transaction Type</p>
                       <p className="text-xs font-black text-slate-900 uppercase italic font-bold tracking-tight">{trx.type}</p>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex gap-4 items-center">
                    <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`BHIM-UPI-VERIFY:${trx.transactionId}`)}`} 
                       alt="QR Verify" 
                       className="w-16 h-16 md:w-20 md:h-20 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm"
                    />
                    <div>
                       <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight">Scan to Verify Dossier</p>
                       <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1 max-w-[140px]">This document is a sovereign financial record generated by LocalDev Technologies.</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="inline-block p-3 bg-slate-900 rounded-2xl">
                       <ShieldCheck className="w-6 h-6 text-rose-400" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 no-print">
           <button onClick={onClose} className="flex-1 py-4 bg-white text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">Dismiss</button>
           <button 
             onClick={() => window.print()}
             className={`flex-[2] py-4 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-2 ${isClient ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
           >
              <Download className="w-4 h-4" /> Export BHIM Receipt
           </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Ledger View ──────────────────────────────────────────────────────────
const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [stats, setStats] = useState({ pending: 0, lifetime: 0 });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [pData, me] = await Promise.all([api.getPayments(), api.getMe()]);
      setPayments(pData);
      setUser(me);
      setWalletBalance(me.wallet_balance || 0);

      let pending = 0;
      let total = 0;
      pData.forEach(p => {
        if (p.status === 'escrow' && p.studentId?._id === me._id) pending += p.studentAmount;
        if (p.status === 'released' && p.studentId?._id === me._id) total += p.studentAmount;
      });
      setStats({ pending, lifetime: total });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on('wallet:updated', (data) => {
      setWalletBalance(data.balance);
      fetchData();
    });
    return () => socket.off('wallet:updated');
  }, []);

  const isClient = user?.role === 'client';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <div className={`w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-4 ${isClient ? 'border-rose-600' : 'border-indigo-600'}`} />
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Ledger...</span>
      </div>
    );
  }

  const filteredPayments = payments.filter(p => {
    if (activeFilter === 'all') return true;
    return p.type === activeFilter;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-10 animate-[fade-in_0.6s] pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Earnings & Payments</h1>
          <p className="text-slate-500 text-sm mt-1">Track your income and withdraw funds to your bank in real-time.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isClient ? (
            <button 
              onClick={() => setShowDepositModal(true)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-98 ${isClient ? 'bg-rose-600 shadow-rose-600/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}
            >
              <Plus className="w-4 h-4" /> Deposit Funds
            </button>
          ) : (
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-98 ${isClient ? 'bg-rose-600 shadow-rose-600/20' : 'bg-indigo-600 shadow-indigo-600/20'}`}
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw Funds
            </button>
          )}
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className={`p-4 bg-white border border-slate-100 rounded-2xl transition-all shadow-sm active:rotate-180 duration-500 disabled:opacity-50 ${isClient ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <History className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Active Wallet Card */}
        <div className={`rounded-[32px] md:rounded-[40px] p-6 md:p-8 text-white relative overflow-hidden group shadow-[0_32px_64px_-12px_rgba(79,70,229,0.2)] min-h-[180px] flex flex-col justify-center ${isClient ? 'bg-rose-600' : 'bg-indigo-600'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Wallet className={`w-5 h-5 ${isClient ? 'text-rose-100' : 'text-indigo-100'}`} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-full border border-white/10">Active Wallet</span>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isClient ? 'text-rose-100/60' : 'text-indigo-100/60'}`}>Available Capital</p>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">₹{walletBalance.toLocaleString()}</span>
              <span className={`text-[10px] md:text-xs font-bold uppercase mt-1 ${isClient ? 'text-rose-300/60' : 'text-indigo-300/60'}`}>Inr</span>
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] relative overflow-hidden group hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-all min-h-[180px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-200" />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pending Clearance</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">₹{stats.pending.toLocaleString()}</span>
          </div>
        </div>

        {/* Lifetime Card */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] relative overflow-hidden group hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-all min-h-[180px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[7px] font-black uppercase tracking-widest ring-1 ring-emerald-100">Verified</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Lifetime Inflow</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">₹{stats.lifetime.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Financial Ledger</h2>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ring-1 ring-emerald-100">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               Live
            </span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
             {['all', 'deposit', 'withdrawal'].map(f => (
               <button 
                 key={f}
                 onClick={() => setActiveFilter(f)}
                 className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? (isClient ? 'bg-white text-rose-600 shadow-sm' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)]">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                  <th className="px-8 py-6 whitespace-nowrap">Timestamp</th>
                  <th className="px-8 py-6 whitespace-nowrap">Tactical Source</th>
                  <th className="px-8 py-6 whitespace-nowrap">Reference Node</th>
                  <th className="px-8 py-6 text-right whitespace-nowrap">Amount (INR)</th>
                  <th className="px-8 py-6 text-center whitespace-nowrap">Auth Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPayments.map((trx) => (
                  <tr key={trx._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col text-xs font-bold text-slate-600 whitespace-nowrap">
                        <span>{new Date(trx.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-slate-300 font-normal mt-0.5 uppercase">{new Date(trx.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 whitespace-nowrap">
                        <div className={`p-3 rounded-2xl ${trx.type === 'deposit' ? (isClient ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600') : trx.type === 'withdrawal' ? 'bg-amber-50 text-amber-600' : (isClient ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')}`}>
                          {trx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : trx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none">
                            {trx.type === 'deposit' ? 'Wallet Top-up' : trx.type === 'withdrawal' ? 'Bank Settlement' : (trx.projectId?.title?.substring(0, 20) || 'Project Payment')}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {trx.type === 'deposit' ? 'NPCI Uplink' : trx.type === 'withdrawal' ? 'Outbound Move' : `From ${trx.clientId?.name || 'Client'}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`font-mono text-[10px] text-slate-300 font-bold uppercase transition-colors whitespace-nowrap ${isClient ? 'group-hover:text-rose-400' : 'group-hover:text-indigo-400'}`}>
                        {trx.transactionId?.replace('order_sim_', 'TXN-').substring(0, 14).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end whitespace-nowrap">
                        <span className={`text-lg font-black tracking-tighter ${trx.type === 'withdrawal' ? 'text-slate-900' : (trx.type === 'deposit' || !isClient) ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {trx.type === 'withdrawal' ? '- ' : '+ '}₹{trx.totalAmount?.toLocaleString()}
                        </span>
                        <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest">Sovereign Auth</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-2 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                          ${trx.status === 'escrow' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            trx.type === 'deposit' || trx.type === 'withdrawal' ? (isClient ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100') :
                              'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {trx.status === 'escrow' ? <Clock className="w-3 h-3 animate-pulse" /> : <ShieldCheck className="w-3 h-3" />}
                          {trx.status === 'escrow' ? "Pending" : "Cleared"}
                        </div>
                        {trx.status !== 'escrow' && (
                          <button 
                            onClick={() => { setSelectedTrx(trx); setShowReceiptModal(true); }}
                            className={`text-[8px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}
                          >
                             <Download className="w-2.5 h-2.5" /> Archival View
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredPayments.length && (
                  <tr>
                    <td colSpan="5" className="p-24 text-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                          <History className="w-6 h-6 text-slate-200" />
                       </div>
                       <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">No transactions recorded yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-slate-50">
             {!filteredPayments.length && (
               <div className="p-16 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                     <History className="w-5 h-5 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">No transactions</p>
               </div>
             )}
             {filteredPayments.map((trx) => (
                <div key={trx._id} className="p-5 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className={`p-2.5 rounded-xl shrink-0 ${trx.type === 'deposit' ? (isClient ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600') : trx.type === 'withdrawal' ? 'bg-amber-50 text-amber-600' : (isClient ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')}`}>
                           {trx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : trx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                         </div>
                         <div className="min-w-0">
                           <p className="text-[13px] font-black text-slate-900 leading-none truncate">
                             {trx.type === 'deposit' ? 'Wallet Top-up' : trx.type === 'withdrawal' ? 'Bank Settlement' : (trx.projectId?.title || 'Project Payment')}
                           </p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">
                             {trx.type === 'deposit' ? 'NPCI Uplink' : trx.type === 'withdrawal' ? 'Outbound Move' : `From ${trx.clientId?.name || 'Client'}`}
                           </p>
                         </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`block text-base font-black tracking-tighter ${trx.type === 'withdrawal' ? 'text-slate-900' : (trx.type === 'deposit' || !isClient) ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {trx.type === 'withdrawal' ? '- ' : '+ '}₹{trx.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                      <div>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time</p>
                         <p className="text-[10px] font-bold text-slate-700">{new Date(trx.createdAt).toLocaleDateString()} <span className="text-slate-400 ml-1">{new Date(trx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                      </div>
                      <div className="text-right">
                         <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border
                           ${trx.status === 'escrow' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             trx.type === 'deposit' || trx.type === 'withdrawal' ? (isClient ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100') :
                               'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                           {trx.status === 'escrow' ? <Clock className="w-2.5 h-2.5 animate-pulse" /> : <ShieldCheck className="w-2.5 h-2.5" />}
                           {trx.status === 'escrow' ? "Pending" : "Cleared"}
                         </div>
                      </div>
                   </div>

                   {trx.status !== 'escrow' && (
                     <button 
                       onClick={() => { setSelectedTrx(trx); setShowReceiptModal(true); }}
                       className={`w-full py-2.5 rounded-xl border border-dashed text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${isClient ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
                     >
                        <Download className="w-3 h-3" /> Download Sovereign Receipt
                     </button>
                   )}
                </div>
             ))}
          </div>
        </div>
      </div>

      {showDepositModal && (
        <DepositModal 
          onClose={() => setShowDepositModal(false)}
          onSuccess={(res) => {
            setWalletBalance(res.balance);
            fetchData();
          }}
          currentBalance={walletBalance}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal 
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={(res) => {
            setWalletBalance(res.balance);
            fetchData();
          }}
          currentBalance={walletBalance}
        />
      )}

      {showReceiptModal && (
        <ReceiptModal 
          trx={selectedTrx} 
          onClose={() => setShowReceiptModal(false)} 
        />
      )}
    </div>
  );
};

export default Payments;


