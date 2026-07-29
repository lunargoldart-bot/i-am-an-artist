import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative h-[80vh] min-h-[500px] overflow-hidden bg-[#0D0D0D]">
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80"
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/40 to-[#0D0D0D]/60" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair font-bold text-white leading-[0.9] tracking-tight mb-2">
            Every Masterpiece
          </h2>
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-playfair font-bold text-gradient-gold leading-[0.9] tracking-tight mb-8">
            Begins With Courage.
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white/40 text-lg sm:text-xl max-w-lg mx-auto mb-10 font-inter"
        >
          Your journey starts today. Join thousands of artists already sharing their work with the world.
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
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-black font-medium rounded-full text-sm tracking-wide hover:bg-gold-light transition-all gold-glow"
          >
            Explore Marketplace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white/80 font-medium rounded-full text-sm tracking-wide hover:border-white/20 hover:text-white transition-all glass"
          >
            Become an Artist
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
