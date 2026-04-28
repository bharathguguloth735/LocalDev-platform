import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Layout, CheckCircle, Clock, Loader2, Edit3, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { socket } from '../../socket.js';
import { useToast } from '../../components/layout/Toast';

const MyProjects = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentProject, setPaymentProject] = useState(null);
  const [hiringInfo, setHiringInfo] = useState(null); // { projectId, studentId }
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const fetchProjects = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const data = await api.getProjects(user._id || user.id);
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    const handleApplicantAdded = (updatedProject) => {
      setProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p));
      
      // If the modal for this project is open, update its state too
      setPaymentProject(current => {
        if (current && current._id === updatedProject._id) return updatedProject;
        return current;
      });
    };

    socket.on('project:applicant_added', handleApplicantAdded);
    return () => socket.off('project:applicant_added', handleApplicantAdded);
  }, []);

  const handlePaymentSuccess = (transaction) => {
    setPaymentProject(null);
    fetchProjects(); // Refresh to see updated status
  };

  const handleHireClick = (projectId, studentId) => {
    setHiringInfo({ projectId, studentId });
    setIsTermsAccepted(false);
  };

  const handleConfirmHire = async () => {
    if (!hiringInfo || !isTermsAccepted) return;
    setIsHiring(true);
    try {
      await api.hireStudent(hiringInfo.projectId, hiringInfo.studentId);
      showToast('STRATEGIC LINK ESTABLISHED: Developer has been officially commissioned.', 'success');
      setHiringInfo(null);
      setPaymentProject(null);
      fetchProjects();
    } catch(err) {
      showToast(err.message || 'Linkage Error', 'error');
    } finally {
      setIsHiring(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">My Projects</h1>
          <p className="text-slate-500 mt-1">Manage your active projects and fund smart escrow.</p>
        </div>
        <button 
          onClick={() => navigate('/post-project')}
          className="bg-rose-500 hover:bg-rose-500-light text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Post New Project
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
          <input type="text" placeholder="Search your projects..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none" />
        </div>
        <button className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <div key={proj._id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_20px_50px_-12px_rgba(244,63,94,0.08)] hover:border-rose-500/30 hover:shadow-[0_40px_80px_-15px_rgba(244,63,94,0.15)] transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-heading 
                ${proj.status === 'open' ? 'bg-rose-50 text-rose-700' : 
                  proj.status === 'in_progress' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                {proj.status.toUpperCase()}
              </span>
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === proj._id ? null : proj._id);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-all active:scale-95"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {openMenuId === proj._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(244,63,94,0.15)] border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <button 
                      onClick={() => navigate(`/client-dashboard/track/${proj._id}`)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-500 transition-colors flex items-center gap-3 border-none bg-transparent cursor-pointer"
                    >
                      <Layout className="w-4 h-4" /> Track Request
                    </button>
                    {proj.status === 'open' && (
                      <button 
                        onClick={() => navigate('/post-project', { state: { edit: proj } })}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-500 transition-colors flex items-center gap-3 border-none bg-transparent cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" /> Edit Mission
                      </button>
                    )}
                    <button 
                      onClick={() => setPaymentProject(proj)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-rose-500 transition-colors flex items-center gap-3 border-none bg-transparent cursor-pointer"
                    >
                      <Filter className="w-4 h-4" /> View Applicants
                    </button>
                    <div className="my-1 border-t border-slate-50" />
                    <button 
                      onClick={async () => {
                        if (window.confirm('PROTOCOL ALERT: Are you sure you want to terminate this mission? This action is irreversible.')) {
                           try {
                             await api.deleteProject(proj._id);
                             fetchProjects();
                           } catch (e) { alert('Termination Failed'); }
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-3 border-none bg-transparent cursor-pointer"
                    >
                      <Plus className="w-4 h-4 rotate-45" /> Terminate Mission
                    </button>
                  </div>
                )}
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2 line-clamp-2">{proj.title}</h3>
            
            {/* Rating Display for Completed Projects */}
            {proj.status === 'completed' && proj.review && (
              <div className="flex flex-col gap-2 mb-4 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < proj.review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  ))}
                  <span className="text-[10px] font-black text-amber-600 ml-2 uppercase">Execution Score</span>
                </div>
                {proj.review.comment && (
                  <p className="text-[11px] text-slate-500 font-medium italic line-clamp-1">"{proj.review.comment}"</p>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-4">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500"><Layout className="w-4 h-4" /> {proj.category}</span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">${proj.budget}</span>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl mb-4">
               <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</span>
               </div>
               <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                  {proj.deadline ? (
                    (() => {
                      const diff = new Date(proj.deadline) - new Date();
                      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                      return days > 0 ? `${days} Days Left` : 'Deadline Passed';
                    })()
                  ) : '2-3 Weeks'}
               </span>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">
                  <span className="text-slate-900 font-bold">{proj.applicants?.length || 0}</span> Applicants
                </span>
                <button 
                  onClick={() => setPaymentProject(proj)}
                  className="text-rose-500 font-bold text-sm hover:underline"
                >
                  View Details
                </button>
              </div>
              
              {/* Complete Project Button - Locked until submission */}
              {(proj.status === 'in_progress' || proj.status === 'review') && (
                <button 
                  disabled={proj.status === 'in_progress'}
                  onClick={() => navigate(`/client-dashboard/checkout/${proj._id}`)}
                  className={`w-full mt-2 py-2.5 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm
                    ${proj.status === 'review' 
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer active:scale-95' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed grayscale'}`}
                >
                  {proj.status === 'review' ? (
                    <><CheckCircle className="w-4 h-4" /> Complete & Pay</>
                  ) : (
                    <><Clock className="w-4 h-4" /> Awaiting Submission</>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View Applicants Modal */}
      {paymentProject && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)'}}>
          <div className="bg-white rounded-3xl shadow-[0_60px_120px_-20px_rgba(244,63,94,0.25)] p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative animate-[fade-in_0.3s]">
            <button onClick={() => setPaymentProject(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 font-bold text-xl">&times;</button>
            <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Project Applicants</h2>
            
            {(!paymentProject.applicants || paymentProject.applicants.length === 0) ? (
              <p className="text-slate-500 text-center py-8">No applicants yet. Check back soon!</p>
            ) : (
              <div className="space-y-4">
                {paymentProject.applicants.map(app => (
                  <div key={app._id} className="border border-slate-200 p-5 rounded-2xl flex items-center justify-between hover:border-rose-500/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={app.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${app.name}`} alt="avatar" className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-100" />
                      <div>
                        <h4 className="font-bold text-slate-900">{app.name}</h4>
                        <p className="text-sm text-slate-500">{app.email}</p>
                        {app.profile?.skills?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {app.profile.skills.slice(0, 3).map(s => (
                              <span key={s} className="px-2 py-0.5 bg-slate-100 text-[10px] rounded-md text-slate-600 font-bold uppercase">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {paymentProject.status === 'open' && (
                      <button 
                        onClick={() => handleHireClick(paymentProject._id, app._id)}
                        className="bg-rose-500 hover:bg-rose-500-light text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-95"
                      >
                        Accept & Hire
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Hiring Agreement Modal */}
      {hiringInfo && (
        <div className="fixed inset-0 z-[1501] flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)'}}>
          <div className="bg-white rounded-[40px] shadow-[0_60px_120px_-20px_rgba(244,63,94,0.25)] p-10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full" />
            
            <div className="flex flex-col items-center text-center mb-8 shrink-0">
              <div className="w-16 h-16 bg-rose-500 rounded-[20px] flex items-center justify-center text-white mb-4 shadow-xl shadow-rose-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Client Master Agreement</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Agreement & Fund Protection</p>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8 text-left">
               <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Strategic Terms of Deployment:</h4>
               <div className="space-y-4 mb-6">
                  {[
                    "Project Clarity: I have provided clear specifications and expectations for the project to the developer.",
                    "Escrow Commitment: I agree to fund the project budget as specified, understanding funds are held in secure escrow.",
                    "Fair Review: I commit to providing honest and professional feedback upon project completion.",
                    "Timely Verification: I will review submitted milestones within the platform's standard timeframes.",
                    "IP Ownership: I understand that IP rights transfer to me only upon full and final payment.",
                    "Secure Communication: I will keep all mission-critical communication within the platform for audit purposes.",
                    "No Circumvention: I will not attempt to pay the developer outside the platform's secure gateway.",
                    "Dispute Integrity: I agree to follow the platform's mediation process in case of delivery disputes.",
                    "Professional Integrity: I will maintain a respectful and professional working relationship with the developer.",
                    "Data Protection: I will not request or share sensitive personal data outside of professional requirements."
                  ].map((point, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-rose-500 font-black text-[10px]">{i + 1}.</span>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{point}</p>
                    </div>
                  ))}
               </div>

               <label className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-slate-200">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 rounded-lg border-2 border-slate-200 checked:bg-rose-500 checked:border-rose-500 transition-all cursor-pointer"
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  />
                  <span className="text-[11px] text-slate-600 font-bold leading-relaxed">
                     I confirm that I have read and accepted all 10 points of the <span className="text-rose-500 font-black">Strategic Client Protocol</span>.
                  </span>
               </label>
            </div>

            <div className="flex gap-4 shrink-0">
               <button onClick={() => setHiringInfo(null)} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
               <button 
                 onClick={handleConfirmHire}
                 disabled={!isTermsAccepted || isHiring}
                 className="flex-[2] py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-500 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
               >
                 {isHiring ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authorize & Hire Developer'}
               </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default MyProjects;


