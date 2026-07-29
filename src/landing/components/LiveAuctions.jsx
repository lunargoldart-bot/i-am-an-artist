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
    <div className="flex gap-3 text-center">
      {Object.entries(time).map(([key, val]) => (
        <div key={key} className="flex flex-col">
          <span className="text-lg font-bold text-white font-inter tabular-nums">
            {String(val).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase text-white/30 tracking-wider font-inter">
            {key}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LiveAuctions() {
  return (
    <section className="relative py-24 bg-[#0D0D0D]">
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <span className="text-xs tracking-[0.2em] uppercase text-gold font-inter">
              Live Now
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white">
            Live{' '}
            <span className="text-gradient-gold">Auctions</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {auctions.map((auction, i) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group glass rounded-2xl overflow-hidden card-hover relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={auction.image}
                  alt={auction.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-inter">
                  <Clock className="w-3 h-3 text-gold" />
                  <span className="text-white/80">
                    {auction.bids} bids
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-playfair font-bold text-white mb-1">
                  {auction.title}
                </h3>
                <p className="text-white/40 text-sm font-inter mb-4">
                  by {auction.artist}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase text-white/30 tracking-wider font-inter mb-1">
                      Current Bid
                    </p>
                    <p className="text-xl font-bold text-gold font-inter">
                      {auction.currentBid}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-white/40 text-sm font-inter">
                    <Users className="w-4 h-4" />
                    {auction.bids}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-white/30 tracking-wider font-inter">
                      Ends in
                    </span>
                    <Countdown endDate={auction.endDate} />
                  </div>
                </div>

                <Link
                  to="/explore"
                  className="group/btn w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gold/10 text-gold border border-gold/20 text-sm font-medium hover:bg-gold hover:text-black transition-all"
                >
                  Place Bid
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
