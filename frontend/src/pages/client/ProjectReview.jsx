import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Send, CheckCircle, Shield, ArrowLeft } from 'lucide-react';
import { api } from '../../api.js';

const ProjectReview = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  React.useEffect(() => {
    const checkVentureStatus = async () => {
      try {
        const data = await api.getProjects();
        const found = data.find(p => p._id === projectId);
        if (!found || found.status !== 'completed') {
           navigate('/client-dashboard');
           return;
        }
        setProject(found);
      } catch (err) {
        navigate('/client-dashboard');
      } finally {
        setLoading(false);
      }
    };
    checkVentureStatus();
  }, [projectId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitReview({
        projectId,
        rating,
        comment: feedback
      });
      setIsSubmitted(true);
      setTimeout(() => {
         navigate('/client-dashboard');
      }, 100);
    } catch (err) {
      alert("Intelligence Sync Failure: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 font-sans">
         <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
            <CheckCircle className="w-12 h-12" />
         </div>
         <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">Transmission Successful</h1>
         <p className="text-slate-400 font-medium">Your feedback has been archived in the venture record.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-14 font-sans selection:bg-indigo-100">
      <div className="max-w-3xl mx-auto">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black uppercase text-[10px] tracking-widest mb-12 border-none bg-transparent cursor-pointer">
           <ArrowLeft className="w-4 h-4" /> Back to Console
        </button>

        <div className="bg-white rounded-[50px] p-10 md:p-16 border border-slate-100 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Star className="w-7 h-7" /></div>
                 <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Client Review</h1>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block">Dossier: {projectId?.substring(0,10)}...</span>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                 <div>
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 block">Execution Rating</label>
                    <div className="flex gap-4">
                       {[1, 2, 3, 4, 5].map((star) => (
                          <button
                             key={star}
                             type="button"
                             className="border-none bg-transparent cursor-pointer p-0 outline-none transition-transform active:scale-90"
                             onClick={() => setRating(star)}
                             onMouseEnter={() => setHover(star)}
                             onMouseLeave={() => setHover(0)}
                          >
                             <Star 
                                className={`w-12 h-12 transition-colors ${
                                   star <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-100'
                                }`}
                             />
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 block">Strategic Feedback</label>
                    <div className="relative">
                       <textarea 
                          required
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide detailed feedback on project execution, quality, and technical parity..."
                          className="w-full bg-slate-50 border border-slate-100 rounded-[30px] p-10 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-indigo-600/20 focus:bg-white transition-all outline-none resize-none h-64 shadow-inner"
                       />
                       <div className="absolute top-8 right-8 text-slate-200">
                          <MessageSquare className="w-10 h-10" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                       <Shield className="w-5 h-5 text-indigo-500" /> Secure Submission Channel
                    </div>
                    <button 
                       type="submit"
                       disabled={rating === 0 || !feedback.trim() || submitting}
                       className="w-full md:w-auto bg-slate-950 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-indigo-600 disabled:opacity-20 disabled:hover:bg-slate-950 transition-all shadow-xl active:scale-95 border-none outline-none cursor-pointer"
                    >
                       {submitting ? 'Syncing...' : 'Commit Review'} <Send className="w-5 h-5" />
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectReview;
