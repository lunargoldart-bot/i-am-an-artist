import { motion } from 'framer-motion';
import { Crown, Diamond, Gift, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tiers = [
  {
    name: 'Standard',
    price: 'Free',
    period: '',
    color: 'border-border',
    labelColor: 'text-muted-foreground',
    highlight: false,
    features: [
      'List & sell unlimited artworks',
      'Place bids on auctions',
      'Attend exhibitions',
      'Basic artist profile',
      'Community news feed',
    ],
    note: 'Everything you need to get started.',
    cta: 'You\'re on Standard',
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$80',
    period: '/mo',
    color: 'border-sky-400/40',
    labelColor: 'text-sky-400',
    badge: 'Most Popular',
    badgeColor: 'bg-sky-400/10 text-sky-400 border-sky-400/25',
    highlight: false,
    features: [
      'All Standard features',
      'Sponsored ad campaigns — promote your art',
      'Algorithmic daily feature eligibility',
      'Priority search ranking',
      'AI Collector\'s Insight on your artworks',
      'Auction hosting with promo boost',
      'Advanced analytics dashboard',
    ],
    note: 'For serious artists ready to grow their sales.',
    cta: 'Upgrade to Pro',
    ctaClass: 'bg-sky-500 hover:bg-sky-400 text-white font-semibold',
  },
  {
    name: 'Elite',
    price: '$170',
    period: '/mo',
    color: 'border-gold/45',
    labelColor: 'text-gold',
    badge: 'Most Exclusive',
    badgeColor: 'bg-gold/10 text-gold border-gold/25',
    highlight: true,
    features: [
      'All Pro features',
      'Priority sponsored ad placement — top of feed',
      'Manual daily feature queue — choose your own spotlight date',
      'Annual ZARTIA ELITE Gala invitation',
      'Welcome gift upon subscribing',
      'Private deals room for off-market transactions',
      'Verified Elite badge on profile',
      'Dedicated growth advisor',
    ],
    note: 'For artists building an empire.',
    cta: 'Upgrade to Elite',
    ctaClass: 'gold-gradient text-background font-bold',
    icon: Crown,
  },
];

export default function EliteMembershipBanner() {
  return (
    <section className="relative overflow-hidden py-20 my-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0806] via-[#100c08] to-[#0a0806]" />
      <div className="absolute inset-0 opacity-25"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(212,175,55,0.18) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Diamond className="w-4 h-4 text-gold fill-gold/40" />
            <span className="text-gold text-xs font-bold tracking-[0.2em] uppercase">Zartia Membership Tiers</span>
          </div>
          <h2 className="font-playfair font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            Every Artist Starts Free.<br />
            <span style={{ background: 'linear-gradient(135deg, #d4af37, #f5d060, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              The Best Ones Go Further.
            </span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto leading-relaxed">
            Sell, exhibit, and bid for free. Upgrade when you're ready to dominate — with sponsored ads, daily features, and exclusive elite privileges.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col ${tier.color} ${tier.highlight ? 'bg-gold/[0.06]' : 'bg-white/[0.02]'}`}
              style={tier.highlight ? { boxShadow: '0 0 70px rgba(212,175,55,0.14), inset 0 1px 0 rgba(212,175,55,0.18)' } : {}}
            >
              {tier.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full border whitespace-nowrap ${tier.badgeColor}`}>
                  {tier.badge}
                </div>
              )}

              {/* Tier name + Price */}
              <div className="mb-6">
                <p className={`text-xs font-bold uppercase tracking-[0.18em] mb-3 ${tier.labelColor}`}>{tier.name}</p>
                <div className="flex items-end gap-1">
                  <span className="font-playfair font-bold text-4xl text-white">{tier.price}</span>
                  {tier.period && <span className="text-white/30 text-sm mb-1.5">{tier.period}</span>}
                </div>
                <p className="text-white/30 text-xs mt-2">{tier.note}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tier.highlight ? 'bg-gold/25' : i === 1 ? 'bg-sky-400/20' : 'bg-white/10'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${tier.highlight ? 'bg-gold' : i === 1 ? 'bg-sky-400' : 'bg-white/35'}`} />
                    </div>
                    <span className={`text-sm leading-relaxed ${tier.highlight ? 'text-white/70' : 'text-white/50'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                disabled={tier.disabled}
                size="lg"
                className={`w-full ${tier.disabled ? 'opacity-25 cursor-default bg-white/10 text-white/40 border-0 hover:bg-white/10' : tier.ctaClass}`}
              >
                {tier.icon && <tier.icon className="w-4 h-4 mr-2" />}
                {tier.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Sponsored Ads Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-gold/20 bg-white/[0.03] p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12"
          style={{ boxShadow: '0 0 40px rgba(212,175,55,0.06)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4 text-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-widest">Sponsored Ads — Pro & Elite</span>
            </div>
            <h3 className="font-playfair font-bold text-2xl text-white mb-3">Put Your Art in Front of Every Collector</h3>
            <p className="text-white/45 text-sm leading-relaxed">
              Pro and Elite members can run sponsored ad campaigns directly on the Zartia platform — appearing in the main feed, explore page, and between artworks. 
              Elite members get <span className="text-gold font-semibold">priority placement</span> at the very top of the feed.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { tier: 'Pro', color: 'border-sky-400/30 bg-sky-400/5', badge: 'bg-sky-400/10 text-sky-400 border-sky-400/20', desc: 'Standard ad placement in the explore feed & between artworks' },
              { tier: 'Elite', color: 'border-gold/30 bg-gold/5', badge: 'bg-gold/10 text-gold border-gold/20', desc: 'Priority top-of-feed placement + higher impression budget' },
            ].map(item => (
              <div key={item.tier} className={`rounded-xl border p-4 ${item.color}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${item.badge}`}>{item.tier}</span>
                </div>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Elite Gala Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-gold/25 bg-gold/5 p-8 flex flex-col md:flex-row items-center gap-6"
          style={{ boxShadow: '0 0 40px rgba(212,175,55,0.08)' }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-gold text-xs font-bold uppercase tracking-widest">Elite Exclusive — Only $170/mo</span>
            </div>
            <h3 className="font-playfair font-bold text-2xl text-white mb-2">Annual Gala + Welcome Gift</h3>
            <p className="text-white/45 text-sm leading-relaxed max-w-lg">
              Elite members receive a curated welcome gift upon subscribing and a personal invitation to the annual Zartia Elite Gala in Lusaka — an exclusive evening with collectors, gallery owners, and Zambia's cultural powerhouses.
            </p>
            <p className="text-gold/70 text-xs mt-3 font-medium">Next Gala: December 2026 · Limited to 80 guests</p>
          </div>
          <div className="shrink-0">
            <Button size="lg" className="gold-gradient text-background font-bold">
              <Crown className="w-4 h-4 mr-2" /> Upgrade to Elite — $170/mo
            </Button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}