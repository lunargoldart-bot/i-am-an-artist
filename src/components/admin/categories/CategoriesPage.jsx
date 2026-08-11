import { useMemo, useState } from 'react';
import { Tags } from 'lucide-react';
import { PageHeader, ChartCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { countBy, formatNumber } from '@/lib/adminData';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';

const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export default function CategoriesPage() {
  const artworks = useCollectionSnapshot('artworks', { max: 5000 }).data;
  const [selected, setSelected] = useState('all');

  const byCategory = useMemo(() => countBy(artworks, 'category'), [artworks]);
  const categoryCount = byCategory.length;

  const selectedCount = selected === 'all' ? artworks.length : byCategory.find((c) => c.name === selected)?.value || 0;

  const categoryChartConfig = useMemo(() => {
    const config = {};
    byCategory.forEach((c, i) => { config[c.name] = { label: c.name, color: PIE_COLORS[i % PIE_COLORS.length] }; });
    return config;
  }, [byCategory]);

  const columns = [
    { key: 'name', label: 'Category', render: (r) => <span className="font-medium capitalize text-foreground">{r.name}</span> },
    { key: 'value', label: 'Artworks', numeric: true, sortable: true },
    { key: 'pct', label: 'Share', render: (r) => `${artworks.length ? Math.round((r.value / artworks.length) * 100) : 0}%` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description={`${categoryCount} categories across the marketplace`} icon={Tags} exportName="categories" exportColumns={columns} exportRows={byCategory} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Artwork Distribution" description="Share of artworks per category">
          <ChartContainer config={categoryChartConfig} className="h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
                {byCategory.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </ChartCard>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">Category Selection</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelected('all')} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selected === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              All ({formatNumber(artworks.length)})
            </button>
            {byCategory.map((c) => (
              <button key={c.name} onClick={() => setSelected(c.name)} className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${selected === c.name ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {c.name} ({formatNumber(c.value)})
              </button>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-xs text-muted-foreground">Selected category artworks</p>
            <p className="font-playfair text-4xl font-bold text-primary">{formatNumber(selectedCount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}