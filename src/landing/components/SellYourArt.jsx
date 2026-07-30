import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const checklist = [
  'Professional Artist Profile',
  'Reach Global Collectors',
  'Sell Worldwide',
  'Build Your Reputation',
];

export default function SellYourArt() {
  return (
    <section className="relative py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80"
                alt="Artist at work"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-green-primary/10" />
            </div>
            <div className="absolute -top-4 -left-4 w-28 h-28 rounded-2xl border-2 border-green-primary/20 -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="inline-block text-xs tracking-[0.2em] uppercase text-green-primary font-inter font-medium mb-4">
              For Artists
            </span>
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-text-dark mb-5">
              Sell Your Art
            </h2>
            <p className="text-text-muted font-inter leading-relaxed mb-8">
              Join a curated marketplace that connects African and diaspora
              artists with collectors worldwide. Showcase your work, set your
              prices, and build a thriving art career.
            </p>

            <div className="space-y-4 mb-10">
              {checklist.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-green-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span className="text-text-dark font-inter text-sm">{item}</span>
                </motion.div>
              ))}
            </div>

            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-green-primary text-white font-medium rounded-full text-sm tracking-wide hover:bg-green-secondary transition-all green-glow"
            >
              Become an Artist
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
