import { useMemo } from 'react';
import {
  Users, UserPlus, Palette, UserRound, ImageIcon, Hourglass, BadgeCheck,
  ShoppingCart, CheckCircle2, DollarSign, CalendarDays, Gavel, Percent,
  Wallet, Radio, MessageSquare, Star, AlertTriangle, LifeBuoy, Activity, Wifi,
} from 'lucide-react';
import { StatCard, ChartCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import {
  bucketByDate, bucketRevenueByDate, sumBy, isToday, isThisMonth, formatCurrency, formatCompact,
} from '@/lib/adminData';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';

const CHART_CONFIG = {
  users: { label: 'New Users', color: 'var(--chart-1)' },
  revenue: { label: 'Revenue', color: 'var(--chart-1)' },
  orders: { label: 'Orders', color: 'var(--chart-2)' },
  artworks: { label: 'Artworks', color: 'var(--chart-4)' },
};

export default function AdminHome() {
  const users = useCollectionSnapshot('users', { max: 5000 });
  const artworks = useCollectionSnapshot('artworks', { max: 5000 });
  const orders = useCollectionSnapshot('orders', { max: 5000 });
  const payments = useCollectionSnapshot('payments', { max: 5000 });
  const bids = useCollectionSnapshot('bids', { max: 5000 });
  const messages = useCollectionSnapshot('messages', { max: 5000 });
  const reviews = useCollectionSnapshot('artwork_reviews', { max: 5000 });
  const grievances = useCollectionSnapshot('grievances', { max: 5000 });
  const platformRevenue = useCollectionSnapshot('platform_revenue', { max: 5000 });

  const activeArtists = useMemo(() => users.data.filter((u) => u.role === 'artist'), [users.data]);
  const verifiedArtists = useMemo(() => activeArtists.filter((u) => u.is_verified_artist || u.verification_status === 'verified' || u.is_verified), [activeArtists]);
  const collectors = useMemo(() => users.data.filter((u) => u.role === 'buyer'), [users.data]);
  const pendingArtworks = useMemo(() => artworks.data.filter((a) => String(a.status || 'pending').toLowerCase() === 'pending'), [artworks.data]);
  const liveAuctions = useMemo(() => artworks.data.filter((a) => (a.is_auction || a.isAuction) && String(a.auction_status || a.status || '').toLowerCase() !== 'ended'), [artworks.data]);
  const pendingOrders = useMemo(() => orders.data.filter((o) => String(o.delivery_status || 'pending').toLowerCase() === 'pending'), [orders.data]);
  const completedOrders = useMemo(() => orders.data.filter((o) => ['delivered', 'completed'].includes(String(o.delivery_status).toLowerCase())), [orders.data]);

  const revenue30 = useMemo(() => bucketRevenueByDate(orders.data, { dateKey: 'created_date', amountKey: 'amount_zmw', days: 30 }), [orders.data]);
  const userGrowth = useMemo(() => bucketByDate(users.data, { days: 30 }), [users.data]);
  const orders30 = useMemo(() => bucketByDate(orders.data, { days: 30 }), [orders.data]);
  const artworks30 = useMemo(() => bucketByDate(artworks.data, { dateKey: 'created_date', days: 30 }), [artworks.data]);

  const totalRevenue = sumBy(orders.data, 'amount_zmw') + sumBy(payments.data, 'amount_zmw');
  const monthRevenue = orders.data.filter((o) => isThisMonth(o.created_date)).reduce((s, o) => s + (Number(o.amount_zmw) || 0), 0)
    + payments.data.filter((p) => isThisMonth(p.created_date)).reduce((s, p) => s + (Number(p.amount_zmw) || 0), 0);
  const commission = sumBy(platformRevenue.data, 'amount_zmw') || Math.round(totalRevenue * 0.1);
  const pendingPayouts = sumBy(orders.data.filter((o) => String(o.delivery_status).toLowerCase() !== 'delivered'), 'amount_zmw');

  const onlineUsers = users.data.filter((u) => u.last_active && Date.now() - new Date(u.last_active).getTime() < 5 * 60 * 1000).length;

  const stats = [
    { label: 'Total Users', value: users.data.length, icon: Users, accent: 'text-sky-400' },
    { label: 'New Users Today', value: users.data.filter((u) => isToday(u.created_date)).length, icon: UserPlus, accent: 'text-emerald-400' },
    { label: 'Active Artists', value: activeArtists.length, icon: Palette, accent: 'text-gold' },
    { label: 'Collectors', value: collectors.length, icon: UserRound, accent: 'text-violet-400' },
    { label: 'Artworks', value: artworks.data.length, icon: ImageIcon, accent: 'text-pink-400' },
    { label: 'Pending Review', value: pendingArtworks.length, icon: Hourglass, accent: 'text-amber-400' },
    { label: 'Verified Artists', value: verifiedArtists.length, icon: BadgeCheck, accent: 'text-emerald-400' },
    { label: 'Orders', value: orders.data.length, icon: ShoppingCart, accent: 'text-blue-400' },
    { label: 'Completed Orders', value: completedOrders.length, icon: CheckCircle2, accent: 'text-green-400' },
    { label: 'Total Revenue', value: Math.round(totalRevenue), icon: DollarSign, prefix: 'ZMW', accent: 'text-gold' },
    { label: 'Monthly Revenue', value: Math.round(monthRevenue), icon: CalendarDays, prefix: 'ZMW', accent: 'text-gold' },
    { label: 'Auction Revenue', value: Math.round(sumBy(bids.data, 'current_bid_zmw') || sumBy(liveAuctions, 'current_bid_zmw')), icon: Gavel, prefix: 'ZMW', accent: 'text-orange-400' },
    { label: 'Commission Earned', value: Math.round(commission), icon: Percent, prefix: 'ZMW', accent: 'text-emerald-400' },
    { label: 'Pending Payouts', value: Math.round(pendingPayouts), icon: Wallet, prefix: 'ZMW', accent: 'text-rose-400' },
    { label: 'Live Auctions', value: liveAuctions.length, icon: Radio, accent: 'text-red-400' },
    { label: 'Messages', value: messages.data.length, icon: MessageSquare, accent: 'text-cyan-400' },
    { label: 'Reviews', value: reviews.data.length, icon: Star, accent: 'text-amber-400' },
    { label: 'Reports', value: grievances.data.length, icon: AlertTriangle, accent: 'text-rose-400' },
    { label: 'Support Tickets', value: grievances.data.filter((g) => String(g.status).toLowerCase() === 'open').length, icon: LifeBuoy, accent: 'text-orange-400' },
    { label: 'Active Sessions', value: onlineUsers, icon: Activity, accent: 'text-lime-400' },
    { label: 'Online Users', value: onlineUsers, icon: Wifi, accent: 'text-emerald-400' },
  ];

  const loading = users.loading || artworks.loading || orders.loading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-foreground">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">Live KPIs and marketplace activity — updated in real time.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue (30 days)" description="Order + payment value per day" className="h-[320px]">
          <ChartContainer config={CHART_CONFIG} className="h-[260px]">
            <BarChart data={revenue30}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={formatCompact} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="value" name="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="User Growth (30 days)" description="New sign-ups per day" className="h-[320px]">
          <ChartContainer config={CHART_CONFIG} className="h-[260px]">
            <LineChart data={userGrowth}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line dataKey="value" name="users" type="monotone" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Orders (30 days)" description="Orders created per day" className="h-[320px]">
          <ChartContainer config={CHART_CONFIG} className="h-[260px]">
            <BarChart data={orders30}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" name="orders" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Artwork Uploads (30 days)" description="Artwork submissions per day" className="h-[320px]">
          <ChartContainer config={CHART_CONFIG} className="h-[260px]">
            <LineChart data={artworks30}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" name="artworks" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </LineChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <Card className="border-border bg-card">
        <div className="flex flex-wrap items-center gap-4 p-5">
          <div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="font-playfair text-3xl font-bold text-gold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            <p className="font-playfair text-3xl font-bold text-foreground">{formatCurrency(monthRevenue)}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Commission Earned (10%)</p>
            <p className="font-playfair text-3xl font-bold text-emerald-400">{formatCurrency(commission)}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Pending Payouts</p>
            <p className="font-playfair text-3xl font-bold text-rose-400">{formatCurrency(pendingPayouts)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}