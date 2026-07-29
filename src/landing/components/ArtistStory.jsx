import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const progressData = [
  { label: 'Global Reach', value: 94 },
  { label: 'Artist Satisfaction', value: 98 },
  { label: 'Sales Growth', value: 87 },
];

export default function ArtistStory() {
  const sectionRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.fromTo(
          bar,
          { width: '0%' },
          {
            width: `${progressData[i].value}%`,
            duration: 1.5,
            delay: 0.3 + i * 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 bg-[#161616]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative group cursor-pointer"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
                alt="Artist in studio"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gold/90 flex items-center justify-center group-hover:bg-gold transition-all group-hover:scale-110 duration-500">
                  <Play className="w-8 h-8 text-black ml-1" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border border-gold/20 rounded-2xl -z-10" />
          </motion.div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-xs tracking-[0.2em] uppercase text-gold font-inter mb-4">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-6 leading-tight">
                Every Artist{' '}
                <span className="text-gradient-gold">Deserves a Stage</span>
              </h2>
              <p className="text-white/50 font-inter leading-relaxed mb-8">
                We believe that talent knows no borders. Our platform empowers
                artists from across Africa and the diaspora to showcase their
                work to a global audience, connect with collectors, and build
                sustainable creative careers.
              </p>
            </motion.div>

            <div className="space-y-5 mb-10">
              {progressData.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white/70 font-inter">{item.label}</span>
                    <span className="text-sm text-gold font-inter font-medium">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      ref={(el) => (barsRef.current[i] = el)}
                      className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                      style={{ width: '0%' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-black font-medium rounded-full text-sm tracking-wide hover:bg-gold-light transition-all gold-glow"
              >
                Become an Artist
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
