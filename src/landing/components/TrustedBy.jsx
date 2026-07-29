import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { stats } from '../data/data';

gsap.registerPlugin(ScrollTrigger);

function CounterCard({ label, value, suffix, index }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="text-center"
    >
      <div className="text-5xl sm:text-6xl font-playfair font-bold text-gold mb-2">
        {inView && (
          <CountUp end={value} suffix={suffix} duration={2.5} separator="," />
        )}
        {!inView && <span>0</span>}
      </div>
      <p className="text-white/60 text-sm sm:text-base font-inter tracking-wide">{label}</p>
    </motion.div>
  );
}

export default function TrustedBy() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current.querySelector('.section-line'),
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 bg-[#0D0D0D] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-gold/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
            Trusted by{' '}
            <span className="text-gradient-gold">Creatives Worldwide</span>
          </h2>
          <div className="section-line mx-auto h-px w-20 bg-gold/40" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
          {stats.map((stat, i) => (
            <CounterCard key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
