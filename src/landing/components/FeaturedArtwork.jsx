import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import { featuredArtworks } from '../data/data';

export default function FeaturedArtwork() {
  const [artworks, setArtworks] = useState(featuredArtworks);

  const handleLike = (id) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likes: a.likes + 1 } : a))
    );
  };

  return (
    <section className="relative py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-text-dark">
              Featured Artwork
            </h2>
            <p className="font-cormorant text-xl text-text-muted italic mt-2">
              Curated masterpieces from our top artists
            </p>
          </div>
          <Link
            to="/gallery"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-inter text-green-primary font-medium hover:text-green-secondary transition-colors"
          >
            View Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((art, i) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="artwork-card bg-card-white rounded-xl overflow-hidden shadow-sm border border-border-light"
            >
              <div className="relative overflow-hidden aspect-[4/5]">
                <img
                  src={art.image}
                  alt={art.title}
                  loading="lazy"
                  className="artwork-image w-full h-full object-cover"
                />
                <div className="artwork-overlay absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button className="px-5 py-2 rounded-full bg-white text-text-dark text-sm font-inter font-medium hover:bg-green-primary hover:text-white transition-all">
                    View
                  </button>
                </div>
                <button
                  onClick={() => handleLike(art.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-green-primary hover:text-white transition-all z-10 shadow-sm"
                  aria-label="Like"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-playfair font-bold text-text-dark truncate">
                  {art.title}
                </h3>
                <p className="text-text-muted text-sm font-inter mt-0.5">
                  {art.artist}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
                  <span className="text-lg font-dmsans font-bold text-green-primary">
                    {art.price}
                  </span>
                  <span className="text-text-muted text-xs font-inter flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {art.likes}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-inter text-green-primary font-medium"
          >
            View Gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
