import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(
        titleRef.current?.children,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.12, delay: 0.6 }
      );
      tl.fromTo(subtitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4');
      tl.fromTo(ctaRef.current?.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.3');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 16;
      const y = (clientY / window.innerHeight - 0.5) * 16;
      gsap.to(container.querySelector('.parallax-bg'), {
        x, y, duration: 1.2, ease: 'power2.out',
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-cream">
      <div className="parallax-bg absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80"
          className="w-full h-full object-cover opacity-60 scale-105"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-cream" />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <span className="inline-block px-5 py-1.5 text-xs tracking-[0.25em] uppercase text-green-primary font-inter font-medium bg-white/60 backdrop-blur-sm rounded-full border border-border-light">
            Premium African Art Marketplace
          </span>
        </motion.div>

        <div ref={titleRef} className="mb-5">
          <h1 className="font-playfair text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-text-dark leading-[0.9] tracking-tight">
            Every Artist
          </h1>
          <h1 className="font-playfair text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-green-primary leading-[0.9] tracking-tight mt-2">
            Has A Stage.
          </h1>
          <h1 className="font-cormorant text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light italic text-text-muted leading-[0.9] mt-3">
            This Is Yours.
          </h1>
        </div>

        <p
          ref={subtitleRef}
          className="text-text-muted text-base sm:text-lg max-w-xl mx-auto mb-10 font-inter leading-relaxed"
        >
          Discover original artwork, connect with talented artists and experience Africa's modern digital art marketplace.
        </p>

        <div ref={ctaRef} className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2 px-8 py-4 green-gradient text-white font-medium rounded-full text-sm tracking-wide hover:opacity-90 transition-all green-glow"
          >
            Explore Artwork
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-border-light text-text-dark font-medium rounded-full text-sm tracking-wide hover:border-green-primary/20 hover:text-green-primary transition-all bg-white/40"
          >
            Become an Artist
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-text-muted text-[10px] tracking-[0.2em] uppercase font-inter">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
