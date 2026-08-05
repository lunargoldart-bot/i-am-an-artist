import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { categories } from '../data/data';

export default function Categories() {
  const scrollRef = useRef(null);

  return (
    <section className="relative py-24 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-text-dark">
              Featured Collections
            </h2>
            <p className="font-cormorant text-xl text-text-muted italic mt-2">
              Curated categories for the discerning collector
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-inter text-green-primary font-medium hover:text-green-secondary transition-colors"
          >
            View All <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-4 sm:px-6 pb-4 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {categories.map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="collection-slide relative overflow-hidden rounded-2xl min-w-[280px] aspect-[3/4] flex-shrink-0 group cursor-pointer"
            style={{ scrollSnapAlign: 'start' }}
          >
            <img
              src={cat.image}
              alt={cat.title}
              loading="lazy"
              className="collection-image w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <h3 className="text-2xl font-playfair font-bold text-white">
                {cat.title}
              </h3>
              <p className="text-white/70 text-sm font-inter mt-1">
                {cat.count.toLocaleString()} artworks
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8 sm:hidden">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm font-inter text-green-primary font-medium"
        >
          View All Collections <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
