import { useMemo } from 'react';
import { ShieldCheck, Shield, ShieldOff } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { updateRecord, withToast } from '@/lib/adminActions';
import { formatDate } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminsPage() {
  const { data } = useCollectionSnapshot('users', { max: 5000 });
  const admins = useMemo(() => data.filter((u) => u.role === 'admin'), [data]);

  const toggleAdmin = (row) => withToast(
    updateRecord('users', row.id, { role: row.role === 'admin' ? 'user' : 'admin' }),
    row.role === 'admin' ? 'Admin access revoked' : 'Promoted to admin',
  );

  const columns = [
    {
      key: 'identity', label: 'Admin',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src={r.profile_image} alt={r.full_name} />
            <AvatarFallback className="text-[10px]">{(r.full_name || r.email || 'A').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{r.full_name || '—'}</p>
            <p className="truncate text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'last_login_at', label: 'Last Login', render: (r) => formatDate(r.last_login_at || r.last_active) },
    { key: 'created_date', label: 'Added', render: (r) => formatDate(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleAdmin(r)} aria-label="Revoke admin">
            {r.role === 'admin' ? <ShieldOff className="h-3.5 w-3.5 text-rose-500" /> : <Shield className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        description="Platform administrators and their permissions"
        icon={ShieldCheck}
        exportName="admins"
        exportColumns={columns}
        exportRows={admins}
      />
      <DataTable columns={columns} data={admins} searchKeys={[(r) => r.full_name, (r) => r.email]} searchPlaceholder="Search admins…" exportName="admins" pageSize={12} />
    </div>
  );
}