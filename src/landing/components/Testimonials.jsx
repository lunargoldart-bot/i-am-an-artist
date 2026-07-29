import { motion } from 'framer-motion';
import { testimonials } from '../data/data';

function TestimonialCard({ name, role, text }) {
  return (
    <div className="glass rounded-2xl p-6 min-w-[320px] max-w-[380px] flex-shrink-0 mx-3">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-gold text-sm">&#9733;</span>
        ))}
      </div>
      <p className="text-white/70 text-sm font-inter leading-relaxed mb-5 line-clamp-4">
        {text}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
          <span className="text-gold text-sm font-semibold font-inter">
            {name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div>
          <p className="text-white text-sm font-medium font-inter">{name}</p>
          <p className="text-white/40 text-xs font-inter">{role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="relative py-24 bg-[#0D0D0D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
            What{' '}
            <span className="text-gradient-gold">Collectors Say</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-inter">
            Hear from our global community
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <div className="testimonial-track flex gap-0">
          {doubled.map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} {...t} />
          ))}
        </div>

        <div
          className="testimonial-track flex gap-0"
          style={{ animationDirection: 'reverse', animationDuration: '45s' }}
        >
          {doubled.reverse().map((t, i) => (
            <TestimonialCard key={`rev-${t.name}-${i}`} {...t} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
