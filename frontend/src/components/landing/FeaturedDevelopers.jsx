import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Download, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const allDevelopers = [
  { name: 'Aarav Patel', role: 'Full Stack Developer', university: 'IIT Bombay, India', rating: 5.0, projects: 18, skills: ['MERN Stack', 'Next.js', 'TS'], interestedIn: 'E-commerce & SaaS', image: 'https://i.pravatar.cc/150?u=a042581f4e290260241' },
  { name: 'Priya Sharma', role: 'Backend Engineer', university: 'IIT Delhi, India', rating: 4.9, projects: 14, skills: ['Node.js', 'Python', 'AWS'], interestedIn: 'Data & AI', image: 'https://i.pravatar.cc/150?u=a012581f4e290260241' },
  { name: 'Rohan Gupta', role: 'UI/UX Designer', university: 'BITS Pilani, India', rating: 5.0, projects: 8, skills: ['Figma', 'Framer', 'CSS'], interestedIn: 'Fintech Apps', image: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { name: 'Ananya Singh', role: 'Mobile App Developer', university: 'NIT Trichy, India', rating: 4.8, projects: 15, skills: ['React Native', 'Firebase', 'Swift'], interestedIn: 'Social Platforms', image: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { name: 'Vihaan Das', role: 'Frontend Specialist', university: 'VIT Vellore, India', rating: 4.7, projects: 9, skills: ['Vue.js', 'Tailwind', 'WebGL'], interestedIn: 'Interactive Design', image: 'https://i.pravatar.cc/150?u=a04251114e29026702d' },
  { name: 'Ishita Reddy', role: 'Blockchain Dev', university: 'IIIT Hyderabad, India', rating: 4.9, projects: 22, skills: ['Solidity', 'Web3.js', 'React'], interestedIn: 'Smart Contracts', image: 'https://i.pravatar.cc/150?u=b042581f4e29026704d' },
  { name: 'Dev Joshi', role: 'Data Scientist', university: 'Delhi Technological Univ, India', rating: 4.8, projects: 11, skills: ['Python', 'TensorFlow', 'SQL'], interestedIn: 'Machine Learning', image: 'https://i.pravatar.cc/150?u=c042581f4e29026704d' },
  { name: 'Kavya Mehra', role: 'Game Developer', university: 'SRM University, India', rating: 4.9, projects: 6, skills: ['Unity', 'C#', 'Blender'], interestedIn: 'Indie Games 3D', image: 'https://i.pravatar.cc/150?u=d042581f4e29026704d' },
  { name: 'Arjun Nair', role: 'DevOps Engineer', university: 'Anna University, India', rating: 4.7, projects: 15, skills: ['Docker', 'Kubernetes', 'CI/CD'], interestedIn: 'Cloud Architecture', image: 'https://i.pravatar.cc/150?u=e042581f4e29026704d' },
  { name: 'Diya Verma', role: 'React Developer', university: 'Jadavpur University, India', rating: 4.9, projects: 10, skills: ['React', 'Redux', 'GraphQL'], interestedIn: 'Enterprise Dashboards', image: 'https://i.pravatar.cc/150?u=f042581f4e29026704d' },
  { name: 'Yash Agarwal', role: 'Cybersecurity', university: 'NSUT Delhi, India', rating: 5.0, projects: 7, skills: ['Pen Testing', 'C++', 'Networks'], interestedIn: 'Security Audits', image: 'https://i.pravatar.cc/150?u=g042581f4e29026704d' },
  { name: 'Sneha Iyer', role: 'Brand Designer', university: 'NID Ahmedabad, India', rating: 4.8, projects: 13, skills: ['Illustrator', 'Branding', 'Typography'], interestedIn: 'Startups & Branding', image: 'https://i.pravatar.cc/150?u=h042581f4e29026704d' },
  { name: 'Kunal Choudhary', role: 'Full Stack Dev', university: 'MNIT Jaipur, India', rating: 4.6, projects: 4, skills: ['Django', 'Python', 'React'], interestedIn: 'Agritech Solutions', image: 'https://i.pravatar.cc/150?u=i042581f4e29026704d' },
  { name: 'Meera Rao', role: 'AR/VR Developer', university: 'COEP Pune, India', rating: 4.9, projects: 5, skills: ['Unreal', 'C++', 'Three.js'], interestedIn: 'Virtual Showrooms', image: 'https://i.pravatar.cc/150?u=j042581f4e29026704d' },
  { name: 'Karthik Shetty', role: 'SEO Specialist', university: 'Manipal Institute, India', rating: 4.7, projects: 19, skills: ['SEO', 'Analytics', 'Content'], interestedIn: 'Organic Growth', image: 'https://i.pravatar.cc/150?u=k042581f4e29026704d' },
  { name: 'Aditi Deshmukh', role: 'Flutter Dev', university: 'VJTI Mumbai, India', rating: 5.0, projects: 16, skills: ['Flutter', 'Dart', 'Firebase'], interestedIn: 'Cross-Platform Mobile', image: 'https://i.pravatar.cc/150?u=l042581f4e29026704d' },
  { name: 'Aditya Bhat', role: 'QA Tester', university: 'RVCE Bangalore, India', rating: 4.9, projects: 21, skills: ['Selenium', 'Jest', 'Cypress'], interestedIn: 'Automated Testing', image: 'https://i.pravatar.cc/150?u=m042581f4e29026704d' },
  { name: 'Neha Kapoor', role: 'Systems Admin', university: 'Delhi University, India', rating: 4.6, projects: 8, skills: ['Linux', 'Shell ', 'Bash'], interestedIn: 'Server Maintenance', image: 'https://i.pravatar.cc/150?u=n042581f4e29026704d' },
  { name: 'Raghav Menon', role: 'Webflow Expert', university: 'PES University, India', rating: 4.8, projects: 12, skills: ['Webflow', 'CSS', 'JS'], interestedIn: 'Marketing Sites', image: 'https://i.pravatar.cc/150?u=o042581f4e29026704d' },
  { name: 'Shruti Pillai', role: 'Product Manager', university: 'NIT Warangal, India', rating: 5.0, projects: 10, skills: ['Agile', 'Jira', 'Notion'], interestedIn: 'Project Scoping', image: 'https://i.pravatar.cc/150?u=p042581f4e29026704d' },
  { name: 'Varun Desai', role: 'SaaS Architect', university: 'IIT Kanpur, India', rating: 4.9, projects: 17, skills: ['Microservices', 'Go', 'AWS'], interestedIn: 'B2B Software', image: 'https://i.pravatar.cc/150?u=q042581f4e29026704d' },
];

const FeaturedDevelopers = ({ limit, hideHeader }) => {
  const visibleDevs = limit ? allDevelopers.slice(0, limit) : allDevelopers;

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Render Title explicitly without any right-hand secondary buttons */}
        {!hideHeader && (
          <div className="flex flex-col mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">Top Student Developers</h2>
            <p className="text-lg text-slate-600">Hire highly-rated students ready to tackle your project.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {visibleDevs.map((dev, index) => (
              <motion.div
                key={dev.name + index}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img src={dev.image} alt={dev.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-50 shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2">
                         <h3 className="font-bold text-slate-900">{dev.name}</h3>
                         <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <p className="text-[10px] font-black uppercase text-primary tracking-widest">{dev.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg border border-yellow-400/20">
                       <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                       <span className="text-[10px] font-black text-yellow-700">{dev.rating.toFixed(1)}</span>
                     </div>
                     <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mt-1">{90 + Math.floor(Math.random() * 9)}% Match</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{dev.university}</span>
                  <span className="mx-1 shrink-0">•</span>
                  <span className="shrink-0 font-bold text-slate-700">{dev.projects} Projects</span>
                </div>
                
                <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 text-xs font-bold text-primary mb-5 flex items-center justify-between">
                   <span className="opacity-80">Interested In:</span>
                   <span className="text-slate-800">{dev.interestedIn}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 min-h-[56px] content-start">
                  {dev.skills.map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>

                <Link to="/explore" className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-2">
                  View Profile
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Exclusive 'View All' Bottom View - Adding Download Icon as requested */}
        <div className="mt-12 flex justify-center w-full">
           {limit && limit < allDevelopers.length ? (
              <Link to="/explore" className="px-8 py-3 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl shadow-[0_32px_64px_-12px_rgba(15,23,42,0.3)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                 View All Developers <Download className="w-4 h-4 ml-1" />
              </Link>
           ) : (
              hideHeader && (
                 <Link to="/" className="px-8 py-3 bg-white border border-slate-200 text-slate-800 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    &larr; Go Back to Home
                 </Link>
              )
           )}
        </div>

      </div>
    </section>
  );
};

export default FeaturedDevelopers;
