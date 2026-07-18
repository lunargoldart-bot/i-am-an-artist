import { useState } from 'react';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { firebaseClient } from '@/api/firebaseClient';

const prompts = [
  { label: 'Pricing My Art', value: 'pricing' },
  { label: 'Growing My Audience', value: 'audience' },
  { label: 'Reaching K100K', value: 'milestone' },
  { label: 'Going Viral', value: 'viral' },
];

const systemPrompts = {
  pricing: 'Give 3 ultra-practical tips for a Zambian artist to price their artwork for maximum profit on a digital platform. Be specific, aspirational, and direct. Max 80 words.',
  audience: 'Give 3 powerful strategies for a Zambian digital artist to grow their collector audience on an art marketplace. Be bold and inspiring. Max 80 words.',
  milestone: 'Give a motivating, step-by-step 3-point plan for a Zambian artist to earn their first K100,000 on an art platform. Be ambitious and concrete. Max 80 words.',
  viral: 'Give 3 creative tactics for a Zambian artist to make their listing or artwork go viral and attract high-value buyers. Be energetic and practical. Max 80 words.',
};

export default function AIInsightWidget() {
  const [selected, setSelected] = useState(null);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  const getInsight = async (type) => {
    setSelected(type);
    setInsight('');
    setLoading(true);
    try {
      const res = await firebaseClient.integrations.Core.InvokeLLM({
        prompt: systemPrompts[type],
      });
      setInsight(res);
    } catch {
      setInsight('Every great artist started with a single sale. Your breakthrough is one listing away.');
    }
    setLoading(false);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-card border border-border rounded-2xl p-8 md:p-10"
        style={{ boxShadow: '0 0 40px rgba(0,0,0,0.3)' }}
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Left */}
          <div className="md:w-1/3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <span className="text-gold text-sm font-bold uppercase tracking-widest">AI Art Advisor</span>
            </div>
            <h3 className="font-playfair font-bold text-2xl text-foreground mb-2">Get Your<br />Free Strategy</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Our AI analyses thousands of successful Zambian artists to give you personalised, actionable advice — free with every account.
            </p>
            <div className="flex flex-wrap gap-2">
              {prompts.map(p => (
                <button
                  key={p.value}
                  onClick={() => getInsight(p.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${
                    selected === p.value
                      ? 'bg-gold/20 border-gold text-gold'
                      : 'border-border text-muted-foreground hover:border-gold/40 hover:text-gold/70'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: output */}
          <div className="md:w-2/3 md:border-l md:border-border md:pl-8">
            {!selected && (
              <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
                <Zap className="w-8 h-8 text-gold/20 mb-3" />
                <p className="text-muted-foreground/50 text-sm">Pick a topic above to get your free AI strategy insight</p>
              </div>
            )}
            {selected && loading && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-sm">Your advisor is thinking…</span>
              </div>
            )}
            {selected && !loading && insight && (
              <div>
                <p className="text-xs text-gold/60 uppercase tracking-widest mb-3 font-semibold">
                  {prompts.find(p => p.value === selected)?.label} — Strategy
                </p>
                <p className="text-foreground/80 text-sm leading-7 whitespace-pre-line">{insight}</p>
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <p className="text-muted-foreground/50 text-xs">Want a full personalised growth plan?</p>
                  <Button size="sm" className="gold-gradient text-background text-xs font-bold hover:opacity-90">
                    Upgrade to Elite <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}