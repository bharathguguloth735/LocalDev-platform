import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "LocalDev Connect was exactly what my small bakery needed. We got a beautiful e-commerce site for a fraction of agency prices, and the student developer was incredibly professional.",
    name: "Maria Rodriguez",
    business: "Sweet Tooth Bakery",
    image: "https://i.pravatar.cc/150?u=a042581f4e39026024d"
  },
  {
    quote: "The AI matching was spot on. Our developer understood our requirements perfectly and delivered a custom inventory management app ahead of schedule.",
    name: "James Wilson",
    business: "Wilson Auto Parts",
    image: "https://i.pravatar.cc/150?u=a042581f4f29026704d"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-32"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">Success Stories</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how local businesses are thriving with custom software built by our student developers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-[0_32px_64px_-12px_rgba(79,70,229,0.08)] relative"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-primary/10 rotate-180" />
              <p className="text-lg text-slate-700 italic mb-8 relative z-10 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-primary font-medium">{testimonial.business}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Projects Completed', value: '500+' },
            { label: 'Student Developers', value: '1,200+' },
            { label: 'Local Businesses', value: '350+' },
            { label: 'Average Rating', value: '4.9/5' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold font-heading text-slate-900 mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
