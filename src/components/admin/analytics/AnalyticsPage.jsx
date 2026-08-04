import { useMemo } from 'react';
import { TrendingUp, Users, Palette, ShoppingCart, Globe } from 'lucide-react';
import { PageHeader, StatCard, ChartCard, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { countBy, topBy, bucketRevenueByDate, sumBy, formatCurrency } from '@/lib/adminData';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, AreaChart, Area } from 'recharts';

export default function AnalyticsPage() {
  const users = useCollectionSnapshot('users', { max: 5000 }).data;
  const artworks = useCollectionSnapshot('artworks', { max: 5000 }).data;
  const orders = useCollectionSnapshot('orders', { max: 5000 }).data;
  const artists = useCollectionSnapshot('artists', { max: 3000 }).data;
  const countryRecords = useCollectionSnapshot('users', { max: 5000 }).data;

  const revenue = (r) => Number(r.amount_zmw) || 0;

  const topCategories = useMemo(() => countBy(artworks, 'category').slice(0, 8), [artworks]);
  const topArtists = useMemo(() => topBy(artists, 'sales', 8).map((a) => ({ name: a.artist_name || a.user_email || a.id, value: a.sales || a.total_sales || 0 })), [artists]);
  const topArtwork = useMemo(() => topBy(artworks, 'views_count', 8).map((a) => ({ name: (a.title || a.id).slice(0, 16), value: a.views_count || 0 })), [artworks]);

  const countryMap = useMemo(() => countBy(countryRecords, 'country'), [countryRecords]);
  const revenueSeries = useMemo(() => bucketRevenueByDate(orders, { dateKey: 'created_date', amountKey: 'amount_zmw', days: 30 }), [orders]);
  const orderSeries = useMemo(() => (() => {
    const buckets = {};
    orders.forEach((o) => { const k = o.created_date?.slice(0, 10) || '?'; buckets[k] = (buckets[k] || 0) + 1; });
    return Object.entries(buckets).slice(-14).map(([name, value]) => ({ name: name.slice(5), value }));
  })(), [orders]);

  const totalRevenue = sumBy(orders, 'amount_zmw');
  const topCountries = countryMap.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Attribution, traffic and top performers" icon={TrendingUp} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total Revenue" value={Math.round(totalRevenue)} prefix="ZMW" icon={TrendingUp} accent="text-gold" />
        <StatCard label="Artists" value={artists.length} icon={Palette} accent="text-emerald-400" />
        <StatCard label="Collectors" value={users.filter((u) => u.role === 'buyer').length} icon={Users} accent="text-sky-400" />
        <StatCard label="Orders" value={orders.length} icon={ShoppingCart} accent="text-blue-400" />
        <StatCard label="Countries" value={countryMap.length} icon={Globe} accent="text-violet-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend (30 days)" description="Marketplace revenue per day">
          <ChartContainer config={{ revenue: { label: 'Revenue', color: 'var(--chart-1)' } }} className="h-[260px]">
            <AreaChart data={revenueSeries}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactCurrency(v)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="value" name="revenue" type="monotone" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
            </AreaChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Order Volume (14 days)" description="Orders placed per day">
          <ChartContainer config={{ orders: { label: 'Orders', color: 'var(--chart-2)' } }} className="h-[260px]">
            <LineChart data={orderSeries}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line dataKey="value" name="orders" type="monotone" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Top Categories" description="Artworks by category">
          <ChartContainer config={{ value: { label: 'Artworks', color: 'var(--chart-1)' } }} className="h-[260px]">
            <BarChart data={topCategories} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={90} tickFormatter={(v) => String(v).slice(0, 12)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" name="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Country Map" description="Collectors by country">
          <ChartContainer config={{ value: { label: 'Collectors', color: 'var(--chart-3)' } }} className="h-[260px]">
            <BarChart data={topCountries} layout="vertical" margin={{ left: 4 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={90} tickFormatter={(v) => String(v).slice(0, 14)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" name="value" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Artist' },
          { key: 'value', label: 'Sales (ZMW)', numeric: true, render: (r) => formatCurrency(r.value), sortable: true },
        ]}
        data={topArtists}
        onExport={false}
        pageSize={8}
      />

      <DataTable
        columns={[
          { key: 'name', label: 'Artwork' },
          { key: 'value', label: 'Views', numeric: true, sortable: true },
        ]}
        data={topArtwork}
        onExport={false}
        pageSize={8}
      />
    </div>
  );
}

function formatCompactCurrency(v) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}