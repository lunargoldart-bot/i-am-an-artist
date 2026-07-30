import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-cream">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80"
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/60 to-cream/80" />
      </div>

      <div className="relative z-10 h-full min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair font-bold text-text-dark leading-[0.9] tracking-tight mb-2">
            Your Next Masterpiece
          </h2>
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair font-bold text-green-primary leading-[0.9] tracking-tight mb-8">
            Could Inspire The World.
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-muted text-lg sm:text-xl max-w-lg mx-auto mb-10 font-inter"
        >
          Join thousands of artists already sharing their work with the world.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2 px-8 py-4 green-gradient text-white font-medium rounded-full text-sm tracking-wide hover:opacity-90 transition-all green-glow"
          >
            Explore Marketplace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border-light text-text-dark font-medium rounded-full text-sm tracking-wide hover:border-green-primary/30 hover:text-green-primary transition-all bg-card-white"
          >
            Join As Artist
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
