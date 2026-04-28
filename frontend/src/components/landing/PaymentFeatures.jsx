import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, ArrowRightLeft, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

const PaymentFeatures = () => {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text Detail */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm mb-6 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Secure Infrastructure
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-heading text-white mb-6 leading-tight">
              Real-time Payouts & <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Smart Escrow</span>
            </h2>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Experience total financial peace of mind. Clients securely fund projects upfront into our neutral Smart Escrow. Developers see the funds locked in, and the moment a milestone is approved, earnings are deployed in absolute real-time.
            </p>

            <div className="space-y-6">
               <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                     <ArrowRightLeft className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-1">Frictionless Transactions</h3>
                     <p className="text-slate-400">No chasing invoices. Money moves seamlessly between cards, banks, and developer digital wallets.</p>
                  </div>
               </div>

               <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                     <TrendingUp className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white mb-1">Instant Student Earnings</h3>
                     <p className="text-slate-400">Students can withdraw their real-time earnings instantly to fuel their academic journeys.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Visual Dashboard Mock */}
          <div className="relative">
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl relative z-10"
             >
                {/* Mock Financial Header */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                         <Wallet className="w-5 h-5"/>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available Balance</p>
                         <p className="text-2xl font-black text-white">$4,250.00</p>
                      </div>
                   </div>
                   <button className="px-4 py-2 bg-white text-slate-900 font-bold rounded-lg text-sm hover:bg-slate-100 transition-colors">
                      Withdraw
                   </button>
                </div>

                {/* Mock Transactions */}
                <h4 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest">Recent Transactions</h4>
                <div className="space-y-4">
                   {[
                     { name: "E-Commerce Frontend", status: "Released", amount: "+$1,200", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                     { name: "Mobile App Wireframes", status: "In Escrow", amount: "$850", color: "text-amber-400", bg: "bg-amber-400/10" },
                     { name: "Landing Page SEO", status: "Released", amount: "+$300", color: "text-emerald-400", bg: "bg-emerald-400/10" }
                   ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600 transition-colors cursor-default">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg}`}>
                               {item.status === 'Released' ? <CheckCircle2 className={`w-5 h-5 ${item.color}`} /> : <ShieldCheck className={`w-5 h-5 ${item.color}`} />}
                            </div>
                            <div>
                               <p className="font-bold text-white text-sm">{item.name}</p>
                               <p className={`text-xs font-bold ${item.color}`}>{item.status}</p>
                            </div>
                         </div>
                         <p className={`font-black ${item.color}`}>{item.amount}</p>
                      </div>
                   ))}
                </div>
             </motion.div>

             {/* Floating Accent Card */}
             <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-6 -left-8 md:-left-12 bg-white p-5 rounded-2xl shadow-xl shadow-black/20 border border-slate-200 z-20 flex gap-4 items-center"
             >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                   <Sparkles className="w-6 h-6 text-primary"/>
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Real-Time Deposit</p>
                   <p className="text-lg font-black text-slate-900 leading-tight">Payment Verified <CheckCircle2 className="w-5 h-5 text-emerald-500 inline ml-1"/></p>
                </div>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PaymentFeatures;
