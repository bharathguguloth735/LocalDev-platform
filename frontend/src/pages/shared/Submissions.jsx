import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, CheckCircle, Clock, ExternalLink, Github, 
  Send, AlertCircle, Loader2, MessageSquare, ShieldCheck,
  ChevronRight, Filter, Search, Briefcase, FileText, ImagePlus, FileCode, Paperclip, X
} from 'lucide-react';
import { api } from '../../api';

const Submissions = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isClient = user?.role === 'client';
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // project object
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    githubUrl: '',
    liveUrl: '',
    notes: '',
    outputAsset: '', // Base64
    report: '',      // Text report
    rating: 5,
    comment: ''
  });
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSubmitting(true);
        setError('');
        const data = await api.uploadAsset(file);
        if (data.success) {
          setForm(prev => ({ ...prev, outputAsset: data.fileUrl }));
          setSuccess('Asset uploaded to cloud storage successfully.');
          setTimeout(() => setSuccess(''), 2000);
        }
      } catch (err) {
        setError('Storage Uplink Failed: ' + err.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects(isClient ? user.id : null);
      // If student, filter by projects assigned to them
      const filtered = isClient 
        ? data.filter(p => p.status === 'review' || p.status === 'in_progress')
        : data.filter(p => p.developer?._id === user.id && (p.status === 'in_progress' || p.status === 'review'));
      
      setProjects(filtered);
    } catch (err) {
      console.error(err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.githubUrl && !form.liveUrl) {
      return setError('Please provide at least a GitHub URL or a Live URL');
    }
    if (!isTermsAccepted) {
      return setError('Please accept the Strategic Delivery Agreement to proceed.');
    }

    try {
      setSubmitting(true);
      setError('');
      await api.submitProject(activeModal._id, form);
      setSuccess('Project submitted successfully for review!');
      setActiveModal(null);
      fetchProjects();
      setTimeout(() => setSuccess(''), 800);
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (projectId) => {
    try {
      setSubmitting(true);
      await api.approveProject(projectId, { 
        rating: form.rating, 
        comment: form.comment 
      });
      setSuccess('Project approved! Funds have been released and certificate generated.');
      fetchProjects();
      setActiveModal(null);
      setTimeout(() => setSuccess(''), 800);
    } catch (err) {
      setError(err.message || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className={`w-10 h-10 animate-spin ${isClient ? 'text-rose-600' : 'text-indigo-600'}`} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black font-heading text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className={`w-8 h-8 ${isClient ? 'text-rose-600' : 'text-indigo-600'}`} />
            {isClient ? 'Project Delivery Center' : 'Submission Portal'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {isClient 
              ? 'Review and approve deliverables from your hired developers.' 
              : 'Submit your completed work for client review and final certification.'}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isClient ? 'bg-rose-50' : 'bg-indigo-50'}`}>
              <Clock className={`w-6 h-6 ${isClient ? 'text-rose-600' : 'text-indigo-600'}`} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p>
              <p className="text-2xl font-black text-slate-900">{projects.filter(p => p.status === 'review').length}</p>
            </div>
          </div>
          <div className="px-6 py-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active</p>
              <p className="text-2xl font-black text-slate-900">{projects.filter(p => p.status === 'in_progress').length}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 flex items-center gap-3 text-sm font-bold">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 flex items-center gap-3 text-sm font-bold animate-in zoom-in duration-300">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Delivery Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center shadow-[0_40px_100px_-15px_rgba(79,70,229,0.1)]">
          <div className="w-24 h-24 bg-slate-50 rounded-[30px] flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">No Projects to Display</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
            {isClient 
              ? "You don't have any projects currently in progress or awaiting review." 
              : "You haven't been hired for any projects that require submission yet."}
          </p>
          {!isClient && (
            <button 
              onClick={() => window.location.href = '/student-dashboard'}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/10 hover:bg-slate-900 transition-all"
            >
              Explore Available Projects
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="bg-white rounded-[40px] border border-slate-100 p-1 relative overflow-hidden group shadow-[0_30px_70px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] transition-all duration-500"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative bg-white rounded-[39px] p-8 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-dashed flex items-center gap-2 ${
                    project.status === 'review' 
                      ? 'bg-amber-50 text-amber-600 border-amber-200' 
                      : (isClient ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200')
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${project.status === 'review' ? 'bg-amber-500 animate-pulse' : (isClient ? 'bg-rose-500' : 'bg-indigo-500')}`} />
                    {project.status === 'review' ? 'Audit in Progress' : 'Development Phase'}
                  </div>
                  <span className="text-[10px] font-black text-slate-300 font-mono">NODE_UID: {project._id.slice(-8).toUpperCase()}</span>
                </div>

                <div className="flex-1">
                  <h3 className={`text-2xl font-black text-slate-900 tracking-tight leading-none mb-3 transition-colors uppercase ${isClient ? 'group-hover:text-rose-600' : 'group-hover:text-indigo-600'}`}>
                    {project.title}
                  </h3>
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-wider">{project.category}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">BUDGET: ₹{project.budget}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl shadow-indigo-500/10 relative">
                            <img 
                              src={isClient ? project.developer?.profile?.avatar : project.client?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=JD'} 
                              alt="User" 
                              className="w-full h-full object-cover"
                            />
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{isClient ? 'Selected Dev' : 'Project Client'}</p>
                            <p className="text-sm font-black text-slate-900 uppercase">{isClient ? project.developer?.name : project.client?.name}</p>
                         </div>
                      </div>
                      
                      {project.status === 'review' && (
                        <div className="flex flex-col items-end">
                           <p className={`text-[10px] font-black uppercase italic ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}>
                              {project.submission?.submittedAt ? new Date(project.submission.submittedAt).toLocaleDateString() : 'N/A'}
                           </p>
                        </div>
                      )}
                   </div>
                </div>

                <div className="mt-8 flex gap-3">
                  {project.status === 'in_progress' ? (
                    !isClient ? (
                      <button 
                        onClick={() => {
                          setActiveModal(project);
                          setForm({ 
                            githubUrl: '', 
                            liveUrl: '', 
                            notes: '', 
                            outputAsset: '', 
                            report: '' 
                          });
                          setIsTermsAccepted(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-slate-950 transition-all hover:-translate-y-1"
                      >
                        <Send className="w-4 h-4" /> Final Submission
                      </button>
                    ) : (
                      <div className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 group/wait relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/wait:translate-x-full transition-transform duration-1000" />
                        <Clock className="w-4 h-4 text-slate-400 animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Deliverables</span>
                      </div>
                    )
                  ) : (
                    <>
                      <button 
                        onClick={() => setActiveModal(project)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 ${isClient ? 'hover:bg-rose-600' : 'hover:bg-indigo-600'}`}
                      >
                        <ShieldCheck className="w-4 h-4" /> Audit Assets
                      </button>
                      
                      {isClient && (
                        <button 
                          onClick={() => handleApprove(project._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 hover:-translate-y-1"
                        >
                          <CheckCircle className="w-4 h-4" /> Release & Finish
                        </button>
                      )}
                    </>
                  )}
                  
                  <button 
                    onClick={() => {
                      const targetUserId = isClient ? project.developer?._id : project.client?._id;
                      const dashboardPrefix = isClient ? 'client-dashboard' : 'student-dashboard';
                      if (targetUserId) {
                        navigate(`/${dashboardPrefix}/messages?userId=${targetUserId}`);
                      } else {
                        navigate(`/${dashboardPrefix}/messages`);
                      }
                    }}
                    className={`w-12 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center transition-all border border-slate-100 cursor-pointer active:scale-95 ${isClient ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600' : 'hover:bg-indigo-50 text-slate-400 hover:text-indigo-600'}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" 
            onClick={() => setActiveModal(null)}
          />
          
          <div className="relative bg-white w-full max-w-2xl md:rounded-[40px] shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col mx-auto">
            {/* Modal Header - Responsive Padding */}
            <div className={`px-6 py-8 md:px-8 md:py-10 text-white flex flex-col items-center text-center shrink-0 bg-gradient-to-br ${isClient ? 'from-rose-600 to-rose-700' : 'from-indigo-600 to-blue-700'}`}>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-[20px] md:rounded-[24px] flex items-center justify-center mb-3 md:mb-4 backdrop-blur-sm">
                <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                {activeModal.status === 'review' ? 'Submission Audit' : 'Final Delivery'}
              </h2>
              <p className={`mt-2 text-xs md:text-sm max-w-xs font-medium opacity-80 ${isClient ? 'text-rose-100' : 'text-indigo-100'}`}>
                {activeModal.status === 'review' 
                  ? 'Verifying the deliverables provided by the assigned developer.' 
                  : 'Submit your final work assets to trigger the completion protocol.'}
              </p>
            </div>

            <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
              {activeModal.status === 'in_progress' ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GitHub Repository</label>
                       <div className="relative">
                         <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                         <input 
                           type="url" 
                           required
                           placeholder="https://github.com/..." 
                           className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl font-bold transition-all text-xs focus:ring-2 ${isClient ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'}`}
                           value={form.githubUrl}
                           onChange={(e) => setForm({...form, githubUrl: e.target.value})}
                         />
                       </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Deployment</label>
                       <div className="relative">
                         <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                         <input 
                           type="url" 
                           placeholder="https://..." 
                           className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl font-bold transition-all text-xs focus:ring-2 ${isClient ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'}`}
                           value={form.liveUrl}
                           onChange={(e) => setForm({...form, liveUrl: e.target.value})}
                         />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Output Asset (Image/PDF Proof)</label>
                    <div className="relative">
                       <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer ${form.outputAsset ? (isClient ? 'bg-rose-50 border-rose-200' : 'bg-indigo-50 border-indigo-200') : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                          {form.outputAsset ? (
                            <div className="flex items-center gap-4">
                               <CheckCircle className={`w-6 h-6 ${isClient ? 'text-rose-600' : 'text-indigo-600'}`} />
                               <span className={`text-[10px] font-black uppercase tracking-widest ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}>Asset Authenticated</span>
                               <button type="button" onClick={() => setForm({...form, outputAsset: ''})} className="ml-4 p-2 bg-white rounded-lg text-rose-500 hover:bg-rose-50 transition-all border-none cursor-pointer"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <>
                               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                  <ImagePlus className="w-6 h-6 text-slate-400" />
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Visual Evidence</span>
                               <p className="text-[8px] text-slate-300 mt-1 uppercase font-bold tracking-widest">Supports PNG, JPG, PDF (Base64 Mode)</p>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                       </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Project Report (Optional)</label>
                    <textarea 
                      placeholder="Detail your technical methodology, challenges, and architecture decisions..." 
                      className={`w-full px-5 py-4 bg-white border border-slate-100 rounded-3xl font-bold min-h-[120px] transition-all resize-none text-xs focus:ring-2 ${isClient ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'}`}
                      value={form.report}
                      onChange={(e) => setForm({...form, report: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Developer Notes (Optional)</label>
                    <textarea 
                      placeholder="Instructions for testing or configuration..." 
                      className={`w-full px-5 py-4 bg-white border border-slate-100 rounded-3xl font-bold min-h-[80px] transition-all resize-none text-xs focus:ring-2 ${isClient ? 'focus:ring-rose-500' : 'focus:ring-indigo-500'}`}
                      value={form.notes}
                      onChange={(e) => setForm({...form, notes: e.target.value})}
                    />
                  </div>
                  
                  {/* Strategic Delivery Agreement (10 Points) */}
                  <div className="bg-white p-6 rounded-[35px] border border-slate-100 mt-8 shadow-sm">
                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}>Strategic Delivery Agreement:</h4>
                    <div className="space-y-3 mb-6 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                       {[
                         "Accuracy: I certify that all deliverables are functional and meet specifications.",
                         "Originality: I confirm the work is my original creation and respects all IP rights.",
                         "Completeness: I have verified that all project requirements have been fulfilled.",
                         "Documentation: I have provided necessary comments and technical documentation.",
                         "Integrity: I certify that the submission contains no malicious code or vulnerabilities.",
                         "Confidentiality: I have protected the client's proprietary data throughout the project.",
                         "Support: I agree to provide clarifications during the professional review period.",
                         "IP Transfer: I acknowledge IP rights transfer upon verified final settlement.",
                         "Protocol Compliance: I confirm no circumvention of platform payment systems occurred.",
                         "Finality: I understand this submission initiates the final audit and payment release."
                       ].map((point, i) => (
                         <div key={i} className="flex gap-3">
                           <span className={`font-black text-[9px] ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}>{i + 1}.</span>
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{point}</p>
                         </div>
                       ))}
                    </div>

                    <label className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-slate-200">
                       <div className="relative flex items-center justify-center mt-1">
                          <input 
                            type="checkbox" 
                            className={`peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg transition-all cursor-pointer ${isClient ? 'checked:bg-rose-600 checked:border-rose-600' : 'checked:bg-indigo-600 checked:border-indigo-600'}`}
                            checked={isTermsAccepted}
                            onChange={(e) => setIsTermsAccepted(e.target.checked)}
                          />
                          <CheckCircle className="absolute w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" />
                       </div>
                       <div>
                          <span className={`text-[10px] font-black uppercase tracking-widest block transition-colors ${isClient ? 'group-hover:text-rose-600' : 'group-hover:text-indigo-600'}`}>Accept Deployment Protocol</span>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 leading-relaxed">I formally accept all 10 clauses of the Strategic Delivery Agreement.</p>
                       </div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="button" onClick={() => setActiveModal(null)} className="order-2 sm:order-1 flex-1 px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border-none">Cancel</button>
                    <button disabled={submitting || !isTermsAccepted} className={`order-1 sm:order-2 flex-[2] flex items-center justify-center gap-2 px-8 py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border-none cursor-pointer disabled:opacity-20 disabled:grayscale ${isClient ? 'bg-rose-600 shadow-lg shadow-rose-100 hover:bg-slate-900' : 'bg-indigo-600 shadow-lg shadow-indigo-100 hover:bg-slate-950'}`}>
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Delivery'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const targetUserId = isClient ? activeModal.developer?._id : activeModal.client?._id;
                        const dashboardPrefix = isClient ? 'client-dashboard' : 'student-dashboard';
                        if (targetUserId) navigate(`/${dashboardPrefix}/messages?userId=${targetUserId}`);
                      }}
                      className="order-3 w-14 h-14 bg-slate-100 text-slate-400 hover:text-rose-600 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer active:scale-95 shrink-0"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Delivery Asset Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Code Repository</p>
                      <a href={activeModal.submission?.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group">
                        <span className={`text-[12px] font-black truncate mr-3 group-hover:underline ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}>GitHub Access Route</span>
                        <Github className={`w-5 h-5 text-slate-400 transition-colors ${isClient ? 'group-hover:text-rose-600' : 'group-hover:text-indigo-600'}`} />
                      </a>
                    </div>
                    {activeModal.submission?.liveUrl && (
                      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Live Deployment</p>
                        <a href={activeModal.submission?.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between group">
                          <span className={`text-[12px] font-black truncate mr-3 group-hover:underline ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}>Production Node</span>
                          <ExternalLink className={`w-5 h-5 text-slate-400 transition-colors ${isClient ? 'group-hover:text-rose-600' : 'group-hover:text-indigo-600'}`} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* High Resolution Proof Asset */}
                  {activeModal.submission?.outputAsset && (
                    <div className="space-y-3">
                       <div className="flex items-center justify-between px-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Output Evidence</p>
                          <a href={activeModal.submission.outputAsset} download="Project_Proof" className={`text-[8px] font-black hover:underline uppercase tracking-widest ${isClient ? 'text-rose-600' : 'text-indigo-600'}`}>Download Asset</a>
                       </div>
                       <div className="rounded-[35px] border border-slate-100 overflow-hidden bg-slate-900 relative group aspect-video flex items-center justify-center">
                          {activeModal.submission.outputAsset.includes('pdf') ? (
                            <div className="text-center">
                               <FileCode className={`w-12 h-12 mx-auto mb-4 ${isClient ? 'text-rose-400' : 'text-indigo-400'}`} />
                               <span className="text-[10px] font-black text-white uppercase tracking-widest">PDF Dossier Attached</span>
                            </div>
                          ) : (
                            <img src={activeModal.submission.outputAsset} className="w-full h-full object-contain" alt="Technical Proof" />
                          )}
                          <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <a href={activeModal.submission.outputAsset} target="_blank" rel="noreferrer" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer">
                                <ExternalLink className="w-6 h-6 text-slate-900" />
                             </a>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* Strategic Report Sector */}
                  {activeModal.submission?.report && (
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Strategic Project Report</p>
                       <div className={`p-8 rounded-[35px] border ${isClient ? 'bg-rose-50/20 border-rose-100/50' : 'bg-indigo-50/20 border-indigo-100/50'}`}>
                          <div className="flex gap-4">
                             <FileText className={`w-8 h-8 shrink-0 ${isClient ? 'text-rose-400' : 'text-indigo-400'}`} />
                             <p className="text-[12px] text-slate-700 font-medium leading-relaxed italic whitespace-pre-wrap">
                                "{activeModal.submission.report}"
                             </p>
                          </div>
                       </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Developer Notes</p>
                    <p className="text-[11px] text-slate-600 font-bold italic leading-relaxed">
                      "{activeModal.submission?.notes || 'No auxiliary notes attached.'}"
                    </p>
                  </div>

                  {isClient && (
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archive Final Reputation Audit</p>
                      <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setForm({...form, rating: star})} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${form.rating >= star ? 'bg-amber-400 text-white shadow-lg' : 'bg-white text-slate-200'}`}>
                              <Star className={`w-5 h-5 ${form.rating >= star ? 'fill-white' : ''}`} />
                            </button>
                          ))}
                        </div>
                        <input 
                          placeholder="Final audit comment..." 
                          className="flex-1 bg-white px-5 py-3.5 rounded-xl border-none font-bold text-xs outline-none focus:ring-1 focus:ring-amber-200 transition-all shadow-inner"
                          value={form.comment}
                          onChange={(e) => setForm({...form, comment: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button onClick={() => setActiveModal(null)} className="flex-1 px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all border-none">Close Portal</button>
                    {isClient && (
                      <button onClick={() => handleApprove(activeModal._id)} disabled={submitting} className="flex-[2] flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 transition-all border-none cursor-pointer">
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Execute Settlement</>}
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        const targetUserId = isClient ? activeModal.developer?._id : activeModal.client?._id;
                        const dashboardPrefix = isClient ? 'client-dashboard' : 'student-dashboard';
                        if (targetUserId) navigate(`/${dashboardPrefix}/messages?userId=${targetUserId}`);
                      }}
                      className={`w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer active:scale-95 shrink-0 ${isClient ? 'hover:text-rose-600' : 'hover:text-indigo-600'}`}
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fancy CSS animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .float-anim { animation: float 6s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default Submissions;


