import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setEmail('');
  };

  return (
    <section className="relative py-28 bg-[#0D0D0D] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.03] via-transparent to-gold/[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Animated gold orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gold/5 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gold/5 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="glass rounded-3xl p-8 sm:p-12 text-center gold-border"
        >
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-gold" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
            Join the{' '}
            <span className="text-gradient-gold">Collection</span>
          </h2>
          <p className="text-white/40 text-base sm:text-lg font-inter max-w-md mx-auto mb-8">
            Be the first to discover exclusive artwork drops, artist features, and curated collections delivered monthly.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-5 py-3.5 bg-white/5 border border-gold/20 rounded-full text-white text-sm font-inter placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold text-black font-medium rounded-full text-sm tracking-wide hover:bg-gold-light transition-all gold-glow flex-shrink-0"
            >
              Subscribe
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-white/20 text-xs font-inter mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
