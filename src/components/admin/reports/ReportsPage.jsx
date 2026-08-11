import { useMemo } from 'react';
import { BarChart3, FileBarChart, FileText, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { PageHeader, DataTable, StatCard, ChartCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { timeAgo } from '@/lib/adminData';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const REPORT_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

export default function ReportsPage() {
  const grievances = useCollectionSnapshot('grievances', { max: 3000 }).data;

  const byType = useMemo(() => {
    const map = {};
    grievances.forEach((g) => { const t = String(g.type || g.category || 'general').toLowerCase(); map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [grievances]);

  const columns = [
    { key: 'title', label: 'Report', render: (r) => <p className="font-medium text-foreground">{r.title || r.subject || 'Report'}</p> },
    { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type || r.category || 'general'}</span> },
    { key: 'user_email', label: 'Reported By', render: (r) => r.user_email || r.reporter_email || 'â€”' },
    { key: 'priority', label: 'Priority', badge: (r) => r.priority || r.severity || 'medium' },
    { key: 'status', label: 'Status', status: true },
    { key: 'created_date', label: 'Filed', render: (r) => timeAgo(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generated reports and admin created reports" icon={BarChart3} exportName="reports" exportColumns={columns} exportRows={grievances} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Reports" value={grievances.length} icon={FileBarChart} accent="text-sky-400" />
        <StatCard label="Open" value={grievances.filter((g) => ['open', 'pending'].includes(String(g.status).toLowerCase())).length} icon={Clock} accent="text-amber-400" />
        <StatCard label="Resolved" value={grievances.filter((g) => ['closed', 'resolved'].includes(String(g.status).toLowerCase())).length} icon={CheckCircle2} accent="text-emerald-400" />
        <StatCard label="Escalated" value={grievances.filter((g) => String(g.priority || g.severity).toLowerCase() === 'urgent').length} icon={AlertTriangle} accent="text-rose-400" />
      </div>

      <ChartCard title="Reports by Type" description="Distribution across report categories">
        <ChartContainer config={{ value: { label: 'Reports', color: 'var(--chart-1)' } }} className="h-[260px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}>
              {byType.map((entry, i) => <Cell key={entry.name} fill={REPORT_COLORS[i % REPORT_COLORS.length]} />)}
            </Pie>
          </PieChart>
        </ChartContainer>
      </ChartCard>

      <DataTable columns={columns} data={grievances} searchKeys={[(r) => r.title, (r) => r.user_email, (r) => r.type]} searchPlaceholder="Search reportsâ€¦" exportName="reports" pageSize={12} />

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Exportable Reports</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Use the export controls on any sectionâ€™s table to download CSV, PDF or JSON. For scheduled or custom reporting, a dedicated analytics function can be configured in System â†’ API &amp; Integrations.
        </p>
      </div>
    </div>
  );
}