import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Briefcase, DollarSign, FileText, Layout, Send, Clock } from 'lucide-react';
import { api } from '../api';
import { useToast } from '../components/layout/Toast';

const PostProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('post_project_draft');
    return saved ? JSON.parse(saved) : {
      title: '',
      description: '',
      category: 'Website',
      budget: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('post_project_draft', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (location.state?.edit) {
      const p = location.state.edit;
      setIsEdit(true);
      setProjectId(p._id);
      setFormData({
        title: p.title || '',
        description: p.description || '',
        category: p.category || 'Website',
        budget: p.budget || '',
      });
    } else if (location.state?.prefill) {
      setFormData(prev => ({
        ...prev,
        ...location.state.prefill
      }));
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEdit) {
        await api.updateProject(projectId, formData);
        showToast('Mission parameters successfully updated.', 'success');
      } else {
        // Calculate 3 week deadline for new projects
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 21);
        
        await api.createProject({
          ...formData,
          deadline: deadline.toISOString()
        });
        showToast('Project deployed successfully to the grid!', 'success');
      }
      localStorage.removeItem('post_project_draft');
      navigate('/client-dashboard/projects');
    } catch (err) {
      console.error("Failed to post project", err);
      showToast("Error posting project: " + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(79,70,229,0.15)] border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-8 text-white">
          <h1 className="text-3xl font-bold font-heading mb-2">{isEdit ? 'Edit Project Mission' : 'Post a New Project'}</h1>
          <p className="text-indigo-100">{isEdit ? 'Update your mission requirements and parameters.' : 'Describe what you need built, and our AI will recommend the top student developers for you!'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Briefcase className="w-4 h-4 text-primary" /> Project Title
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Modern E-commerce Coffee Store"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Layout className="w-4 h-4 text-primary" /> Category
            </label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Website">Website Development</option>
              <option value="App">Mobile App Development</option>
              <option value="UI/UX">UI / UX Design</option>
              <option value="AI">AI / Machine Learning Tool</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 text-primary" /> Estimated Budget ($)
            </label>
            <input 
              type="number" 
              required
              min="50"
              placeholder="e.g. 500"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.budget}
              onChange={e => setFormData({...formData, budget: e.target.value})}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <FileText className="w-4 h-4 text-primary" /> Detailed Description
            </label>
            <textarea 
              required
              rows="5"
              placeholder="Describe the features, pages, and overall scope of the work..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          {/* Default Deadline Notice */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
             <Clock className="w-5 h-5 text-indigo-600" />
             <p className="text-xs text-indigo-700 font-bold leading-relaxed">
                <span className="uppercase font-black text-indigo-900 block mb-0.5">Strategic Delivery Window</span>
                Standard development protocol establishes a default deadline of <span className="text-indigo-900 font-black">21 Days (3 Weeks)</span> for this mission.
             </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => navigate('/client-dashboard')}
              className="px-6 py-3 font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
              {loading ? (isEdit ? 'Updating...' : 'Posting...') : (isEdit ? 'Update Project Mission' : 'Post Project & Match')}
            </button>
          </div>
        </form>
      </div>
      
      <div className="flex justify-center w-full mt-12">
         <Link to="/" className="px-8 py-3 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            &larr; Go Back to Home
         </Link>
      </div>
    </div>
  );
};

export default PostProject;
