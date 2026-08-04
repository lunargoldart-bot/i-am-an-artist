import { useMemo } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { PageHeader, DataTable, ChartCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { timeAgo } from '@/lib/adminData';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { deleteRecord, withToast } from '@/lib/adminActions';

const starRow = (rating) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating || 0) ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
    ))}
  </div>
);

export default function ReviewsPage() {
  const reviews = useCollectionSnapshot('artwork_reviews', { max: 3000 }).data;
  const courierReviews = useCollectionSnapshot('courier_reviews', { max: 3000 }).data;

  const combined = useMemo(() => [...reviews, ...courierReviews], [reviews, courierReviews]);

  const ratingDist = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    combined.forEach((r) => { const k = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 0))); map[k] += 1; });
    return Object.entries(map).map(([name, value]) => ({ name: `${name}★`, value }));
  }, [combined]);

  const avgRating = combined.length ? combined.reduce((s, r) => s + (Number(r.rating) || 0), 0) / combined.length : 0;

  const remove = (r) => withToast(deleteRecord(r.review_type === 'courier' ? 'courier_reviews' : 'artwork_reviews', r.id), 'Review deleted');

  const columns = [
    { key: 'rating', label: 'Rating', render: (r) => starRow(r.rating) },
    { key: 'review_text', label: 'Review', render: (r) => <p className="max-w-lg truncate text-sm text-muted-foreground">{r.review_text || r.comment || r.content || '—'}</p> },
    { key: 'reviewer_email', label: 'Reviewer', render: (r) => r.reviewer_email },
    { key: 'kind', label: 'Kind', badge: (r) => (r.review_type === 'courier' ? 'courier' : 'artwork') },
    { key: 'created_date', label: 'Date', render: (r) => timeAgo(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" aria-label="Delete" onClick={() => remove(r)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description={`${combined.length} reviews · ${avgRating.toFixed(1)} average rating`}
        icon={Star}
        exportName="reviews"
        exportColumns={columns}
        exportRows={combined}
      />

      <ChartCard title="Rating Distribution" description="Reviews grouped by star rating">
        <ChartContainer config={{ reviews: { label: 'Reviews', color: 'var(--chart-1)' } }} className="h-[260px]">
          <BarChart data={ratingDist}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" name="reviews" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <DataTable columns={columns} data={combined} searchKeys={[(r) => r.reviewer_email, (r) => r.review_text, (r) => r.artwork_title]} searchPlaceholder="Search reviews…" exportName="reviews" pageSize={12} />
    </div>
  );
}