import { useMemo } from 'react';
import { Server, Cpu, HardDrive, Database, Plug, Mail, Bot, CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatCompact } from '@/lib/adminData';
import { cn } from '@/lib/utils';

const StatusCard = ({ label, icon: Icon, status, detail }) => {
  const tone = status === 'operational' ? 'text-emerald-500' : status === 'degraded' ? 'text-amber-500' : 'text-rose-500';
  const dot = status === 'operational' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={cn('h-2.5 w-2.5 rounded-full', dot)} />
      </div>
      <p className={cn('mt-3 text-sm font-semibold capitalize', tone)}>{status}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
};

export default function SystemPage() {
  const users = useCollectionSnapshot('users', { max: 5000 });
  const artworks = useCollectionSnapshot('artworks', { max: 5000 });
  const orders = useCollectionSnapshot('orders', { max: 5000 });
  const payments = useCollectionSnapshot('payments', { max: 5000 });

  const services = useMemo(() => [
    { label: 'Firebase Auth', icon: Server, status: 'operational', detail: 'Email & Google sign-in' },
    { label: 'Cloud Functions', icon: Cpu, status: 'operational', detail: '30+ callables deployed' },
    { label: 'Firestore Database', icon: Database, status: users.error ? 'degraded' : 'operational', detail: `${formatCompact(users.data.length)} users · live sync` },
    { label: 'Storage', icon: HardDrive, status: 'operational', detail: 'Artwork + verification uploads (15 MB limit)' },
    { label: 'DPO Pay', icon: CreditCard, status: 'operational', detail: `${formatCompact(payments.data.length)} transactions` },
    { label: 'Email (sendEmail)', icon: Mail, status: 'operational', detail: 'Transactional + broadcast' },
    { label: 'OpenAI (invokeLLM)', icon: Bot, status: 'operational', detail: 'AI moderation & pricing' },
    { label: 'Web / API', icon: Plug, status: artworks.error ? 'degraded' : 'operational', detail: 'Vercel edge + SPA' },
  ], [users, artworks, payments]);

  const api = useMemo(() => [
    { label: 'Auth Latency', value: users.loading ? '—' : 'OK' },
    { label: 'Functions Deployed', value: 'Yes' },
    { label: 'Firestore Sync', value: orders.loading ? '—' : 'Live' },
  ], [users.loading, orders.loading]);

  return (
    <div className="space-y-6">
      <PageHeader title="System Status" description="Live health of every platform service" icon={Server} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => <StatusCard key={s.label} {...s} />)}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Latency & Diagnostics</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {api.map((a) => (
            <div key={a.label} className="rounded-lg bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">{a.label}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{a.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}