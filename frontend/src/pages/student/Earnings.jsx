import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';

const Earnings = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ available: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const data = await api.getPayments();
      let available = 0;
      let pending = 0;
      
      data.forEach(payment => {
        const amt = payment.studentAmount || payment.totalAmount || 0;
        if (payment.status === 'released' && payment.type !== 'withdrawal') available += payment.studentAmount || 0;
        if (payment.status === 'escrow') pending += payment.studentAmount || 0;
        if (payment.type === 'withdrawal') available -= payment.totalAmount || 0;
      });
      
      setStats({
        available,
        pending,
        total: available + pending
      });
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for real-time updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">Earnings & Payments</h1>
          <p className="text-slate-500 mt-1">Track your income and withdraw funds to your bank in real-time.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-[0_32px_64px_-12px_rgba(79,70,229,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 animate-pulse"></div>
          <div className="flex justify-between items-start mb-6">
            <span className="font-bold text-indigo-100 text-sm uppercase tracking-wider relative z-10">Available to Withdraw</span>
            <div className="p-2 bg-white/20 rounded-lg relative z-10"><CreditCard className="w-5 h-5" /></div>
          </div>
          <h2 className="text-4xl font-black font-heading mb-1 relative z-10">₹{stats.available.toLocaleString()}</h2>
          <button 
            onClick={() => navigate('/student-dashboard/withdraw')}
            className="mt-4 w-full py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm relative z-10 uppercase text-xs tracking-widest"
          >
            Withdraw Funds
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] flex flex-col justify-between hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">Pending Clearance</span>
            <div className="p-2 pl-0"><ClockBadge /></div>
          </div>
          <h2 className="text-3xl font-black font-heading text-slate-900 mb-1">₹{stats.pending.toLocaleString()}</h2>
          <p className="text-sm font-medium text-slate-500">From active milestones</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] flex flex-col justify-between hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <span className="font-bold text-slate-500 text-sm uppercase tracking-wider">Total Lifetime Earnings</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <h2 className="text-3xl font-black font-heading text-slate-900 mb-1">₹{stats.total.toLocaleString()}</h2>
          <p className="text-sm font-medium text-green-600 flex items-center gap-1">Real-time updated</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.05)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-lg">Live Transaction History</h3>
          <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Updates
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="p-6">Date & Time</th>
                <th className="p-6">Description</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-500">
                    <div className="flex justify-center mb-2"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Fetching transactions...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-500">
                    <span className="text-[10px] font-black uppercase tracking-widest">No transactions found.</span>
                  </td>
                </tr>
              ) : payments.map(payment => (
                <tr key={payment._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-bold">{new Date(payment.createdAt).toLocaleDateString()}</span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mt-0.5">{new Date(payment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-slate-900 font-bold leading-none">
                      {payment.type === 'withdrawal' ? 'NPCI Capital Disbursement' : `Project Payment: ${payment.projectId?.title || 'System Reward'}`}
                    </p>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">TXN: {payment.transactionId}</div>
                  </td>
                  <td className={`p-6 font-black text-lg tracking-tighter ${payment.type === 'withdrawal' ? 'text-slate-900' : 'text-emerald-600'}`}>
                    {payment.type === 'withdrawal' ? '- ' : '+ '}₹{payment.type === 'withdrawal' ? payment.totalAmount.toLocaleString() : payment.studentAmount.toLocaleString()}
                  </td>
                  <td className="p-6">
                    {payment.status === 'escrow' ? (
                      <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest">Pending Escrow</span>
                    ) : payment.status === 'failed' ? (
                      <span className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Failed</span>
                    ) : payment.status === 'pending_repayment' ? (
                      <div className="flex flex-col gap-2">
                        <span className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-[9px] font-black uppercase tracking-widest">Client Repayment Req.</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">Awaiting Client Action</span>
                      </div>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Status: Cleared</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClockBadge = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

export default Earnings;
