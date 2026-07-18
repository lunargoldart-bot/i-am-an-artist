import { motion } from 'framer-motion';
import { TrendingUp, Zap, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const milestones = [
  { month: 'Month 1', earning: 'K2,500', label: 'Your first sale', color: '#6b7280' },
  { month: 'Month 3', earning: 'K12,000', label: 'Consistent collector base', color: '#d4af37' },
  { month: 'Month 6', earning: 'K45,000', label: 'Exhibition featured', color: '#d4af37' },
  { month: 'Year 1', earning: 'K180,000', label: 'Elite membership', color: '#f5d060' },
  { month: 'Year 2', earning: 'K480,000', label: 'National recognition', color: '#f5d060' },
  { month: 'Year 3', earning: 'K1,000,000+', label: 'Millionaire Artist', color: '#fff' },
];

const trustPoints = [
  { icon: Shield, title: 'Zero-Risk Escrow', desc: 'We hold payment securely. You only receive funds once the buyer confirms delivery. No more chasing payments.' },
  { icon: CheckCircle2, title: 'Verified Buyers Only', desc: 'Every buyer on Zartia is verified. No scammers, no ghost buyers — only genuine collectors investing in your work.' },
  { icon: Zap, title: 'Instant Dispute Resolution', desc: 'Any issue? Our team resolves disputes within 24 hours. Your money and reputation are always protected.' },
];

export default function MillionaireTrajectory() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      {/* Trajectory */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" /> Your Growth Trajectory
          </div>
          <h2 className="font-playfair font-bold text-4xl text-foreground mb-3">
            From First Sale to <span className="text-gold">Millionaire Artist</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Based on the earnings data of our top-performing artists. This could be your story.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {milestones.map(({ month, earning, label, color }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative bg-card border border-border rounded-xl p-4 text-center overflow-hidden group hover:border-gold/40 transition-all duration-300"
            >
              {/* Progress fill */}
              <div
                className="absolute bottom-0 left-0 right-0 opacity-10 transition-all duration-500 group-hover:opacity-20"
                style={{ height: `${(i + 1) * 16}%`, background: `linear-gradient(to top, ${color}, transparent)` }}
              />
              <div className="relative">
                <p className="text-xs text-muted-foreground mb-1.5">{month}</p>
                <p className="font-playfair font-bold text-lg mb-1" style={{ color }}>{earning}</p>
                <p className="text-xs text-muted-foreground/70 leading-snug">{label}</p>
              </div>
              {i === milestones.length - 1 && (
                <div className="absolute top-2 right-2">
                  <span className="text-base">👑</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-muted-foreground/50 text-xs italic">*Projections based on average performance of verified Zartia artists. Individual results vary.</p>
        </div>
      </div>

      {/* Trust section */}
      <div className="border-t border-border pt-16">
        <div className="text-center mb-10">
          <h2 className="font-playfair font-bold text-3xl text-foreground mb-2">Built on <span className="text-gold">Trust</span></h2>
          <p className="text-muted-foreground text-sm">Every transaction on Zartia is designed to protect you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {trustPoints.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-5 bg-card border border-border rounded-xl hover:border-gold/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/sell">
            <Button size="lg" className="gold-gradient text-background font-bold hover:opacity-90 px-10">
              Start Your Journey Today <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}