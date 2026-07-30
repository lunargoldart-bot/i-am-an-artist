import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { artistStory } from '../data/data';

export default function ArtistStory() {
  const { name, location, image, journey, quote } = artistStory;

  return (
    <section className="relative py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-2xl border-2 border-green-primary/20 -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="inline-block text-xs tracking-[0.2em] uppercase text-green-primary font-inter font-medium mb-4">
              Artist Stories
            </span>
            <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-text-dark mb-2">
              {name}
            </h2>
            <p className="font-cormorant text-lg text-text-muted italic mb-6">
              {location}
            </p>

            <blockquote className="font-cormorant text-2xl italic text-text-dark/80 leading-relaxed mb-10 pl-6 border-l-2 border-green-primary">
              &ldquo;{quote}&rdquo;
            </blockquote>

            <div className="relative pl-8 mb-10">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-border-light" />
              {journey.map((item, i) => (
                <div key={item.year} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  <div className="absolute left-[-1.15rem] top-1 w-[10px] h-[10px] rounded-full bg-green-primary ring-2 ring-cream z-10" />
                  <span className="text-sm font-dmsans font-bold text-green-primary min-w-[48px]">
                    {item.year}
                  </span>
                  <p className="text-text-dark/70 text-sm font-inter">{item.event}</p>
                </div>
              ))}
            </div>

            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-green-primary text-white font-medium rounded-full text-sm tracking-wide hover:bg-green-secondary transition-all green-glow"
            >
              Become an Artist
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
