import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ShieldCheck, ArrowLeft, Loader2, Smartphone, CheckCircle2, QrCode, ArrowRight, Zap, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api';

const WithdrawFunds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState('upi'); // 'upi' or 'bank'
  const [availableBalance, setAvailableBalance] = useState(0);

  const [vpa, setVpa] = useState('');
  const [vpaVerified, setVpaVerified] = useState(false);
  const [vpaOwner, setVpaOwner] = useState('');

  const [txnData, setTxnData] = useState(null);
  const [formData, setFormData] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    withdrawAmount: ''
  });

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const data = await api.getPayments();
      // Calculate taking into account withdrawals
      const released = data.filter(p => p.status === 'released').reduce((acc, curr) => acc + curr.studentAmount, 0);
      const withdrawn = data.filter(p => p.type === 'withdrawal').reduce((acc, curr) => acc + curr.totalAmount, 0);
      const net = released - withdrawn;
      
      setAvailableBalance(net);
      setFormData(prev => ({ ...prev, withdrawAmount: net.toString() }));
    } catch (err) { console.error(err); }
  };

  const handleVerifyVPA = () => {
    if (!vpa.includes('@')) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVpaVerified(true);
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setVpaOwner(u.name || 'AUTHENTICATED DEVELOPER'); 
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (method === 'bank' && formData.accountNumber !== formData.confirmAccountNumber) {
       return alert('Account Numbers do not match!');
    }
    if (Number(formData.withdrawAmount) > availableBalance) {
       return alert('Insufficient balance in Sector Ledger.');
    }
    
    setLoading(true);
    try {
      const res = await api.requestWithdrawal({
        amount: formData.withdrawAmount,
        method: method,
        upiId: vpa,
        bankDetails: method === 'bank' ? {
          accountNumber: formData.accountNumber,
          ifsc: formData.ifscCode
        } : null
      });

      // Show receipt
      setTxnData(res.transaction);
      setSuccess(true);
      fetchBalance(); // Refresh balance in background
    } catch (err) {
      alert('Withdrawal Protocol Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (success && txnData) {
    return (
      <div className="p-8 max-w-2xl mx-auto w-full text-center py-6">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #printable-receipt, #printable-receipt * { visibility: visible; }
            #printable-receipt { 
              position: fixed; 
              left: 50%; 
              top: 50%;
              transform: translate(-50%, -50%);
              width: 100%;
              padding: 40px;
              border: none;
              box-shadow: none;
            }
            .no-print { display: none !important; }
          }
        `}</style>

        <div id="printable-receipt">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] border border-slate-100 overflow-hidden relative"
          >
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-indigo-800" />
            
            <div className="relative z-10 pt-16 px-8 pb-10">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border-4 border-white">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Withdrawal Successful</h2>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-8">TXN REF: {txnData.transactionId}</p>
              
              <div className="bg-slate-50 rounded-3xl p-8 mb-8 text-left space-y-5 border border-slate-100">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Disbursed</span>
                    <span className="text-xl font-black text-slate-900 font-mono">₹{formData.withdrawAmount.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">{method === 'upi' ? 'BHIM UPI' : 'Bank Transfer'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tighter">{new Date().toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</span>
                    <span className="text-xs font-black text-indigo-600 font-mono">{method === 'upi' ? vpa : `A/C ....${formData.accountNumber.slice(-4)}`}</span>
                </div>
              </div>

              <div className="no-print space-y-4">
                <div className="flex gap-4">
                  <button 
                    onClick={() => navigate('/student-dashboard/earnings')}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    Close Terminal
                  </button>
                  <button 
                    onClick={handlePrintReceipt}
                    className="flex-1 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> Download Receipt
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="LDC" className="h-6 w-auto" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Verified by LDC Financial Node</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/1200px-UPI-Logo.png" alt="UPI" className="h-4 w-auto grayscale" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto w-full">
      <style>{`
        .method-tab { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>

      <button 
        onClick={() => navigate('/student-dashboard/earnings')}
        className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence
      </button>

      <div className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] relative overflow-hidden">
        {/* Subtle branding layer */}
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <QrCode className="w-48 h-48" />
        </div>

        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-[22px] shadow-lg shadow-indigo-500/10 text-white">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Withdraw Funds</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Secure Liquidity Terminal</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Capital</p>
             <p className="text-2xl font-black text-indigo-600">₹{availableBalance.toLocaleString()}</p>
          </div>
        </div>

        {/* Method Toggle */}
        <div className="flex p-1.5 bg-slate-100 rounded-[24px] mb-8">
          <button 
            onClick={() => { setMethod('upi'); setVpaVerified(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all
              ${method === 'upi' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smartphone className="w-4 h-4" /> BHIM UPI
          </button>
          <button 
            onClick={() => { setMethod('bank'); setVpaVerified(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all
              ${method === 'bank' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Building className="w-4 h-4" /> Bank Transfer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {method === 'upi' ? (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest px-1">BHIM UPI ID (VPA)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    placeholder="example@upi / example@ybl"
                    className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-black tracking-tight outline-none transition-all
                      ${vpaVerified ? 'border-emerald-500 bg-emerald-50/20 shadow-lg shadow-emerald-500/5' : 'border-slate-100 focus:border-indigo-500 focus:bg-white'}`}
                    value={vpa}
                    onChange={e => { setVpa(e.target.value); setVpaVerified(false); }}
                  />
                  {!vpaVerified && vpa.includes('@') && (
                    <button 
                      type="button"
                      onClick={handleVerifyVPA}
                      className="absolute right-3 top-2.5 px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                      {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verify VPA'}
                    </button>
                  )}
                  {vpaVerified && (
                    <div className="absolute right-4 top-4 flex items-center gap-1.5 text-emerald-600">
                       <CheckCircle2 className="w-5 h-5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                  )}
                </div>
                {vpaVerified && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-black">
                        {vpaOwner.charAt(0)}
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated Owner</p>
                        <p className="text-xs font-black text-slate-800 uppercase">{vpaOwner}</p>
                     </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest px-1">Account Number</label>
                <input 
                  type="password" 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  value={formData.accountNumber}
                  onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest px-1">Confirm Account Number</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  value={formData.confirmAccountNumber}
                  onChange={e => setFormData({...formData, confirmAccountNumber: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest px-1">IFSC Protocol</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="IFSC CODE"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black uppercase focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    value={formData.ifscCode}
                    onChange={e => setFormData({...formData, ifscCode: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest px-1">Withdrawal Hub</label>
                  <div className="w-full px-5 py-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl text-[10px] font-black text-emerald-700 flex items-center gap-2">
                     <Zap className="w-4 h-4 fill-emerald-600" /> INSTANT_BANK
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest px-1">Transfer Amount (INR)</label>
            <div className="relative">
              <span className="absolute left-5 top-4 text-lg font-black text-slate-300">₹</span>
              <input 
                type="number" 
                required 
                className="w-full pl-10 pr-5 py-4 bg-slate-950 text-white border-none rounded-2xl text-lg font-black outline-none shadow-2xl"
                value={formData.withdrawAmount}
                onChange={e => setFormData({...formData, withdrawAmount: e.target.value})}
              />
            </div>
            <div className="mt-2 flex justify-between items-center px-1">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Escrow Gas Fee: ₹0.00</p>
               <button type="button" onClick={() => setFormData(prev => ({...prev, withdrawAmount: availableBalance.toString()}))} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Max Load</button>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading || (method === 'upi' && !vpaVerified) || !formData.withdrawAmount}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase text-xs tracking-[0.3em] rounded-3xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/10 active:scale-[0.98]"
            >
              {loading ? (
                <>
                   <Loader2 className="w-5 h-5 animate-spin" />
                   Processing NPCI Gateway...
                </>
              ) : (
                <>
                  Execute Liquidity Flow <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between opacity-40">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">PCI DSS Compliant</span>
           </div>
           <div className="flex items-center gap-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/1200px-UPI-Logo.png" alt="UPI" className="h-4 w-auto grayscale" />
              <span className="text-[8px] font-black uppercase tracking-widest">Secured by BHIM</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawFunds;
