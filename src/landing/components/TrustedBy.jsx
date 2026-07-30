import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { stats } from '../data/data';

function CounterCard({ label, value, suffix, index }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="text-5xl sm:text-6xl font-playfair font-bold text-green-primary mb-2">
        {inView && <CountUp end={value} suffix={suffix} duration={2.5} separator="," />}
        {!inView && <span>0</span>}
      </div>
      <p className="text-text-muted text-sm sm:text-base font-inter tracking-wide">{label}</p>
    </motion.div>
  );
}

export default function TrustedBy() {
  return (
    <section className="relative py-24 bg-cream overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-primary/[0.02] via-transparent to-green-primary/[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-green-primary/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-text-dark mb-4">
            Trusted by <span className="text-green-primary">Creatives Worldwide</span>
          </h2>
          <div className="mx-auto h-px w-20 bg-green-primary/30" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
          {stats.map((stat, i) => (
            <CounterCard key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
