import { motion } from 'framer-motion';
import { categories } from '../data/data';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

export default function Categories() {
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
            Explore{' '}
            <span className="text-gradient-gold">Categories</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-inter">
            Discover art across every medium and style
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.title}
              variants={cardVariants}
              className="category-card group aspect-[4/3]"
            >
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="border-glow" />
              <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
                <h3 className="text-xl font-playfair font-bold text-white group-hover:text-gold transition-colors duration-500">
                  {cat.title}
                </h3>
                <p className="text-white/50 text-sm font-inter mt-1">
                  {cat.count.toLocaleString()} artworks
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
