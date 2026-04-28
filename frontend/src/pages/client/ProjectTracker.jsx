import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock, Layout, DollarSign, MessageSquare, ShieldCheck, Video, Zap, FileText, Camera, UploadCloud, ChevronRight, X, Loader2 } from 'lucide-react';
import { api } from '../../api.js';
import { socket } from '../../socket.js';
import { useToast } from '../../components/layout/Toast';

const ProjectTracker = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [submittingPhase, setSubmittingPhase] = useState(false);
  const [artifactData, setArtifactData] = useState({ videoUrl: '', pdfUrl: '', photoUrl: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isStudent = user.role === 'student';

  const fetchProject = async () => {
    try {
      const data = await api.getProjects();
      const found = data.find(p => p._id === projectId);
      if (found) setProject(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();

    const handleUpdate = (updated) => {
      if (updated._id === projectId) setProject(updated);
    };

    socket.on('project:updated', handleUpdate);
    socket.on('project:phase_submitted', ({ project: updated, phaseId }) => {
       if (updated._id === projectId) {
         setProject(updated);
         showToast(`PHASE ${phaseId} DELIVERABLES TRANSMITTED`, 'success');
       }
    });

    return () => {
      socket.off('project:updated', handleUpdate);
      socket.off('project:phase_submitted');
    };
  }, [projectId]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-white p-20 flex flex-col items-center justify-center">
      <p className="text-slate-500 mb-4 font-bold uppercase tracking-widest">Project Not Found</p>
      <button onClick={() => navigate(-1)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Back to Terminal</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Navigation */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-8 text-slate-400 hover:text-indigo-600 transition-colors font-black uppercase text-[10px] tracking-widest border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Previous Sector
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Status Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-0" />
               
                <div className="relative z-10">
                  <div className="mb-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] bg-indigo-50 px-3 py-1 rounded-lg">Mission Command Monitor</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 mb-2 leading-none uppercase tracking-tighter flex items-center gap-4">
                    Project Tracker
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  </h1>
                  <h2 className="text-xl font-bold text-slate-500 mb-6 uppercase tracking-tight">{project.title}</h2>
                  <div className="flex items-center gap-3 mb-6">
                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${
                     project.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 
                     project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                   }`}>
                     Status: {project.status.replace('_', ' ')}
                   </span>
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ref: {projectId.slice(-8)}</span>
                 </div>
                 
                 <h1 className="text-3xl font-black text-slate-900 mb-6 leading-tight uppercase tracking-tighter">{project.title}</h1>
                 
                 <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <Layout className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                          <p className="text-[11px] font-bold text-slate-700 uppercase">{project.category}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <DollarSign className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget Locked</p>
                          <p className="text-[11px] font-bold text-slate-700 font-mono">${project.budget}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <Clock className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days Remaining</p>
                          <p className="text-[11px] font-bold text-indigo-600 uppercase">
                             {project.deadline ? (
                               (() => {
                                 const diff = new Date(project.deadline) - new Date();
                                 const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                 return days > 0 ? `${days} Days Left` : 'Deadline Passed';
                               })()
                             ) : '14-21 Days'}
                          </p>
                       </div>
                    </div>
                 </div>
               </div>
            </div>

            {/* Work Progression Protocol (Reference: Time Management Workflow) */}
            <div className="bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Work Progression Protocol</h3>
               <div className="flex flex-col md:flex-row items-center gap-4">
                  {[
                    { name: 'Setup', icon: Layout, color: 'text-purple-600', bg: 'bg-purple-50', status: 'done' },
                    { name: 'Entry', icon: Clock, color: 'text-green-600', bg: 'bg-green-50', status: project.status === 'in_progress' ? 'active' : project.status === 'open' ? 'pending' : 'done' },
                    { name: 'Approval', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', status: project.status === 'review' ? 'active' : (project.status === 'completed' ? 'done' : 'pending') },
                    { name: 'Posting', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', status: project.status === 'completed' ? 'done' : 'pending' }
                  ].map((step, i, arr) => (
                    <React.Fragment key={step.name}>
                       <div className="flex-1 w-full group">
                          <div className={`p-6 rounded-[30px] border transition-all flex flex-col items-center text-center relative ${
                             step.status === 'done' ? 'bg-slate-50 border-slate-100 opacity-60' : 
                             step.status === 'active' ? 'bg-white border-indigo-200 shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] scale-105 z-10' : 'bg-white border-slate-100 opacity-30'
                           }`}>
                             <div className={`w-12 h-12 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                                <step.icon className="w-6 h-6" />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{step.name}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                                {step.status === 'done' ? 'Protocol Executed' : step.status === 'active' ? 'Active Session' : 'Awaiting Trigger'}
                             </p>
                          </div>
                       </div>
                       {i < arr.length - 1 && (
                         <div className="hidden md:block text-slate-200">
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                         </div>
                       )}
                    </React.Fragment>
                  ))}
               </div>
            </div>

             {/* Phase Selection Hub */}
             <div className="bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] border border-slate-100">
                <div className="flex justify-between items-end mb-8">
                   <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Neural Phase Protocol</h3>
                      <p className="text-xl font-black text-slate-900 uppercase">Mission Roadmap</p>
                   </div>
                   <div className="text-right">
                      <span className="text-4xl font-black text-indigo-600 font-mono">{project.progress || 0}%</span>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Completion</p>
                   </div>
                </div>

                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-10">
                   <div className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ width: `${project.progress || 0}%` }} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {(project.phases && project.phases.length > 0 ? project.phases : [
                     { phaseId: 1, title: 'Phase 1: Recruiting', description: 'Establishing mission links.', status: project.status === 'open' ? 'active' : 'completed' },
                     { phaseId: 2, title: 'Phase 2: Active Dev', description: 'Neural construction phase.', status: project.status === 'in_progress' ? 'active' : 'pending' },
                     { phaseId: 3, title: 'Phase 3: Audit Mode', description: 'Quality assurance protocol.', status: project.status === 'review' ? 'active' : 'pending' },
                     { phaseId: 4, title: 'Phase 4: Settled', description: 'Capital release & archival.', status: project.status === 'completed' ? 'active' : 'pending' }
                   ]).map(phase => (
                     <button 
                       key={phase.phaseId}
                       onClick={() => setSelectedPhase(phase)}
                        className={`w-full text-left p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 group relative overflow-hidden
                          ${phase.status === 'active' ? 'border-indigo-600 bg-indigo-50/30 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.12)] scale-[1.02]' : 
                            phase.status === 'completed' ? 'border-emerald-100 bg-emerald-50/10 opacity-70' : 
                            'border-slate-50 bg-white opacity-40 hover:opacity-100'}
                        `}
                     >
                       <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-xl ${phase.status === 'active' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'} transition-colors`}>
                             {phase.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                             phase.status === 'active' ? 'bg-indigo-600 text-white' : 
                             phase.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                             {phase.status}
                          </span>
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{phase.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">{phase.description}</p>
                       </div>
                       <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Open Submission Portal <ChevronRight className="w-3 h-3" />
                       </div>
                     </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Assigned Resource</h3>
               
               {project.developer ? (
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <img src={project.developer.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${project.developer.name}`} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-900 shadow-xl" alt="dev" />
                       <div>
                          <h4 className="text-lg font-black text-white leading-tight uppercase tracking-tight">{project.developer.name}</h4>
                          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Senior AI Catalyst</span>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => navigate(`/client-dashboard/messages?userId=${project.developer._id}`)}
                        className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Command Pulse
                      </button>
                      <button 
                        onClick={() => {
                          const meetCode = `ldc-${projectId.slice(-4)}-${projectId.slice(0, 4)}`;
                          window.open(`https://meet.google.com/${meetCode}`, '_blank');
                          showToast('VIDEO BRIDGE ESTABLISHED: Encrypted link generated.', 'info');
                        }}
                        className="w-full py-4 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" /> Video Bridge
                      </button>
                    </div>
                 </div>
               ) : (
                 <div className="text-center py-6">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                       <Layout className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awaiting Linkage</p>
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Phase Submission Portal (Modal) ── */}
      <AnimatePresence>
        {selectedPhase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedPhase(null)} />
             <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-[0_60px_120px_-20px_rgba(79,70,229,0.25)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                <button onClick={() => setSelectedPhase(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors">
                   <X className="w-6 h-6" />
                </button>

                <div className="p-10">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                         <Zap className="w-7 h-7" />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{selectedPhase.title}</h2>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Phase ID: {selectedPhase.phaseId} {" // "} {selectedPhase.status.toUpperCase()}</p>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Phase Intelligence</h4>
                      <p className="text-[12px] text-slate-600 font-bold leading-relaxed">{selectedPhase.description}</p>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Confirmation Artifacts</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {[
                           { label: 'Live Demo Video', icon: Video, color: 'text-rose-600', key: 'videoUrl', placeholder: 'https://vimeo.com/...' },
                           { label: 'Technical PDF', icon: FileText, color: 'text-indigo-600', key: 'pdfUrl', placeholder: 'https://drive.google.com/...' },
                           { label: 'Visual Capture', icon: Camera, color: 'text-amber-600', key: 'photoUrl', placeholder: 'https://cloudinary.com/...' }
                         ].map(artifact => (
                           <div key={artifact.key} className="flex flex-col gap-2">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{artifact.label}</label>
                              <div className="relative group">
                                 <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <artifact.icon className={`w-4 h-4 ${artifact.color}`} />
                                 </div>
                                 <input 
                                   type="text" 
                                   placeholder={artifact.placeholder}
                                   value={artifactData[artifact.key]}
                                   onChange={(e) => setArtifactData(prev => ({ ...prev, [artifact.key]: e.target.value }))}
                                   className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-[10px] font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                 />
                              </div>
                           </div>
                         ))}
                      </div>

                      <div className="pt-8 flex gap-4">
                         <button onClick={() => setSelectedPhase(null)} className="flex-1 py-4 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Abort</button>
                         {isStudent && selectedPhase.status === 'active' && (
                           <button 
                             onClick={async () => {
                               setSubmittingPhase(true);
                               try {
                                 await api.submitPhase(projectId, selectedPhase.phaseId, artifactData);
                                 setSelectedPhase(null);
                                 setArtifactData({ videoUrl: '', pdfUrl: '', photoUrl: '' });
                                 fetchProject();
                               } catch (e) { showToast('Transmission Error', 'error'); }
                               finally { setSubmittingPhase(false); }
                             }}
                             className="flex-[2] py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                           >
                             {submittingPhase ? <UploadCloud className="w-4 h-4 animate-bounce" /> : <><UploadCloud className="w-4 h-4" /> Finalize Phase Confirmation</>}
                           </button>
                         )}
                         {!isStudent && selectedPhase.status === 'completed' && (
                           <button 
                             onClick={async () => {
                               setSubmittingPhase(true);
                               try {
                                 await api.approvePhase(projectId, selectedPhase.phaseId);
                                 setSelectedPhase(null);
                                 fetchProject();
                                 showToast(`PHASE ${selectedPhase.phaseId} VALIDATED`, 'success');
                               } catch (e) { showToast('Approval Protocol Failure', 'error'); }
                               finally { setSubmittingPhase(false); }
                             }}
                             className="flex-[2] py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                           >
                             {submittingPhase ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Authorize Next Sequence</>}
                           </button>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectTracker;
