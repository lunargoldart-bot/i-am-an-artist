import { useMemo, useState } from 'react';
import { ShoppingCart, PackageCheck } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatCurrency, formatDateTime, sumBy, isThisMonth } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { firebaseClient } from '@/api/firebaseClient';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { data } = useCollectionSnapshot('orders', { max: 5000 });
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((o) => String(o.delivery_status || o.status || 'pending').toLowerCase() === statusFilter);
  }, [data, statusFilter]);

  const totalRevenue = sumBy(data, 'amount_zmw');
  const monthRevenue = data.filter((o) => isThisMonth(o.created_date)).reduce((s, o) => s + (Number(o.amount_zmw) || 0), 0);

  const advanceStatus = (row) => {
    const current = String(row.delivery_status || row.status || 'pending').toLowerCase();
    const idx = STATUS_FLOW.indexOf(current);
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    if (next === current) return toast.error('Order already at final status');
    firebaseClient.functions.invoke('updateOrderStatus', { orderId: row.id, status: next })
      .then(() => toast.success(`Order marked ${next}`))
      .catch((err) => toast.error(err.message));
  };

  const columns = [
    {
      key: 'artwork_title', label: 'Order',
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{r.artwork_title || r.id}</p>
          <p className="truncate text-xs text-muted-foreground">{r.id.slice(0, 8)} · {r.buyer_name || r.buyer_email}</p>
        </div>
      ),
    },
    { key: 'buyer_email', label: 'Buyer', render: (r) => r.buyer_email },
    { key: 'seller_email', label: 'Seller', render: (r) => r.seller_email },
    { key: 'amount_zmw', label: 'Amount', numeric: true, render: (r) => formatCurrency(r.amount_zmw), sortable: true },
    { key: 'payment_status', label: 'Payment', status: true },
    { key: 'delivery_status', label: 'Delivery', status: true },
    { key: 'created_date', label: 'Created', render: (r) => formatDateTime(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" aria-label="Advance status" onClick={() => advanceStatus(r)}>
            <PackageCheck className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${data.length} orders · ${formatCurrency(totalRevenue)} total · ${formatCurrency(monthRevenue)} this month`}
        icon={ShoppingCart}
        exportName="orders"
        exportColumns={columns}
        exportRows={filtered}
        actions={(
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_FLOW.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />
      <DataTable columns={columns} data={filtered} searchKeys={[(r) => r.artwork_title, (r) => r.buyer_email, (r) => r.seller_email, (r) => r.id]} searchPlaceholder="Search orders…" exportName="orders" pageSize={12} />
    </div>
  );
}