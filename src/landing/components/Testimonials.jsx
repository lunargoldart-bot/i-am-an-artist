import { motion } from 'framer-motion';
import { testimonials } from '../data/data';

function TestimonialCard({ name, role, text, rating }) {
  return (
    <div className="glass-card rounded-2xl p-6 min-w-[340px] max-w-[380px] flex-shrink-0 mx-3">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-green-primary text-base">&#9733;</span>
        ))}
      </div>
      <p className="text-text-dark/70 text-sm font-inter leading-relaxed mb-5 line-clamp-4">
        &ldquo;{text}&rdquo;
      </p>
      <div>
        <p className="text-text-dark text-sm font-dmsans font-bold">{name}</p>
        <p className="text-text-muted text-xs font-inter">{role}</p>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="relative py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-text-dark mb-3">
            What Collectors Say
          </h2>
          <p className="font-cormorant text-xl text-text-muted italic">
            Hear from our global community
          </p>
        </motion.div>
      </div>

      <div className="space-y-6">
        <div className="testimonial-track flex gap-0">
          {doubled.map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} {...t} />
          ))}
        </div>

        <div
          className="testimonial-track flex gap-0"
          style={{ animationDirection: 'reverse', animationDuration: '50s' }}
        >
          {[...doubled].reverse().map((t, i) => (
            <TestimonialCard key={`rev-${t.name}-${i}`} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
