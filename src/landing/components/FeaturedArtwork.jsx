import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { featuredArtworks } from '../data/data';

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] },
  },
};

const categoryColors = {
  Painting: 'bg-blue-500/20 text-blue-300',
  Photography: 'bg-purple-500/20 text-purple-300',
  'Digital Art': 'bg-cyan-500/20 text-cyan-300',
  Sculpture: 'bg-orange-500/20 text-orange-300',
  Fashion: 'bg-pink-500/20 text-pink-300',
};

export default function FeaturedArtwork() {
  const [artworks, setArtworks] = useState(featuredArtworks);

  const handleLike = (id) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, likes: a.likes + 1 } : a))
    );
  };

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
            Featured{' '}
            <span className="text-gradient-gold">Artwork</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-inter">
            Curated masterpieces from our top artists
          </p>
        </motion.div>

        <motion.div
          className="masonry-grid"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {artworks.map((art) => (
            <motion.div
              key={art.id}
              variants={itemVariants}
              className="card-hover group relative rounded-xl overflow-hidden bg-[#161616]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={art.image}
                  alt={art.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button
                  onClick={() => handleLike(art.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-gold/80 transition-all z-10"
                  aria-label="Like"
                >
                  <Heart className="w-4 h-4 text-white" />
                </button>
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                    categoryColors[art.category] || 'bg-white/10 text-white/60'
                  }`}
                >
                  {art.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-base font-playfair font-bold text-white truncate">
                  {art.title}
                </h3>
                <p className="text-white/40 text-sm font-inter mt-0.5">
                  {art.artist}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-gold font-semibold font-inter text-sm">
                    {art.price}
                  </span>
                  <span className="text-white/40 text-xs font-inter flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {art.likes}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
