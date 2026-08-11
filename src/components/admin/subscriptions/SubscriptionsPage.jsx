import { useMemo } from 'react';
import { Repeat, Crown, UserCheck, UserX, ArrowRight } from 'lucide-react';
import { PageHeader, DataTable, StatCard, ChartCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatDate, sumBy } from '@/lib/adminData';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const TIER_COLORS = { free: 'var(--chart-3)', basic: 'var(--chart-2)', premium: 'var(--chart-1)' };

export default function SubscriptionsPage() {
  const users = useCollectionSnapshot('users', { max: 5000 }).data;
  const membership = useCollectionSnapshot('membership_payments', { max: 3000 }).data;

  const tiers = useMemo(() => {
    const map = { free: 0, basic: 0, premium: 0 };
    users.forEach((u) => { const t = String(u.subscription_tier || 'free').toLowerCase(); if (map[t] !== undefined) map[t] += 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [users]);

  const membershipRevenue = sumBy(membership, 'amount_zmw');
  const subscribers = users.filter((u) => (u.subscription_tier || 'free') !== 'free' && u.subscription_status === 'active').length;
  const churned = users.filter((u) => u.subscription_status === 'cancelled' || u.subscription_status === 'expired').length;

  const columns = [
    {
      key: 'email', label: 'Subscriber',
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{r.full_name || r.email}</p>
          <p className="truncate text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    { key: 'subscription_tier', label: 'Tier', status: true },
    { key: 'subscription_status', label: 'Status', status: true },
    { key: 'subscription_start_date', label: 'Started', render: (r) => formatDate(r.subscription_start_date || r.created_date) },
    { key: 'subscription_renewal_date', label: 'Renews', render: (r) => formatDate(r.subscription_renewal_date) },
  ];

  const subscribersOnly = users.filter((u) => (u.subscription_tier || 'free') !== 'free');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Membership tiers and recurring revenue"
        icon={Repeat}
        exportName="subscriptions"
        exportColumns={columns}
        exportRows={subscribersOnly}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Subscribers" value={subscribers} icon={Crown} accent="text-primary" />
        <StatCard label="Membership Revenue" value={Math.round(membershipRevenue)} prefix="ZMW" icon={UserCheck} accent="text-emerald-400" />
        <StatCard label="Churned" value={churned} icon={UserX} accent="text-rose-400" />
        <StatCard label="Free Accounts" value={tiers.find((t) => t.name === 'free')?.value || 0} icon={ArrowRight} accent="text-sky-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Tier Distribution" description="Users by subscription tier">
          <ChartContainer config={{ tier: { label: 'Users', color: 'var(--chart-1)' } }} className="h-[260px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={tiers} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                {tiers.map((t) => <Cell key={t.name} fill={TIER_COLORS[t.name] || 'var(--chart-5)'} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
        </ChartCard>
        <ChartCard title="Subscriber Growth vs Total" description="Free vs paid accounts">
          <ChartContainer config={{ users: { label: 'Total Users', color: 'var(--chart-3)' }, subscribers: { label: 'Subscribers', color: 'var(--chart-1)' } }} className="h-[260px]">
            <BarChart data={[{ name: 'Free', users: tiers.find((t) => t.name === 'free')?.value || 0, subscribers: 0 }, { name: 'Basic', users: 0, subscribers: tiers.find((t) => t.name === 'basic')?.value || 0 }, { name: 'Premium', users: 0, subscribers: tiers.find((t) => t.name === 'premium')?.value || 0 }]}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="users" name="users" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="subscribers" name="subscribers" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <DataTable columns={columns} data={subscribersOnly} searchKeys={[(r) => r.email, (r) => r.full_name]} searchPlaceholder="Search subscribersâ€¦" exportName="subscriptions" pageSize={12} />
    </div>
  );
}