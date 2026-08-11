import { useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';

const affirmations = [
  'ðŸ’° Artists on Zartia earn an average of K8,400/month',
  'ðŸ”’ Transact Safely â€” every sale is escrow-protected',
  'ðŸ“ˆ Your art portfolio could be worth K1M within 3 years',
  'ðŸš€ Top sellers grew income by 340% in 12 months',
  'ðŸ›¡ï¸ Zero fraud â€” funds only release when you confirm delivery',
  'ðŸŒ Reach buyers across Zambia and beyond',
  'ðŸ† The next millionaire artist could be you',
  'âœ¨ 9 out of 10 featured artists doubled their sales',
  'ðŸ’Ž Elite members earn 3x more than standard listings',
  'ðŸŽ¯ Your first K100,000 is closer than you think',
];

export default function AffirmationTicker() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    const speed = 0.5;
    const total = track.scrollWidth / 2;
    const animate = () => {
      pos += speed;
      if (pos >= total) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const doubled = [...affirmations, ...affirmations];

  return (
    <div className="w-full bg-primary/10 border-y border-primary/20 overflow-hidden py-2.5">
      <div className="flex items-center gap-3">
        <div className="shrink-0 pl-4 flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-widest">
          <TrendingUp className="w-3.5 h-3.5" /> Live
        </div>
        <div className="overflow-hidden flex-1">
          <div ref={trackRef} className="flex gap-0 whitespace-nowrap" style={{ willChange: 'transform' }}>
            {doubled.map((msg, i) => (
              <span key={i} className="text-xs text-primary/80 px-8 shrink-0">{msg}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}