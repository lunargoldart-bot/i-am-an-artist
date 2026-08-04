import { useMemo, useState } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { updateRecord, withToast } from '@/lib/adminActions';
import { formatCurrency, formatNumber } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ArtistsPage() {
  const { data } = useCollectionSnapshot('artists', { max: 3000 });
  const users = useCollectionSnapshot('users', { max: 5000 }).data;
  const [statusFilter, setStatusFilter] = useState('all');

  const userByEmail = useMemo(() => {
    const map = {};
    users.forEach((u) => { map[(u.email || '').toLowerCase()] = u; });
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((a) => a.verification_status === statusFilter || a.status === statusFilter);
  }, [data, statusFilter]);

  const artist = (r) => userByEmail[(r.user_email || '').toLowerCase()] || {};

  const setStatus = (row, verification_status) => withToast(
    updateRecord('artists', row.id, { verification_status }),
    `Artist ${verification_status}`,
  );

  const columns = [
    {
      key: 'name', label: 'Artist',
      render: (r) => {
        const u = artist(r);
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={u.profile_image || r.profile_image} alt={r.artist_name} />
              <AvatarFallback className="text-[10px]">{(r.artist_name || r.user_email || 'A').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{r.artist_name || r.full_name || '—'}</p>
              <p className="truncate text-xs text-muted-foreground">{r.user_email}</p>
            </div>
          </div>
        );
      },
    },
    { key: 'artwork_count', label: 'Artworks', numeric: true, sortable: true },
    { key: 'followers', label: 'Followers', numeric: true, render: (r) => formatNumber(r.followers || r.followers_count), sortable: false },
    { key: 'sales', label: 'Sales (ZMW)', numeric: true, render: (r) => formatCurrency(r.sales || r.total_sales), sortable: true },
    { key: 'verification_status', label: 'Status', status: true },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" aria-label="Approve" onClick={() => setStatus(r, 'approved')}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" aria-label="Reject" onClick={() => setStatus(r, 'rejected')}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Select value={r.status || 'active'} onValueChange={(v) => setStatus(r, v)}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artists"
        description="Approve, verify and manage artist accounts"
        icon={Palette}
        exportName="artists"
        exportColumns={columns}
        exportRows={filtered}
        actions={(
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={[(r) => r.artist_name, (r) => r.user_email, (r) => r.full_name]}
        searchPlaceholder="Search artists…"
        exportName="artists"
        pageSize={12}
      />
    </div>
  );
}