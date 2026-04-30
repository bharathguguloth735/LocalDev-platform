import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Shield, Lock, Bell, Globe, 
  Database, Cpu, Zap, Save, RefreshCcw 
} from 'lucide-react';

const AdminSettings = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto w-full animate-[fade-in_0.5s]">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-[2px] w-12 bg-slate-900 rounded-full" />
          <span className="text-[11px] font-black uppercase text-slate-900 tracking-[0.4em]">System Configuration</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">Console <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">Settings</span></h1>
      </div>

      <div className="space-y-8">
        {/* Security Sector */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Security Protocol</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage platform access & authentication</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50 border border-slate-100">
               <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Two-Factor Authentication</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Enforce 2FA for all administrator accounts</p>
               </div>
               <div className="w-12 h-6 bg-slate-900 rounded-full p-1 flex justify-end cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
               </div>
            </div>
            
            <div className="flex items-center justify-between p-6 rounded-[24px] bg-slate-50 border border-slate-100">
               <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Session Timeout</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Auto-terminate inactive console sessions</p>
               </div>
               <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none">
                  <option>15 Minutes</option>
                  <option>30 Minutes</option>
                  <option>1 Hour</option>
               </select>
            </div>
          </div>
        </div>

        {/* Neural Engine Sector */}
        <div className="bg-white border border-slate-100 rounded-[40px] p-8 md:p-10 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Neural Engine</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Matching & Recommendation Tuning</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-[24px] bg-slate-50 border border-slate-100">
               <div className="flex justify-between mb-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Matching Precision</h4>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">84% Rigor</span>
               </div>
               <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                  <div className="h-full w-[84%] bg-purple-600" />
               </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-slate-950 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
        >
          {isSaving ? (
            <><RefreshCcw className="w-5 h-5 animate-spin" /> Committing Changes...</>
          ) : (
            <><Save className="w-5 h-5" /> Save Protocol Configurations</>
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
