import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { 
  Briefcase, 
  Code, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter, 
  Star, 
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

const Portfolio = () => {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.getPublicPortfolio(username);
        setData(res);
      } catch (err) {
        setError(err.message || 'Portfolio not found');
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchPortfolio();
  }, [username]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center p-4">
      <div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <a href="/" className="px-6 py-2 bg-black text-white rounded-full">Return Home</a>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center p-4">
      <p className="text-gray-500 uppercase font-bold">No data available for this profile.</p>
    </div>
  );

  const { user, reviews, projects } = data;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Header / Hero */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          <div className="relative">
            <img 
              src={user.profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
              alt={user.name}
              className="w-40 h-40 rounded-3xl object-cover grayscale border-4 border-black"
            />
            <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-xl">
              <ShieldCheck size={20} />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-5xl font-black tracking-tighter uppercase">{user.name}</h1>
              {user.role === 'student' && (
                <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full uppercase tracking-widest">Verified Dev</span>
              )}
            </div>
            <p className="text-xl text-gray-500 font-medium mb-4">{user.profile?.title || 'Expert Developer'}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold uppercase tracking-wider text-gray-400">
              <span className="flex items-center gap-2"><MapPin size={16} /> {user.profile?.location || 'Remote'}</span>
              <span className="flex items-center gap-2"><Star size={16} fill="black" /> {user.profile?.rating || '5.0'} Rating</span>
              <span className="flex items-center gap-2"><Briefcase size={16} /> {user.profile?.projectsCompleted || 0} Projects</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-8 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform">
              Hire Now
            </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Bio & Skills */}
          <div className="md:col-span-2 space-y-8">
            <div className="p-8 border-2 border-black rounded-3xl">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                <Zap size={24} /> About Me
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg italic">
                "{user.profile?.bio || 'No bio provided yet.'}"
              </p>
            </div>

            <div className="p-8 border-2 border-black rounded-3xl bg-black text-white">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                <Code size={24} /> Tech Stack
              </h2>
              <div className="flex flex-wrap gap-3">
                {user.profile?.skills?.map((skill, index) => (
                  <span key={index} className="px-5 py-2 border border-white/20 rounded-full text-sm font-bold uppercase hover:bg-white hover:text-black transition-colors cursor-default">
                    {skill}
                  </span>
                )) || <p>No skills listed.</p>}
              </div>
            </div>

            {/* Public Projects */}
            <div className="p-8 border-2 border-black rounded-3xl">
              <h2 className="text-2xl font-black uppercase mb-8">Completed Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.length > 0 ? projects.map((project, i) => (
                  <div key={i} className="group p-6 border-2 border-gray-100 rounded-3xl hover:border-black transition-all">
                    <h3 className="font-black uppercase mb-2 group-hover:translate-x-2 transition-transform">{project.title}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400">STATUS: COMPLETED</span>
                      <ExternalLink size={16} className="group-hover:rotate-45 transition-transform" />
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-12 text-gray-400 uppercase font-bold border-2 border-dashed border-gray-200 rounded-3xl">
                    No public projects yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="p-8 border-2 border-black rounded-3xl bg-gray-50">
              <h2 className="text-xl font-black uppercase mb-6">Connect</h2>
              <div className="space-y-4">
                {user.profile?.githubUrl && (
                  <a href={user.profile.githubUrl} className="flex items-center gap-3 font-bold hover:translate-x-2 transition-transform">
                    <Github size={20} /> GITHUB
                  </a>
                )}
                {user.profile?.linkedinUrl && (
                  <a href={user.profile.linkedinUrl} className="flex items-center gap-3 font-bold hover:translate-x-2 transition-transform">
                    <Linkedin size={20} /> LINKEDIN
                  </a>
                )}
                {user.profile?.twitterUrl && (
                  <a href={user.profile.twitterUrl} className="flex items-center gap-3 font-bold hover:translate-x-2 transition-transform">
                    <Twitter size={20} /> TWITTER
                  </a>
                )}
                <a href={`mailto:${user.name}@localdev.com`} className="flex items-center gap-3 font-bold hover:translate-x-2 transition-transform">
                  <Globe size={20} /> WEBSITE
                </a>
              </div>
            </div>

            <div className="p-8 border-2 border-black rounded-3xl">
              <h2 className="text-xl font-black uppercase mb-6">Client Reviews</h2>
              <div className="space-y-6">
                {reviews.length > 0 ? reviews.map((review, i) => (
                  <div key={i} className="pb-6 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500">
                      {[...Array(5)].map((_, star) => (
                        <Star key={star} size={12} fill={star < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 italic">"{review.comment}"</p>
                    <div className="flex items-center gap-2">
                      <img src={review.client?.profile?.avatar} className="w-6 h-6 rounded-full grayscale" />
                      <span className="text-xs font-bold uppercase">{review.client?.name}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-sm uppercase font-bold">No reviews yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <footer className="py-12 border-t border-gray-100 text-center">
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
          Build your own portfolio with LocalDev Connect
        </p>
      </footer>
    </div>
  );
};

export default Portfolio;
