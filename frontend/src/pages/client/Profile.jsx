import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, MapPin, Building2, Briefcase, 
  Edit3, Save, X, CheckCircle, Camera, Trash, Globe, Linkedin
} from 'lucide-react';
import { api } from '../../api';

const ClientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState(null); // 'personal' | 'address' | 'company'
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    name: '', bio: '', company: '', industry: '',
    websiteUrl: '', linkedinUrl: '',
    flat: '', city: '', state: '', zipCode: '', country: ''
  });

  useEffect(() => {
    fetchProfile();
    
    // 🔄 REAL-TIME STATS SYNCHRONIZATION (Polling every 5 seconds)
    const statsInterval = setInterval(() => {
      syncBusinessStats();
    }, 5000);

    return () => clearInterval(statsInterval);
  }, []);

  const syncBusinessStats = async () => {
    try {
      const projects = await api.getProjects(storedUser._id || storedUser.id);
      const postedCount = projects.length;
      const hireCount = projects.filter(p => p.developer).length;
      
      setProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            projectsPosted: postedCount,
            totalHires: hireCount
          }
        };
      });
    } catch (err) {
      console.error("Real-time stats sync error:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await api.getUserById(storedUser.id);
      
      // Fetch real-time stats
      try {
        const projects = await api.getProjects(storedUser._id || storedUser.id);
        const postedCount = projects.length;
        const hireCount = projects.filter(p => p.developer).length;
        
        data.profile = { 
          ...data.profile, 
          projectsPosted: postedCount,
          totalHires: hireCount
        };
      } catch (err) { console.error("Stats fetch error:", err); }

      setProfile(data);
      setForm({
        name: data.name || '',
        bio: data.profile?.bio || '',
        company: data.profile?.company || '',
        industry: data.profile?.industry || '',
        websiteUrl: data.profile?.websiteUrl || '',
        linkedinUrl: data.profile?.linkedinUrl || '',
        flat: data.profile?.address?.flat || '',
        city: data.profile?.address?.city || '',
        state: data.profile?.address?.state || '',
        zipCode: data.profile?.address?.zipCode || '',
        country: data.profile?.address?.country || '',
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        
        setSaving(true);
        try {
          // Convert canvas to blob for S3 upload
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
          const file = new File([blob], `avatar-${storedUser.id}.jpg`, { type: 'image/jpeg' });
          
          const uploadRes = await api.uploadAsset(file);
          if (!uploadRes.success) throw new Error('Upload failed');
          
          const s3Url = uploadRes.fileUrl;
          const data = await api.updateProfile(storedUser.id, { profile: { avatar: s3Url } });
          
          setProfile(data);
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          currentUser.profile = { ...currentUser.profile, avatar: s3Url };
          localStorage.setItem('user', JSON.stringify(currentUser));
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: currentUser }));
          setSuccessMsg('Profile Photo Synchronized!');
          setTimeout(() => setSuccessMsg(''), 1500);
        } catch (e) { 
          console.error(e); 
          setSuccessMsg('Upload Error: ' + e.message);
        } finally { 
          setSaving(false); 
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        profile: {
          bio: form.bio,
          company: form.company,
          industry: form.industry,
          websiteUrl: form.websiteUrl,
          linkedinUrl: form.linkedinUrl,
          address: {
            flat: form.flat, city: form.city, state: form.state,
            zipCode: form.zipCode, country: form.country
          }
        }
      };
      const data = await api.updateProfile(storedUser.id, payload);
      setProfile(data);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.name = data.name;
      currentUser.profile = data.profile;
      localStorage.setItem('user', JSON.stringify(currentUser));
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: currentUser }));
      setEditSection(null);
      setSuccessMsg('Client profile updated!');
      setTimeout(() => setSuccessMsg(''), 1500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'Client'}&backgroundColor=e11d48&textColor=ffffff`;

  if (loading) {
    return <div className="flex items-center justify-center h-full py-40"><div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" /></div>;
  }

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value || <span className="italic text-slate-300">Not set</span>}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-slate-900">Client Profile</h1>
        <p className="text-slate-500 mt-1">Manage your business identity and partner information.</p>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-3 rounded-xl border border-rose-200 text-sm font-medium animate-[fade-in_0.3s]">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_32px_64px_-12px_rgba(244,63,94,0.1)] overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-rose-500 to-rose-400" />
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img src={profile?.profile?.avatar || avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover" />
                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"><Camera className="w-3.5 h-3.5" /></button>
              </div>
              <h2 className="font-bold text-slate-900 text-xl font-heading">{profile?.name}</h2>
              <p className="text-xs font-black text-rose-500 uppercase tracking-widest mt-1">Client Partner</p>
              {profile?.profile?.company && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {profile.profile.company}</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_32px_64px_-12px_rgba(244,63,94,0.1)] p-5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Business Stats</h3>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase text-emerald-600 tracking-tighter">Live Sync</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4 text-rose-500" /> Projects Posted</span>
                <span className="font-bold text-slate-900">{profile?.profile?.projectsPosted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><User className="w-4 h-4 text-rose-400" /> Total Hires</span>
                <span className="font-bold text-slate-900">{profile?.profile?.totalHires || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_32px_64px_-12px_rgba(244,63,94,0.1)] p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-5 h-5 text-rose-500" /> Business Information</h3>
              <button onClick={() => setEditSection(editSection === 'business' ? null : 'business')} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 border border-slate-200 px-3 py-1.5 rounded-lg transition-all">
                {editSection === 'business' ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit3 className="w-3.5 h-3.5" /> Edit</>}
              </button>
            </div>

            {editSection === 'business' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Company Name</label><input className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-rose-500" value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Industry</label><input className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-rose-500" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Business Name</label><input className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-rose-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                <div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Company Bio</label><textarea rows={3} className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-rose-500" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} /></div>
                <div className="col-span-2 flex justify-end"><button onClick={handleSave} disabled={saving} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all">{saving ? 'Saving...' : 'Save Changes'}</button></div>
              </div>
            ) : (
              <div>
                <InfoRow icon={<Building2 className="w-4 h-4" />} label="Company Name" value={profile?.profile?.company} />
                <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Industry" value={profile?.profile?.industry} />
                <InfoRow icon={<User className="w-4 h-4" />} label="Lead Representative" value={profile?.name} />
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Business Email" value={profile?.email} />
                <div className="pt-3"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Business Bio</p><p className="text-sm text-slate-600 leading-relaxed">{profile?.profile?.bio || 'No bio available.'}</p></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_32px_64px_-12px_rgba(244,63,94,0.1)] p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Globe className="w-5 h-5 text-rose-500" /> Digital Presence</h3>
              <button onClick={() => setEditSection(editSection === 'social' ? null : 'social')} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 border border-slate-200 px-3 py-1.5 rounded-lg transition-all">
                {editSection === 'social' ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Edit3 className="w-3.5 h-3.5" /> Edit</>}
              </button>
            </div>

            {editSection === 'social' ? (
              <div className="grid grid-cols-1 gap-4">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Business Website</label><input type="url" placeholder="https://yourcompany.com" className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-rose-500" value={form.websiteUrl} onChange={e => setForm({...form, websiteUrl: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">LinkedIn Profile</label><input type="url" placeholder="https://linkedin.com/company/..." className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-rose-500" value={form.linkedinUrl} onChange={e => setForm({...form, linkedinUrl: e.target.value})} /></div>
                <div className="flex justify-end pt-2"><button onClick={handleSave} disabled={saving} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all">{saving ? 'Saving...' : 'Save Socials'}</button></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow icon={<Globe className="w-4 h-4" />} label="Website" value={profile?.profile?.websiteUrl ? <a href={profile.profile.websiteUrl} target="_blank" rel="noreferrer" className="text-rose-500 hover:underline">{profile.profile.websiteUrl}</a> : null} />
                <InfoRow icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" value={profile?.profile?.linkedinUrl ? <a href={profile.profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-rose-500 hover:underline">{profile.profile.linkedinUrl}</a> : null} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
