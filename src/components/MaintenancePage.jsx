import { useEffect, useState } from 'react';

const FLOATING_GRADIENTS = [
  { className: 'gradient-one', top: '10%', left: '-5%' },
  { className: 'gradient-two', top: '45%', left: '75%' },
  { className: 'gradient-three', top: '70%', left: '15%' },
];

export default function MaintenancePage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(100, prev + Math.max(1, Math.round(Math.random() * 4)));
      });
    }, 90);
    return () => clearInterval(timer);
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="maintenance-root min-h-screen relative overflow-hidden bg-[#0B0B09] text-[#F5F1E8] flex flex-col items-center justify-center px-6 py-16">
      {/* Animated background */}
      <div className="maintenance-bg absolute inset-0 pointer-events-none">
        {FLOATING_GRADIENTS.map((g) => (
          <div
            key={g.className}
            className={`maintenance-gradient absolute w-[40vw] h-[40vw] min-w-[320px] min-h-[320px] rounded-full blur-[120px] opacity-25 ${g.className}`}
            style={{ top: g.top, left: g.left }}
          />
        ))}
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="maintenance-particle absolute w-1 h-1 rounded-full bg-[#D9B95C]"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.7) % 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        {/* Logo */}
        <div className="maintenance-fade-in mb-10">
          <img
            src="/logo.png"
            alt="I Am An Artist"
            className="w-40 sm:w-52 h-auto mx-auto drop-shadow-[0_0_40px_rgba(217,185,92,0.25)]"
          />
        </div>

        {/* Glass card */}
        <div className="maintenance-fade-in w-full rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
          <p className="font-inter text-[11px] tracking-[0.35em] uppercase text-[#D9B95C]/80 mb-5">
            I Am An Artist
          </p>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F5F1E8] mb-6 leading-tight">
            Website Under Construction
          </h1>

          <p className="font-inter text-[#B7B09E] text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-10">
            We're currently completing final improvements to deliver the best
            possible experience. Please contact the project owner for further
            information.
          </p>

          {/* Progress indicator */}
          <div className="max-w-sm mx-auto mb-10">
            <div className="flex items-center justify-between font-inter text-xs text-[#B7B09E] mb-2">
              <span>Preparing something extraordinary...</span>
              <span className="text-[#D9B95C]">{progress}%</span>
            </div>
            <div className="h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D9B95C] to-[#8A6D2F] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:dev@iamanartistapp.com"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D9B95C] to-[#C4A24E] text-[#0B0B09] font-inter font-semibold text-sm tracking-wide hover:opacity-90 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#D9B95C]/20"
            >
              Email Developer
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-white/20 text-[#F5F1E8] font-inter font-semibold text-sm tracking-wide hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="maintenance-fade-in mt-12 flex flex-col items-center gap-1.5">
          <p className="font-playfair text-lg text-[#F5F1E8]/90">I Am An Artist</p>
          <p className="font-inter text-xs tracking-[0.25em] uppercase text-[#B7B09E]/70">
            Create. Inspire. Collect.
          </p>
          <p className="font-inter text-xs text-[#B7B09E]/50 mt-4">
            &copy; {year} I Am An Artist. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes maintenanceFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .maintenance-fade-in {
          opacity: 0;
          animation: maintenanceFadeIn 1s ease-out forwards;
        }
        .maintenance-fade-in:nth-child(1) { animation-delay: 0.1s; }
        .maintenance-fade-in:nth-child(2) { animation-delay: 0.35s; }
        .maintenance-fade-in:nth-child(3) { animation-delay: 0.6s; }

        @keyframes maintenanceFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.15); }
          66% { transform: translate(-30px, 25px) scale(0.95); }
        }
        .maintenance-gradient {
          animation: maintenanceFloat 14s ease-in-out infinite;
        }
        .gradient-one { background: radial-gradient(circle, #D9B95C 0%, transparent 70%); animation-delay: 0s; }
        .gradient-two { background: radial-gradient(circle, #6E5B2E 0%, transparent 70%); animation-delay: 4s; }
        .gradient-three { background: radial-gradient(circle, #3A3322 0%, transparent 70%); animation-delay: 8s; }

        @keyframes maintenanceParticleRise {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        .maintenance-particle {
          opacity: 0;
          animation: maintenanceParticleRise 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
