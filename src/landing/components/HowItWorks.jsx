import { motion } from 'framer-motion';
import { howItWorks } from '../data/data';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
  },
};

export default function HowItWorks() {
  return (
    <section className="relative py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-text-dark mb-4">
            How It Works
          </h2>
          <p className="section-subtitle">Get started in three simple steps</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 relative"
        >
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

          {howItWorks.map((step, i) => (
            <motion.div
              key={step.step}
              variants={stepVariants}
              className="relative flex flex-col items-center text-center px-6"
            >
              <div className="relative z-10 w-20 h-20 rounded-full bg-card-white border border-border-light flex items-center justify-center mb-6 shadow-sm">
                <span className="text-xl font-playfair font-bold text-green-primary">
                  {String(step.step).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-xl font-playfair font-bold text-text-dark mb-3">
                {step.title}
              </h3>
              <p className="text-text-muted text-sm font-inter leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
