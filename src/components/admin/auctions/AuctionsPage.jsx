import { useMemo } from 'react';
import { Gavel } from 'lucide-react';
import { PageHeader, DataTable, ChartCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatCurrency, timeAgo, bucketByDate } from '@/lib/adminData';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Bar, BarChart } from 'recharts';

export default function AuctionsPage() {
  const artworks = useCollectionSnapshot('artworks', { max: 5000 }).data;
  const bids = useCollectionSnapshot('bids', { max: 5000 }).data;

  const auctions = useMemo(() => artworks.filter((a) => a.is_auction || a.isAuction || a.auction_end_date || a.end_time), [artworks]);

  const auctionRevenue = useMemo(() => {
    const byAuction = {};
    bids.forEach((b) => {
      const amount = Number(b.current_bid_zmw || b.amount_zmw || b.bid_amount) || 0;
      byAuction[b.artwork_id || b.auction_id || '?'] = Math.max(byAuction[b.artwork_id || b.auction_id || '?'] || 0, amount);
    });
    return Object.values(byAuction).reduce((s, v) => s + v, 0);
  }, [bids]);

  const bidActivity = useMemo(() => bucketByDate(bids, { dateKey: 'created_date', days: 30 }), [bids]);

  const columns = [
    {
      key: 'title', label: 'Auction',
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-foreground">{r.title || r.id}</p>
          <p className="text-xs text-muted-foreground">{r.artist_email}</p>
        </div>
      ),
    },
    { key: 'current_bid_zmw', label: 'Current Bid', numeric: true, render: (r) => formatCurrency(r.current_bid_zmw || r.starting_price_zmw || 0), sortable: true },
    { key: 'reserve_price_zmw', label: 'Reserve', numeric: true, render: (r) => formatCurrency(r.reserve_price_zmw || 0) },
    { key: 'highest_bidder_email', label: 'Highest Bidder', render: (r) => r.highest_bidder_email || '—' },
    { key: 'bids_count', label: 'Bids', numeric: true, render: (r) => r.bids_count || r.bid_count || 0 },
    { key: 'status', label: 'Status', badge: (r) => (r.auction_status || r.status || 'live') },
    { key: 'auction_end_date', label: 'Ends', render: (r) => timeAgo(r.auction_end_date || r.end_time) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auctions"
        description={`${auctions.length} auctions · ${formatCurrency(auctionRevenue)} in winning bids`}
        icon={Gavel}
        exportName="auctions"
        exportColumns={columns}
        exportRows={auctions}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Bid Activity (30 days)" description="Bids placed per day">
          <ChartContainer config={{ bids: { label: 'Bids', color: 'var(--chart-2)' } }} className="h-[260px]">
            <BarChart data={bidActivity}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" name="bids" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </ChartCard>
        <ChartCard title="Winning Bid Distribution" description="Top current bids across live auctions">
          <ChartContainer config={{ amount: { label: 'Current Bid', color: 'var(--chart-1)' } }} className="h-[260px]">
            <LineChart data={auctions.slice(0, 20).map((a) => ({ name: (a.title || a.id).slice(0, 12), value: a.current_bid_zmw || 0 }))}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="value" name="amount" type="monotone" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </ChartCard>
      </div>

      <DataTable columns={columns} data={auctions} searchKeys={[(r) => r.title, (r) => r.artist_email, (r) => r.highest_bidder_email]} searchPlaceholder="Search auctions…" exportName="auctions" pageSize={12} />
    </div>
  );
}