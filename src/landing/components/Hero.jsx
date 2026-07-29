import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 10,
}));

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
        { y: 120, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, delay: 0.8 }
      );
      tl.fromTo(subtitleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.4');
      tl.fromTo(ctaRef.current?.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.3');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleMouse = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      gsap.to(container.querySelector('.parallax-bg'), {
        x, y, duration: 1, ease: 'power2.out',
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden bg-[#0D0D0D]">
      <div className="parallax-bg absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=80"
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0D0D0D]" />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="floating-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 3,
            height: p.size * 3,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 text-xs tracking-[0.2em] uppercase text-gold border border-gold/20 rounded-full glass-gold">
            Premium African Art Marketplace
          </span>
        </motion.div>

        <div ref={titleRef} className="overflow-hidden mb-6">
          <h1 className="hero-title-line text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-playfair font-bold text-white leading-[0.9] tracking-tight">
            Every Artist
          </h1>
          <h1 className="hero-title-line text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-playfair font-bold text-gradient-gold leading-[0.9] tracking-tight mt-2">
            Has A Stage.
          </h1>
          <h1 className="hero-title-line text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-playfair italic font-light text-white/40 leading-[0.9] tracking-tight mt-2">
            This Is Yours.
          </h1>
        </div>

        <p ref={subtitleRef} className="text-white/40 text-lg sm:text-xl max-w-xl mx-auto mb-10 font-inter tracking-wide">
          Discover, collect, and sell extraordinary African art. Connect with a global community of artists and collectors.
        </p>

        <div ref={ctaRef} className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gold text-black font-medium rounded-full text-sm tracking-wide hover:bg-gold-light transition-all gold-glow"
          >
            Explore Marketplace
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/10 text-white/80 font-medium rounded-full text-sm tracking-wide hover:border-white/20 hover:text-white transition-all glass"
          >
            Become an Artist
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="scroll-indicator flex flex-col items-center gap-2"
        >
          <span className="text-white/20 text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 text-white/30" />
        </motion.div>
      </div>
    </section>
  );
}
