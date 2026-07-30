import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setEmail('');
  };

  return (
    <section className="relative py-28 bg-cream overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-green-primary/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-green-primary/[0.03] blur-[80px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="glass-card rounded-3xl p-8 sm:p-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-text-dark mb-4">
            Stay Inspired
          </h2>
          <p className="text-text-muted text-base sm:text-lg font-inter max-w-md mx-auto mb-8">
            Receive curated collections and exclusive artist stories.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-3.5 bg-cream border border-border-light rounded-full text-text-dark text-sm font-inter placeholder:text-text-muted focus:outline-none focus:border-green-primary/40 transition-colors"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 green-gradient text-white font-medium rounded-full text-sm tracking-wide hover:opacity-90 transition-all green-glow flex-shrink-0"
            >
              Subscribe
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-text-muted/50 text-xs font-inter mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
