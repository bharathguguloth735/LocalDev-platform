import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Smartphone, PenTool, Cpu, Server, TrendingUp, Download } from 'lucide-react';

const services = [
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Full Stack Web Apps',
    description: 'Custom, blazing-fast web applications that scale effortlessly.',
    advantage: 'Modern codebases built for speed and long-term maintainability.',
    techs: ['React', 'Next.js', 'Node.js'],
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-100',
    badgeColor: 'bg-blue-100 text-blue-700'
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Mobile App Creation',
    description: 'Native and cross-platform mobile apps for iOS and Android.',
    advantage: 'Reach both app stores with a single unified codebase.',
    techs: ['React Native', 'Flutter', 'Swift'],
    color: 'bg-indigo-50 text-indigo-600',
    borderColor: 'border-indigo-100',
    badgeColor: 'bg-indigo-100 text-indigo-700'
  },
  {
    icon: <PenTool className="w-8 h-8" />,
    title: 'UI/UX & Branding',
    description: 'Breathtaking interfaces designed with modern SaaS aesthetics.',
    advantage: 'Fresh design perspectives straight from top universities.',
    techs: ['Figma', 'Framer', 'Tailwind'],
    color: 'bg-purple-50 text-purple-600',
    borderColor: 'border-purple-100',
    badgeColor: 'bg-purple-100 text-purple-700'
  },
  {
    icon: <Cpu className="w-8 h-8" />,
    title: 'AI & Automation',
    description: 'Integrate intelligent AI chatbots and automation pipelines.',
    advantage: 'Students are at the absolute cutting edge of AI research.',
    techs: ['Python', 'TensorFlow', 'OpenAI'],
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-100',
    badgeColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    icon: <Server className="w-8 h-8" />,
    title: 'Backend & Cloud',
    description: 'Robust server architecture, databases, and API development.',
    advantage: 'High-security, decentralized, and cost-effective hosting.',
    techs: ['AWS', 'MongoDB', 'Docker'],
    color: 'bg-amber-50 text-amber-600',
    borderColor: 'border-amber-100',
    badgeColor: 'bg-amber-100 text-amber-700'
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'SEO & Growth Tech',
    description: 'Optimized technical SEO to rank your site on page one.',
    advantage: 'Data-driven growth strategies maximizing organic traffic.',
    techs: ['Analytics', 'Vercel', 'Webflow'],
    color: 'bg-rose-50 text-rose-600',
    borderColor: 'border-rose-100',
    badgeColor: 'bg-rose-100 text-rose-700'
  }
];

const Services = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleServices = showAll ? services : services.slice(0, 3);

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">Elite Tech Services</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our Top Student Developers inject fresh academic perspectives combined with mastery of cutting-edge technologies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`p-8 rounded-[2rem] border ${service.borderColor} shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] transition-all bg-white group hover:-translate-y-1 relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${service.color}`}>
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2 font-heading">{service.title}</h3>
                <p className="text-slate-600 mb-4">
                  {service.description}
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
                   <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">The Advantage</span>
                   <p className="text-sm font-medium text-slate-700">{service.advantage}</p>
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">Technologies</span>
                  <div className="flex flex-wrap gap-2">
                     {service.techs.map(tech => (
                        <span key={tech} className={`px-2.5 py-1 text-xs font-bold rounded-lg ${service.badgeColor}`}>
                           {tech}
                        </span>
                     ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!showAll && (
          <div className="mt-12 flex justify-center w-full">
            <button 
              onClick={() => setShowAll(true)}
              className="px-8 py-3 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl shadow-[0_32px_64px_-12px_rgba(15,23,42,0.3)] hover:bg-slate-800 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
               View All Services Available <Download className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Services;
