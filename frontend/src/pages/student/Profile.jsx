import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, MapPin, GraduationCap, Code2, Github, Linkedin,
  Edit3, Save, X, CheckCircle, Camera, Star, Briefcase, Globe, Award, Trash
} from 'lucide-react';
import { api } from '../../api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState(null); // 'personal' | 'address' | 'skills' | 'social'
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getUserById(storedUser.id);
      setProfile(data);
      setForm({
        name: data.name || '',
        bio: data.profile?.bio || '',
        university: data.profile?.university || '',
        skills: data.profile?.skills?.join(', ') || '',
        githubUrl: data.profile?.githubUrl || '',
        linkedinUrl: data.profile?.linkedinUrl || '',
        portfolioUrl: data.profile?.portfolioUrl || '',
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

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large (max 2MB)");
      return;
    }

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
        canvas.width = width;
        canvas.height = height;
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
          
          try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            currentUser.profile = { ...currentUser.profile, avatar: s3Url };
            localStorage.setItem('user', JSON.stringify(currentUser));
            window.dispatchEvent(new Event('userUpdated'));
          } catch (err) {
            console.error("Local storage error:", err);
          }

          setSuccessMsg('Neural Profile Synchronized!');
          setTimeout(() => setSuccessMsg(''), 1500);
        } catch (e) {
          console.error(e);
          setSuccessMsg('Upload failed: ' + e.message);
        } finally {
          setSaving(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = async () => {
    setSaving(true);
    try {
      const data = await api.updateProfile(storedUser.id, { profile: { avatar: '' } });
      setProfile(data);
      
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.profile = { ...currentUser.profile, avatar: '' };
        localStorage.setItem('user', JSON.stringify(currentUser));
        window.dispatchEvent(new Event('userUpdated'));
      } catch (err) {
        console.error("Local storage error:", err);
      }

      setSuccessMsg('Profile photo removed!');
      setTimeout(() => setSuccessMsg(''), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const [form, setForm] = useState({
    name: '', bio: '', university: '',
    skills: '', githubUrl: '', linkedinUrl: '', portfolioUrl: '',
    flat: '', city: '', state: '', zipCode: '', country: ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        profile: {
          bio: form.bio,
          university: form.university,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          githubUrl: form.githubUrl,
          linkedinUrl: form.linkedinUrl,
          portfolioUrl: form.portfolioUrl,
          address: {
            flat: form.flat,
            city: form.city,
            state: form.state,
            zipCode: form.zipCode,
            country: form.country
          }
        }
      };
      const data = await api.updateProfile(storedUser.id, payload);
      setProfile(data);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.name = data.name;
      currentUser.profile = data.profile;
      localStorage.setItem('user', JSON.stringify(currentUser));
      window.dispatchEvent(new Event('userUpdated'));

      setEditSection(null);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 1500);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'User'}&backgroundColor=4f46e5&textColor=ffffff`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-40">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
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
        <h1 className="text-2xl font-bold font-heading text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your public profile and personal information.</p>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl border border-indigo-200 text-sm font-medium animate-[fade-in_0.3s]">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-600 to-indigo-400" />
            <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <img
                  src={profile?.profile?.avatar || avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
                  title="Upload Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                {profile?.profile?.avatar && (
                  <button 
                    onClick={handlePhotoDelete}
                    className="absolute -bottom-1 -left-1 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <h2 className="font-bold text-slate-900 text-xl font-heading">{profile?.name}</h2>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mt-1">
                {profile?.role === 'client' ? 'Client Partner' : profile?.role === 'admin' ? 'System Administrator' : 'Student Developer'}
              </p>
              {profile?.profile?.university && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> {profile.profile.university}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Rating</span>
                <span className="font-bold text-slate-900">{profile?.profile?.rating?.toFixed(1) || '5.0'} / 5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-500" /> Projects Done</span>
                <span className="font-bold text-slate-900">{profile?.profile?.projectsCompleted || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Skills</h3>
              <button onClick={() => setEditSection('skills')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            {editSection === 'skills' ? (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="React, Node.js, MongoDB..."
                  value={form.skills}
                  onChange={e => setForm({ ...form, skills: e.target.value })}
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1">
                    {saving ? '...' : <><Save className="w-3 h-3" /> Save</>}
                  </button>
                  <button onClick={() => setEditSection(null)} className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.profile?.skills?.length ? profile.profile.skills.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100">{s}</span>
                )) : <p className="italic text-slate-300 text-sm">No skills added</p>}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-indigo-500" /> Personal Information</h3>
              {editSection !== 'personal' ? (
                <button onClick={() => setEditSection('personal')} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-indigo-600 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditSection(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {editSection === 'personal' ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'College / University', key: 'university', type: 'text', full: true },
                  { label: 'Bio / About Me', key: 'bio', type: 'textarea', full: true },
                ].map(({ label, key, type, full }) => (
                  <div key={key} className={full ? 'col-span-2' : ''}>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                    {type === 'textarea' ? (
                      <textarea rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                    ) : (
                      <input type={type} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <InfoRow icon={<User className="w-4 h-4" />} label="Full Name" value={profile?.name} />
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email Address" value={profile?.email} />
                <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="College / University" value={profile?.profile?.university} />
                {profile?.profile?.bio && (
                  <div className="pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">About Me</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{profile.profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-rose-500" /> Address</h3>
              {editSection !== 'address' ? (
                <button onClick={() => setEditSection('address')} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-indigo-600 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditSection(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {editSection === 'address' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 mb-1">Flat / Apartment</label><input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" value={form.flat} onChange={e => setForm({ ...form, flat: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">City</label><input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">State</label><input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Pincode</label><input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Country</label><input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
              </div>
            ) : (
              <div>
                {profile?.profile?.address?.flat || profile?.profile?.address?.city ? (
                  <>
                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Flat / Apartment" value={profile.profile.address.flat} />
                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="City" value={profile.profile.address.city} />
                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="State" value={profile.profile.address.state} />
                    <InfoRow icon={<MapPin className="w-4 h-4" />} label="Pincode" value={profile.profile.address.zipCode} />
                    <InfoRow icon={<Globe className="w-4 h-4" />} label="Country" value={profile.profile.address.country} />
                  </>
                ) : (
                  <p className="text-sm italic text-slate-300 py-2">No address added yet. Click Edit to add.</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Code2 className="w-5 h-5 text-emerald-500" /> Social & Portfolio Links</h3>
              {editSection !== 'social' ? (
                <button onClick={() => setEditSection('social')} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-indigo-600 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={() => setEditSection(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {editSection === 'social' ? (
              <div className="space-y-3">
                {[
                  { label: 'GitHub URL', key: 'githubUrl', placeholder: 'https://github.com/username' },
                  { label: 'LinkedIn URL', key: 'linkedinUrl', placeholder: 'https://linkedin.com/in/username' },
                  { label: 'Portfolio URL', key: 'portfolioUrl', placeholder: 'https://yourportfolio.com' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                    <input type="url" placeholder={placeholder} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <InfoRow icon={<Github className="w-4 h-4" />} label="GitHub" value={profile?.profile?.githubUrl ? <a href={profile.profile.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{profile.profile.githubUrl}</a> : null} />
                <InfoRow icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" value={profile?.profile?.linkedinUrl ? <a href={profile.profile.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.profile.linkedinUrl}</a> : null} />
                <InfoRow icon={<Globe className="w-4 h-4" />} label="Portfolio" value={profile?.profile?.portfolioUrl ? <a href={profile.profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">{profile.profile.portfolioUrl}</a> : null} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
