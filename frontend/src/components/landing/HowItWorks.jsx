import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Consult & Outline',
    description: 'Share your project details and get instant AI estimates.',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    number: '02',
    title: 'AI Smart-Matching',
    description: 'Our AI instantly matches you with the perfect student developer for your specific tech needs.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    number: '03',
    title: 'Secure Smart Escrow',
    description: 'Funds are held securely. Devs only get paid when you are 100% satisfied.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    number: '04',
    title: 'Collaborative Build',
    description: 'Chat directly, track live progress, and request real-time modifications.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    number: '05',
    title: 'Code Handover & Launch',
    description: 'Approve the final work, receive full code IP ownership, and launch!',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-6">
              How <span className="text-gradient">LocalDev Connect</span> Works
            </h2>
            <p className="text-lg text-slate-600">
              A streamlined, highly transparent 5-step process designed to protect your investment and guarantee a premium product.
            </p>
        </div>
        
        <div className="space-y-12 md:space-y-20 relative">
          {/* Vertical Connecting Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/10 via-primary/30 to-indigo-500/10 -translate-x-1/2"></div>

          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-12 items-center relative z-10`}
              >
                {/* Visual Side */}
                <div className="w-full md:w-1/2 relative group">
                  <div className={`absolute inset-0 bg-gradient-to-tr from-primary/20 to-indigo-400/20 blur-3xl rounded-full transform ${isEven ? '-translate-x-4' : 'translate-x-4'}`}></div>
                  <div className="relative rounded-[1.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(79,70,229,0.15)] border-4 border-white transform transition-transform duration-700 group-hover:scale-[1.02]">
                    <img src={step.image} alt={step.title} className="w-full h-[220px] md:h-[260px] object-cover" />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                </div>

                {/* Text Side */}
                <div className="w-full md:w-1/2 relative">
                  {/* Center Node on Desktop */}
                  <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${isEven ? '-left-10 md:-left-[calc(2rem+1px)]' : '-right-10 md:-right-[calc(2rem-3px)]'} w-12 h-12 rounded-full bg-white border-4 border-slate-50 shadow-md items-center justify-center font-bold text-primary z-20`}>
                    {step.number}
                  </div>

                  <div className={`glass p-8 md:p-12 rounded-3xl ${isEven ? 'md:ml-auto' : 'md:mr-auto'} border border-slate-100 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.12)] transition-shadow`}>
                    <div className="md:hidden w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary mb-6">
                      {step.number}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold font-heading text-slate-900 mb-4">{step.title}</h3>
                    <p className="text-slate-600 text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
