import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { auctions } from '../data/data';

function Countdown({ endDate }) {
  const calcTime = () => {
    const diff = new Date(endDate).getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      mins: Math.floor((diff / (1000 * 60)) % 60),
      secs: Math.floor((diff / 1000) % 60),
    };
  };

  const [time, setTime] = useState(calcTime);

  useEffect(() => {
    const timer = setInterval(() => setTime(calcTime()), 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-2.5">
      {Object.entries(time).map(([key, val]) => (
        <div key={key} className="countdown-item">
          <span className="value">{String(val).padStart(2, '0')}</span>
          <span className="label">{key}</span>
        </div>
      ))}
    </div>
  );
}

export default function LiveAuctions() {
  return (
    <section className="relative py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-primary pulse-dot" />
            </span>
            <span className="text-xs tracking-[0.2em] uppercase text-green-primary font-inter font-medium">
              Live Now
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-text-dark">
            Live Auctions
          </h2>
          <p className="font-cormorant text-xl text-text-muted italic mt-2">
            Bid on exclusive original artworks
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {auctions.map((auction, i) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="auction-card bg-card-white rounded-2xl overflow-hidden shadow-sm border border-border-light"
            >
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={auction.image}
                  alt={auction.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-primary text-white text-xs font-inter shadow-sm">
                  <Users className="w-3 h-3" />
                  <span>{auction.bids} bids</span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-playfair font-bold text-text-dark mb-1">
                  {auction.title}
                </h3>
                <p className="text-text-muted text-sm font-inter mb-5">
                  by {auction.artist}
                </p>

                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] uppercase text-text-muted tracking-wider font-inter mb-1">
                      Current Bid
                    </p>
                    <p className="text-2xl font-bold font-dmsans text-green-primary">
                      {auction.currentBid}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border-light pt-4 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-text-muted tracking-wider font-inter">
                      Ends in
                    </span>
                    <Countdown endDate={auction.endDate} />
                  </div>
                </div>

                <Link
                  to="/explore"
                  className="group inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full border border-green-primary text-green-primary text-sm font-medium hover:bg-green-primary hover:text-white transition-all"
                >
                  Place Bid
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
