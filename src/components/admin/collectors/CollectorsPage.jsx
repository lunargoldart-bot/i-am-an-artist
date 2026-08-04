import { useMemo } from 'react';
import { UserRound } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatCurrency, formatNumber, formatDate } from '@/lib/adminData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CollectorsPage() {
  const users = useCollectionSnapshot('users', { max: 5000 }).data;

  const collectors = useMemo(
    () => users.filter((u) => u.role === 'buyer' || u.role === 'collector'),
    [users],
  );

  const columns = [
    {
      key: 'name', label: 'Collector',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={r.profile_image} alt={r.full_name} />
            <AvatarFallback className="text-[10px]">{(r.full_name || r.email || 'C').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{r.full_name || '—'}</p>
            <p className="truncate text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'lifetime_spend', label: 'Lifetime Spend', numeric: true, render: (r) => formatCurrency(r.lifetime_spend || r.total_spent), sortable: true },
    { key: 'orders_count', label: 'Orders', numeric: true, sortable: true },
    { key: 'wishlist_count', label: 'Wishlist', numeric: true, render: (r) => formatNumber(r.wishlist_count || r.wishlist_items || 0) },
    { key: 'subscription_tier', label: 'Tier', status: true },
    { key: 'created_date', label: 'Joined', render: (r) => formatDate(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collectors"
        description="Buyers and collectors on the platform"
        icon={UserRound}
        exportName="collectors"
        exportColumns={columns}
        exportRows={collectors}
      />
      <DataTable
        columns={columns}
        data={collectors}
        searchKeys={[(r) => r.full_name, (r) => r.email]}
        searchPlaceholder="Search collectors…"
        exportName="collectors"
        pageSize={12}
      />
    </div>
  );
}