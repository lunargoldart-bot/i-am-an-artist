import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { howItWorks } from '../data/data';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.step-card'),
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.25,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 bg-[#161616]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
            How It{' '}
            <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto font-inter">
            Get started in three simple steps
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

          {howItWorks.map((step, i) => (
            <div
              key={step.step}
              className="step-card relative flex flex-col items-center text-center px-6"
            >
              <div className="relative z-10 w-24 h-24 rounded-full bg-[#0D0D0D] border border-gold/20 flex items-center justify-center mb-6 group-hover:border-gold/50 transition-colors">
                <span className="text-2xl font-playfair font-bold text-gradient-gold">
                  {String(step.step).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-xl font-playfair font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-white/40 text-sm font-inter leading-relaxed max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
