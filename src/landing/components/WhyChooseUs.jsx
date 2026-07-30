import { motion } from 'framer-motion';
import { ShieldCheck, BadgeCheck, Lock, MessageCircle, Truck } from 'lucide-react';
import { features } from '../data/data';

const iconMap = {
  ShieldCheck, BadgeCheck, Lock, MessageCircle, Truck,
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] },
  }),
};

export default function WhyChooseUs() {
  return (
    <section className="relative py-24 bg-cream">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-text-dark mb-4">
            Why Choose Us
          </h2>
          <p className="section-subtitle">Built for <span className="text-green-primary not-italic font-cormorant">Excellence</span></p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon];
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="feature-card bg-card-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-light"
              >
                <div className="feature-icon w-12 h-12 rounded-full bg-green-primary/10 flex items-center justify-center mb-5">
                  {Icon && <Icon className="w-6 h-6 text-green-primary" />}
                </div>
                <h3 className="text-base md:text-lg font-playfair font-bold text-text-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-muted text-sm font-inter leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
