import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ArrowRight, Diamond, X } from 'lucide-react';
import { firebaseClient } from '@/api/firebaseClient';
import { Link } from 'react-router-dom';

export default function SponsoredAdBanner({ placement = 'feed' }) {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    firebaseClient.entities.SponsoredAd.filter({ status: 'active' }, '-created_date', 20)
      .then(ads => {
        if (!ads?.length) return;
        // Elite ads get priority
        const eliteAds = ads.filter(a => a.tier === 'elite');
        const proAds = ads.filter(a => a.tier === 'pro');
        const pool = eliteAds.length ? eliteAds : proAds;
        // Random pick from pool
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setAd(pick);
        setLoaded(true);
        // Track impression
        if (pick?.id) {
          firebaseClient.functions.invoke('trackSponsoredAdEvent', { adId: pick.id, event: 'impression' }).catch(() => {});
        }
      }).catch(() => {});
  }, []);

  const handleClick = () => {
    if (ad?.id) {
      firebaseClient.functions.invoke('trackSponsoredAdEvent', { adId: ad.id, event: 'click' }).catch(() => {});
    }
  };

  if (!loaded || !ad || dismissed) return null;

  const isElite = ad.tier === 'elite';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative rounded-2xl overflow-hidden border ${isElite ? 'border-gold/30' : 'border-sky-400/20'} bg-card`}
        style={isElite ? { boxShadow: '0 0 40px rgba(212,175,55,0.08)' } : {}}
      >
        {/* Sponsored label */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm
            ${isElite ? 'bg-gold/10 text-gold border-gold/25' : 'bg-sky-400/10 text-sky-400 border-sky-400/20'}`}>
            {isElite ? <Diamond className="w-3 h-3 fill-gold/30" /> : <Megaphone className="w-3 h-3" />}
            Sponsored · {isElite ? 'Elite' : 'Pro'}
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 z-10 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="sm:w-48 aspect-video sm:aspect-auto sm:min-h-[140px] overflow-hidden shrink-0">
            <img
              src={ad.image_url}
              alt={ad.headline}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground mb-1">by {ad.artist_name}</p>
            <h4 className="font-playfair font-bold text-lg text-foreground mb-1">{ad.headline}</h4>
            {ad.tagline && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ad.tagline}</p>}
            <div>
              {ad.cta_link ? (
                <Link to={ad.cta_link} onClick={handleClick}>
                  <button className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors
                    ${isElite ? 'bg-gold/15 text-gold hover:bg-gold/25' : 'bg-sky-400/15 text-sky-400 hover:bg-sky-400/25'}`}>
                    {ad.cta_label || 'View Artwork'} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              ) : (
                <button onClick={handleClick} className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors
                  ${isElite ? 'bg-gold/15 text-gold hover:bg-gold/25' : 'bg-sky-400/15 text-sky-400 hover:bg-sky-400/25'}`}>
                  {ad.cta_label || 'View Artwork'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}