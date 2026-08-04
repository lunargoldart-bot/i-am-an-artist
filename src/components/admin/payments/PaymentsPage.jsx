import { useMemo, useState } from 'react';
import { CreditCard, Wallet, CircleCheck, CircleX, Clock3, RotateCcw } from 'lucide-react';
import { PageHeader, DataTable, StatCard, ChartCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatCurrency, formatDateTime, sumBy, monthSeries } from '@/lib/adminData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function PaymentsPage() {
  const payments = useCollectionSnapshot('payments', { max: 5000 }).data;
  const transactions = useCollectionSnapshot('transactions', { max: 5000 }).data;
  const payouts = useCollectionSnapshot('artistPayouts', { max: 3000 }).data;
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return payments;
    return payments.filter((p) => String(p.payment_status || p.status || 'pending').toLowerCase() === statusFilter);
  }, [payments, statusFilter]);

  const successful = sumBy(payments.filter((p) => String(p.payment_status || p.status).toLowerCase() === 'paid'), 'amount_zmw');
  const failed = payments.filter((p) => String(p.payment_status || p.status).toLowerCase() === 'failed').length;
  const pendingCount = payments.filter((p) => String(p.payment_status || p.status).toLowerCase() === 'pending').length;
  const refunded = sumBy(payments.filter((p) => String(p.payment_status || p.status).toLowerCase() === 'refunded'), 'amount_zmw');
  const pendingPayouts = sumBy(payouts.filter((p) => String(p.status || 'pending').toLowerCase() === 'pending'), 'amount_zmw');

  const revenueSeries = useMemo(
    () => monthSeries([...payments, ...transactions], { dateKey: 'created_date', valueKey: 'amount_zmw', months: 12 }),
    [payments, transactions],
  );

  const columns = [
    { key: 'reference', label: 'Reference', render: (r) => <span className="font-mono text-xs">{r.reference || r.transaction_id || r.id}</span> },
    { key: 'buyer_email', label: 'Buyer', render: (r) => r.buyer_email || r.user_email || '—' },
    { key: 'seller_email', label: 'Seller', render: (r) => r.seller_email || '—' },
    { key: 'amount_zmw', label: 'Amount', numeric: true, render: (r) => formatCurrency(r.amount_zmw), sortable: true },
    { key: 'provider', label: 'Provider', render: (r) => <span className="capitalize">{r.provider || 'DPO Pay'}</span> },
    { key: 'payment_status', label: 'Status', status: true },
    { key: 'created_date', label: 'Date', render: (r) => formatDateTime(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="DPO Pay transactions, revenue and payouts"
        icon={CreditCard}
        exportName="payments"
        exportColumns={columns}
        exportRows={filtered}
        actions={(
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Successful" value={Math.round(successful)} prefix="ZMW" icon={CircleCheck} accent="text-emerald-400" />
        <StatCard label="Failed" value={failed} icon={CircleX} accent="text-rose-400" />
        <StatCard label="Pending" value={pendingCount} icon={Clock3} accent="text-amber-400" />
        <StatCard label="Refunded" value={Math.round(refunded)} prefix="ZMW" icon={RotateCcw} accent="text-sky-400" />
        <StatCard label="Pending Payouts" value={Math.round(pendingPayouts)} prefix="ZMW" icon={Wallet} accent="text-violet-400" />
      </div>

      <ChartCard title="Monthly Revenue (12 months)" description="DPO payments + transactions">
        <ChartContainer config={{ revenue: { label: 'Revenue', color: 'var(--chart-1)' } }} className="h-[280px]">
          <BarChart data={revenueSeries}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" name="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <DataTable columns={columns} data={filtered} searchKeys={[(r) => r.reference, (r) => r.buyer_email, (r) => r.seller_email, (r) => r.id]} searchPlaceholder="Search payments…" exportName="payments" pageSize={12} />
    </div>
  );
}