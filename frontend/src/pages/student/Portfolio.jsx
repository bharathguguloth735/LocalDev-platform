import { useState, useEffect } from 'react';
import { Save, Github, CheckCircle, Code, Loader2, Linkedin, Twitter, Link as LinkIcon, Plus, Trash2, MapPin, Briefcase } from 'lucide-react';
import { api } from '../../api.js';

const Portfolio = () => {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    hourlyRate: '',
    location: '',
    github: '',
    portfolioSite: '',
    linkedinUrl: '',
    twitterUrl: '',
    skills: '',
    university: '',
    educationDetails: '',
    pastProjects: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const data = await api.getProfile(payload.id);
        const p = data.profile || {};
        
        setFormData({
          title: p.title || '',
          bio: p.bio || '',
          hourlyRate: p.hourlyRate || '25',
          location: p.location || '',
          github: p.githubUrl || p.github || '',
          portfolioSite: p.portfolioUrl || p.portfolioSite || '',
          linkedinUrl: p.linkedinUrl || '',
          twitterUrl: p.twitterUrl || '',
          skills: p.skills ? p.skills.join(', ') : '',
          university: p.university || '',
          educationDetails: p.educationDetails || '',
          pastProjects: p.pastProjects || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      await api.updateProfile(payload.id, {
        profile: {
          title: formData.title,
          bio: formData.bio,
          hourlyRate: formData.hourlyRate,
          location: formData.location,
          githubUrl: formData.github,
          portfolioUrl: formData.portfolioSite,
          linkedinUrl: formData.linkedinUrl,
          twitterUrl: formData.twitterUrl,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          university: formData.university,
          educationDetails: formData.educationDetails,
          pastProjects: formData.pastProjects
        }
      });
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    setFormData({
      ...formData, 
      pastProjects: [...formData.pastProjects, { title: '', description: '', url: '', image: '' }]
    });
  };

  const updateProject = (index, field, value) => {
    const newProjects = [...formData.pastProjects];
    newProjects[index][field] = value;
    setFormData({ ...formData, pastProjects: newProjects });
  };

  const removeProject = (index) => {
    const newProjects = [...formData.pastProjects];
    newProjects.splice(index, 1);
    setFormData({ ...formData, pastProjects: newProjects });
  };

  if (loading) return <div className="p-8 flex justify-center mt-20 text-slate-400"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900">Portfolio & Profile Editor</h1>
          <p className="text-slate-500 mt-1">Showcase your best work and make your profile stand out.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-light text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-colors">
          {saving ? <CheckCircle className="w-5 h-5"/> : <Save className="w-5 h-5"/>}
          {saving ? 'Saved successfully!' : 'Save All Changes'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] p-4 flex flex-col gap-2 shrink-0 md:sticky top-8">
          {[
            { id: 'general', label: 'General Info', icon: <Briefcase className="w-4 h-4"/> },
            { id: 'links', label: 'Social & Links', icon: <LinkIcon className="w-4 h-4"/> },
            { id: 'skills', label: 'Education & Skills', icon: <Code className="w-4 h-4"/> },
            { id: 'projects', label: 'Past Projects', icon: <Github className="w-4 h-4"/> }
          ].map(tab => (
            <button 
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.1)] transition-all">
          
          {/* General Info */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">General Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Professional Title</label>
                  <input type="text" placeholder="e.g. Full Stack Developer" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Hourly Rate ($/hr)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-400">$</span>
                    <input type="number" className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: e.target.value})} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Location</label>
                <input type="text" placeholder="e.g. New York, USA" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Professional Bio</label>
                <textarea rows="5" placeholder="Introduce yourself to clients..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}></textarea>
              </div>
            </div>
          )}

          {/* Links */}
          {activeTab === 'links' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Social & Website Links</h2>
              
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4 text-slate-400"/> Portfolio Site</label>
                  <input type="url" placeholder="https://yourwebsite.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" value={formData.portfolioSite} onChange={e => setFormData({...formData, portfolioSite: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Github className="w-4 h-4 text-slate-900"/> GitHub URL</label>
                  <input type="url" placeholder="https://github.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-black outline-none" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-600"/> LinkedIn URL</label>
                  <input type="url" placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none" value={formData.linkedinUrl} onChange={e => setFormData({...formData, linkedinUrl: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Twitter className="w-4 h-4 text-sky-500"/> Twitter URL</label>
                  <input type="url" placeholder="https://twitter.com/..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-500 outline-none" value={formData.twitterUrl} onChange={e => setFormData({...formData, twitterUrl: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {/* Skills & Education */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">Education & Skills</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Core Skills (comma separated)</label>
                <input type="text" placeholder="e.g. React, Node.js, Python" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
                <div className="flex gap-2 mt-3 flex-wrap">
                  {formData.skills.split(',').filter(s => s.trim()).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">{skill.trim()}</span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">University / College</label>
                <input type="text" placeholder="e.g. Stanford University" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none mb-4" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} />
                
                <label className="block text-sm font-bold text-slate-700 mb-2">Education Details & Degrees</label>
                <textarea rows="3" placeholder="B.S. in Computer Science - Graduated 2023" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none resize-none" value={formData.educationDetails} onChange={e => setFormData({...formData, educationDetails: e.target.value})}></textarea>
              </div>
            </div>
          )}

          {/* Past Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900">Featured Projects</h2>
                <button type="button" onClick={addProject} className="flex items-center gap-1 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                  <Plus className="w-4 h-4"/> Add Project
                </button>
              </div>
              
              {formData.pastProjects.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                  <Github className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-slate-500 font-bold">No projects added</h3>
                  <p className="text-slate-400 text-sm mt-1">Showcase your best work by adding a project</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.pastProjects.map((proj, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                      <button type="button" onClick={() => removeProject(idx)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Project Name</label>
                          <input type="text" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" value={proj.title} onChange={e => updateProject(idx, 'title', e.target.value)} placeholder="e.g. E-Commerce Dashboard" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Live URL / Repo</label>
                          <input type="url" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" value={proj.url} onChange={e => updateProject(idx, 'url', e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Image URL Address</label>
                          <input type="url" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary text-sm" value={proj.image} onChange={e => updateProject(idx, 'image', e.target.value)} placeholder="https://images.unsplash.com/..." />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Short Description</label>
                          <textarea rows="2" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary resize-none text-sm" value={proj.description} onChange={e => updateProject(idx, 'description', e.target.value)} placeholder="Built with React, Tailwind and Node..."></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
