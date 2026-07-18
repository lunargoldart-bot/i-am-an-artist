import { motion } from 'framer-motion';
import { Crown, Calendar, MapPin, Users, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GalaInviteTeaser() {
  return (
    <section className="relative overflow-hidden my-8 rounded-none md:rounded-3xl mx-0 md:mx-6 lg:mx-12">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1400&h=700&fit=crop"
          alt="Gala"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#080604] via-[#110d07]/95 to-[#080604]" />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />
      </div>

      {/* Decorative corner ornaments */}
      <div className="absolute top-5 left-5 w-12 h-12 opacity-20"
        style={{ borderTop: '2px solid #d4af37', borderLeft: '2px solid #d4af37' }}
      />
      <div className="absolute top-5 right-5 w-12 h-12 opacity-20"
        style={{ borderTop: '2px solid #d4af37', borderRight: '2px solid #d4af37' }}
      />
      <div className="absolute bottom-5 left-5 w-12 h-12 opacity-20"
        style={{ borderBottom: '2px solid #d4af37', borderLeft: '2px solid #d4af37' }}
      />
      <div className="absolute bottom-5 right-5 w-12 h-12 opacity-20"
        style={{ borderBottom: '2px solid #d4af37', borderRight: '2px solid #d4af37' }}
      />

      <div className="relative max-w-4xl mx-auto px-6 sm:px-12 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          {/* Pre-title */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-gold/70 text-xs font-bold tracking-[0.3em] uppercase">By Invitation Only</span>
            <div className="h-px w-12 bg-gold/30" />
          </div>

          <Crown className="w-10 h-10 text-gold mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.6))' }} />

          <h2 className="font-playfair font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            The Zartia Elite <span style={{ background: 'linear-gradient(135deg, #d4af37, #f5d060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Annual Gala</span>
          </h2>

          <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed mb-8">
            Once a year, the most successful artists, collectors, and cultural leaders in Zambia gather for an evening that cannot be described — only experienced. Close deals. Form partnerships. Change the trajectory of your career.
          </p>

          {/* Details row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm">
            <div className="flex items-center gap-2 text-gold/70">
              <Calendar className="w-3.5 h-3.5" />
              <span>December 2026</span>
            </div>
            <div className="w-1 h-1 bg-gold/30 rounded-full" />
            <div className="flex items-center gap-2 text-gold/70">
              <MapPin className="w-3.5 h-3.5" />
              <span>Taj Pamodzi, Lusaka</span>
            </div>
            <div className="w-1 h-1 bg-gold/30 rounded-full" />
            <div className="flex items-center gap-2 text-gold/70">
              <Users className="w-3.5 h-3.5" />
              <span>80 guests only</span>
            </div>
            <div className="w-1 h-1 bg-gold/30 rounded-full" />
            <div className="flex items-center gap-2 text-white/40">
              <Lock className="w-3.5 h-3.5" />
              <span>Elite members only</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="font-bold px-10 text-sm tracking-wide"
              style={{ background: 'linear-gradient(135deg, #d4af37, #c9992a)', color: '#0a0806' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Request an Invitation
            </Button>
            <p className="text-white/30 text-xs">Requires active Elite membership</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}