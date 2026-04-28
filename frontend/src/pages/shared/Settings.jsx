import { useState, useEffect, useRef } from 'react';
import { Bell, Lock, User, CheckCircle, XCircle, Loader, ShieldCheck, Building2, Camera, Trash, Download, Database } from 'lucide-react';
import { useToast } from '../../components/layout/Toast';
import { api } from '../../api';

const Settings = () => {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const fileInputRef = useRef(null);

  // Forms Visibility
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Profile Form Data
  const [profileData, setProfileData] = useState({ name: '', bio: '', avatar: '', university: '', skills: '', githubUrl: '', portfolioUrl: '' });
  const [profileStatus, setProfileStatus] = useState(null); // { type, msg }
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Form Data
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const token = localStorage.getItem('token');
  const storedUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (storedUser?.id) {
      fetchUser(storedUser.id);
    }
  }, []);

  const fetchUser = async (id) => {
    try {
      const data = await api.getUserById(id);
      setCurrentUser(data);
      setProfileData({
        name: data.name || '',
        bio: data.profile?.bio || '',
        avatar: data.profile?.avatar || '',
        university: data.profile?.university || '',
        skills: data.profile?.skills?.join(', ') || '',
        githubUrl: data.profile?.githubUrl || '',
        portfolioUrl: data.profile?.portfolioUrl || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const syncUserStorage = (data) => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      u.name = data.name;
      if (data.profile) u.profile = data.profile;
      localStorage.setItem('user', JSON.stringify(u));
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {}
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast("Image too large (max 2MB)", 'warning');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width, height = img.height;
        if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
        else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        
        try {
          const data = await api.updateProfile(storedUser.id, { profile: { avatar: base64String } });
          setCurrentUser(data);
          setProfileData(prev => ({...prev, avatar: base64String }));
          syncUserStorage(data);
          setProfileStatus({ type: 'success', msg: 'Neural Profile Synchronized!' });
          setTimeout(() => setProfileStatus(null), 800);
        } catch (e) {}
      };
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = async () => {
    try {
      const data = await api.updateProfile(storedUser.id, { profile: { avatar: '' } });
      setCurrentUser(data);
      setProfileData(prev => ({...prev, avatar: '' }));
      syncUserStorage(data);
      setProfileStatus({ type: 'success', msg: 'Profile photo deleted!' });
      setTimeout(() => setProfileStatus(null), 800);
    } catch (e) {}
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus(null);
    setLoadingProfile(true);

    const payload = {
      name: profileData.name,
      profile: {
        bio: profileData.bio,
        avatar: profileData.avatar,
      }
    };

    if (currentUser?.role === 'student') {
      payload.profile.university = profileData.university;
      payload.profile.githubUrl = profileData.githubUrl;
      payload.profile.portfolioUrl = profileData.portfolioUrl;
      payload.profile.skills = profileData.skills.split(',').map(s => s.trim()).filter(s => s);
    }

    try {
      const data = await api.updateProfile(currentUser._id, payload);
      setProfileStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setCurrentUser(data);
      
      syncUserStorage(data);
      
      setTimeout(() => { setShowProfileForm(false); setProfileStatus(null); }, 400);
    } catch (err) {
      setProfileStatus({ type: 'error', msg: err.message });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match' });
      return;
    }
    
    setLoadingPassword(true);
    try {
      await api.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setShowPasswordForm(false); setPasswordStatus(null); }, 400);
    } catch (err) {
      setPasswordStatus({ type: 'error', msg: err.message });
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleExportSessions = async () => {
    try {
      const blob = await api.exportSessions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'user-sessions.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Failed to export sessions: ' + err.message, 'error');
    }
  };

  if (loadingInitial) {
    return <div className="p-8 flex justify-center"><Loader className="animate-spin text-primary w-8 h-8"/></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <h1 className="text-2xl font-bold font-heading text-slate-900 mb-8">Account Settings</h1>

      <div className="space-y-6">
        
        {/* Profile Settings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-start gap-6 flex-col sm:flex-row transition-all hover:shadow-md">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl flex-shrink-0 shadow-sm"><User className="w-6 h-6" /></div>
          <div className="flex-grow w-full">
            <h3 className="font-black text-slate-900 text-xl font-heading mb-1">Personal Details</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Update your email, name, and location.</p>
            
            {!showProfileForm ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {currentUser?.profile?.avatar ? (
                        <img src={currentUser.profile.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md relative z-10" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-black text-2xl border-4 border-white shadow-md relative z-10">
                          {currentUser?.name?.charAt(0)}
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-primary/90 transition-colors z-20" title="Upload Photo">
                        <Camera className="w-3 h-3" />
                      </button>
                      {currentUser?.profile?.avatar && (
                        <button onClick={handlePhotoDelete} className="absolute -bottom-1 -left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-red-600 transition-colors z-20" title="Delete Photo">
                          <Trash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">{currentUser?.name}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{currentUser?.role}</p>
                      {currentUser?.profile?.university && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium"><Building2 className="w-3 h-3" /> {currentUser.profile.university}</p>}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowProfileForm(true)}
                  className="px-6 py-2.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 animate-fadeIn">
                {profileStatus && (
                  <div className={`p-4 rounded-xl text-sm flex items-center gap-3 font-bold ${profileStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {profileStatus.type === 'error' ? <XCircle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                    {profileStatus.msg}
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">Full Name</label>
                    <input type="text" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">Bio</label>
                    <textarea rows="3" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})}></textarea>
                  </div>

                  {currentUser?.role === 'student' && (
                    <>
                      <div className="col-span-2 pt-2"><label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">Skills (comma separated)</label><input type="text" placeholder="React, Node, Mongo" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={profileData.skills} onChange={e => setProfileData({...profileData, skills: e.target.value})} /></div>
                      
                      <div><label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">University</label><input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={profileData.university} onChange={e => setProfileData({...profileData, university: e.target.value})} /></div>
                      
                      <div><label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">GitHub URL</label><input type="url" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={profileData.githubUrl} onChange={e => setProfileData({...profileData, githubUrl: e.target.value})} /></div>
                    </>
                  )}
                </div>
                
                <div className="pt-2 flex gap-3">
                  <button type="submit" disabled={loadingProfile} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 flex items-center justify-center active:scale-95">
                    {loadingProfile ? <Loader className="w-4 h-4 animate-spin"/> : 'Save Details'}
                  </button>
                  <button type="button" onClick={() => setShowProfileForm(false)} className="px-6 py-3 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-start gap-6 flex-col sm:flex-row transition-all hover:shadow-md">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex-shrink-0 shadow-sm"><Lock className="w-6 h-6" /></div>
          <div className="flex-grow w-full">
            <h3 className="font-black text-slate-900 text-xl font-heading mb-1">Security & Password</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Manage your password and 2-factor authentication.</p>
            
            {!showPasswordForm ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">Account Password</h4>
                      <p className="text-xs text-slate-400 font-medium">Last updated recently</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider items-center gap-1.5 border border-green-100">
                    <CheckCircle className="w-3.5 h-3.5" /> Secure
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowPasswordForm(true)}
                  className="px-6 py-2.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 animate-fadeIn">
                {passwordStatus && (
                  <div className={`p-4 rounded-xl text-sm flex items-center gap-3 font-bold ${passwordStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {passwordStatus.type === 'error' ? <XCircle className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                    {passwordStatus.msg}
                  </div>
                )}
                <div className="space-y-4">
                  <div><label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">Current Password</label><input type="password" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">New Password</label><input type="password" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-black text-slate-400 mb-1 ml-1 tracking-wider">Confirm New Password</label><input type="password" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} /></div>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <button type="submit" disabled={loadingPassword} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 flex items-center justify-center active:scale-95">
                    {loadingPassword ? <Loader className="w-4 h-4 animate-spin"/> : 'Update Password'}
                  </button>
                  <button type="button" onClick={() => setShowPasswordForm(false)} className="px-6 py-3 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-start gap-6 transition-all hover:shadow-md">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl flex-shrink-0 shadow-sm"><Bell className="w-6 h-6" /></div>
          <div className="flex-grow flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-xl font-heading mb-1">Email Notifications</h3>
              <p className="text-sm text-slate-500 font-medium">Receive alerts for new messages and job matches.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        {/* Data Export Settings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex items-start gap-6 transition-all hover:shadow-md">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl flex-shrink-0 shadow-sm"><Database className="w-6 h-6" /></div>
          <div className="flex-grow flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-xl font-heading mb-1">Export Data & Analytics</h3>
              <p className="text-sm text-slate-500 font-medium">Download unique session logs including login/logout times and device uniqueness.</p>
            </div>
            <button 
              onClick={handleExportSessions}
              className="px-6 py-2.5 bg-black text-white flex items-center gap-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Excel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
