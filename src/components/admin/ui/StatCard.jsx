import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatCard({ label, value = 0, icon: Icon, delta, suffix, prefix, accent = 'text-gold', loading }) {
  const isDelta = typeof delta === 'number';
  const TrendIcon = !isDelta || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const trendClass = !isDelta || delta === 0 ? 'text-slate-400' : delta > 0 ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-gold/40">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
            <Icon className={cn('h-4 w-4', accent)} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        {prefix && <span className="text-sm font-medium text-muted-foreground">{prefix}</span>}
        {loading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-secondary" />
        ) : (
          <p className={cn('font-playfair text-3xl font-bold text-foreground', accent)}>
            <CountUp end={Number(value) || 0} duration={0.8} separator="," />
            {suffix || ''}
          </p>
        )}
      </div>
      {isDelta && (
        <div className="mt-2 flex items-center gap-1.5">
          <TrendIcon className={cn('h-3.5 w-3.5', trendClass)} />
          <span className={cn('text-xs font-medium', trendClass)}>
            {delta > 0 ? '+' : ''}
            {delta}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}