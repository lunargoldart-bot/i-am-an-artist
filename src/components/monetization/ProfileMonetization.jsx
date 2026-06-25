import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Crown, Diamond, Megaphone, Heart, Zap, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    color: 'border-border',
    icon: Heart,
    features: [
      'Upload & sell artworks',
      '2% cashback on purchases',
      'Basic profile',
      'Community access',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro Artist',
    price: 800,
    color: 'border-primary',
    icon: Zap,
    features: [
      '5% cashback on purchases',
      'Run sponsored ads',
      'Priority support',
      'Advanced analytics',
      'Featured in Pro gallery',
      '10% commission discount',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'elite',
    name: 'Elite Member',
    price: 2800,
    color: 'border-gold',
    icon: Diamond,
    features: [
      '5% cashback on purchases',
      'Run sponsored ads',
      'Manual feature queue slots',
      'Elite badge on profile',
      'First in search results',
      'VIP support',
      'Exclusive Elite gallery',
      '15% commission discount',
    ],
    cta: 'Upgrade to Elite',
    premium: true,
  },
];

export default function ProfileMonetization() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleUpgrade = async (tierId) => {
    setUpgrading(tierId);
    try {
      // In production, this would open Lipila payment
      // For now, simulate upgrade
      await base44.auth.updateMe({ 
        subscription_tier: tierId,
        subscription_start_date: new Date().toISOString(),
      });
      
      // Record revenue for platform
      const tier = TIERS.find(t => t.id === tierId);
      if (tier.price > 0) {
        await base44.functions.invoke('recordRevenue', {
          transaction_id: `sub_${user.email}_${Date.now()}`,
          transaction_type: 'elite_subscription',
          amount: tier.price,
          artist_email: user.email,
          payment_status: 'collected',
          payment_date: new Date().toISOString(),
          notes: `Monthly subscription: ${tier.name}`,
        });
      }

      toast.success(`Upgraded to ${tier.name}!`);
      setUser({ ...user, subscription_tier: tierId });
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) return <div className="animate-pulse h-64 rounded-2xl bg-muted" />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
          Monetize Your Profile
        </h1>
        <p className="text-muted-foreground font-inter max-w-2xl mx-auto text-lg">
          Upgrade your profile to unlock premium features, earn higher cashback, and help the Zambian art community grow. 
          Your subscription directly supports platform development and artist rewards.
        </p>
      </div>

      {/* Current Tier Banner */}
      {user?.subscription_tier && (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-gold/10 to-primary/10 border border-gold/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.subscription_tier === 'elite' ? (
              <Diamond className="w-6 h-6 text-gold" />
            ) : user.subscription_tier === 'pro' ? (
              <Zap className="w-6 h-6 text-primary" />
            ) : (
              <Heart className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <p className="font-semibold">
                Current Plan: <span className="capitalize">{user.subscription_tier}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {user.subscription_tier === 'basic' 
                  ? 'Upgrade to unlock premium features' 
                  : 'Thank you for supporting the community!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          const isCurrent = user?.subscription_tier === tier.id;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col border-2 ${tier.color} ${
                tier.popular ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              } ${tier.premium ? 'bg-gradient-to-b from-gold/5 to-card' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    tier.premium ? 'bg-gold/10' : tier.id === 'pro' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-7 h-7 ${
                      tier.premium ? 'text-gold' : tier.id === 'pro' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <CardTitle className="font-playfair text-xl">{tier.name}</CardTitle>
                  <CardDescription className="font-inter">
                    {tier.price === 0 ? 'Free forever' : `ZMW ${tier.price}/month`}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={tier.disabled || upgrading === tier.id || isCurrent}
                    className={`w-full font-semibold ${
                      tier.premium 
                        ? 'gold-gradient text-background hover:opacity-90' 
                        : tier.id === 'pro'
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {upgrading === tier.id ? (
                      'Upgrading...'
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      <>
                        {tier.cta} <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                  
                  {tier.price > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Supports platform & artist rewards
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Impact Section */}
      <div className="mt-12 p-6 rounded-2xl bg-card border border-border">
        <h3 className="font-playfair text-xl font-bold mb-4 text-center">
          How Your Subscription Helps
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <p className="font-semibold text-sm mb-1">Community Rewards</p>
            <p className="text-xs text-muted-foreground">Funds cashback & loyalty programs for all users</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
              <Megaphone className="w-6 h-6 text-gold" />
            </div>
            <p className="font-semibold text-sm mb-1">Platform Growth</p>
            <p className="text-xs text-muted-foreground">Supports development & new features</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-green-500" />
            </div>
            <p className="font-semibold text-sm mb-1">Artist Support</p>
            <p className="text-xs text-muted-foreground">Helps promote Zambian artists globally</p>
          </div>
        </div>
      </div>
    </div>
  );
}