import { useMemo, useState } from 'react';
import { Users, Shield, ShieldOff, BadgeCheck, UserX, KeyRound } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { updateRecord, withToast } from '@/lib/adminActions';
import { formatDate } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = ['user', 'artist', 'buyer', 'courier', 'admin'];

const UserAvatar = ({ row }) => (
  <div className="flex items-center gap-2.5">
    <Avatar className="h-8 w-8">
      <AvatarImage src={row.profile_image} alt={row.full_name} />
      <AvatarFallback className="text-[10px]">{(row.full_name || row.email || 'U').slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <p className="truncate text-sm font-medium text-foreground">{row.full_name || '—'}</p>
      <p className="truncate text-xs text-muted-foreground">{row.email}</p>
    </div>
  </div>
);

export default function UsersPage() {
  const { data } = useCollectionSnapshot('users', { max: 5000 });
  const [roleFilter, setRoleFilter] = useState('all');
  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => {
    let rows = data;
    if (roleFilter !== 'all') rows = rows.filter((u) => u.role === roleFilter);
    if (tab === 'suspended') rows = rows.filter((u) => u.status === 'suspended' || u.suspended);
    if (tab === 'verified') rows = rows.filter((u) => u.is_verified || u.is_verified_artist);
    return rows;
  }, [data, roleFilter, tab]);

  const handleRole = (id, role) => withToast(updateRecord('users', id, { role }), `Role set to ${role}`);
  const toggleSuspend = (row) => {
    const suspended = !(row.status === 'suspended' || row.suspended);
    withToast(updateRecord('users', row.id, { status: suspended ? 'suspended' : 'active', suspended }), suspended ? 'User suspended' : 'User activated');
  };
  const toggleVerify = (row) => withToast(updateRecord('users', row.id, { is_verified: !row.is_verified, verification_status: !row.is_verified ? 'verified' : 'pending' }), row.is_verified ? 'Verification removed' : 'User verified');
  const sendReset = (row) => {
    if (!row.email) return toast.error('No email on record');
    sendPasswordResetEmail(auth, row.email)
      .then(() => toast.success(`Reset link sent to ${row.email}`))
      .catch((err) => toast.error(err.message));
  };

  const columns = [
    { key: 'identity', label: 'User', render: (r) => <UserAvatar row={r} /> },
    { key: 'role', label: 'Role', status: true },
    { key: 'subscription_tier', label: 'Tier', status: true },
    { key: 'verification_status', label: 'Verification', badge: (r) => (r.is_verified ? 'verified' : r.verification_status || 'pending') },
    { key: 'created_date', label: 'Joined', render: (r) => formatDate(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Select value={r.role} onValueChange={(v) => handleRole(r.id, v)}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleVerify(r)} aria-label="Verify">
            <BadgeCheck className={`h-3.5 w-3.5 ${r.is_verified ? 'text-emerald-500' : 'text-muted-foreground'}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => sendReset(r)} aria-label="Reset password">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSuspend(r)} aria-label="Suspend">
            {r.status === 'suspended' || r.suspended ? <Shield className="h-3.5 w-3.5 text-emerald-500" /> : <ShieldOff className="h-3.5 w-3.5 text-rose-500" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Delete">
            <UserX className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage every account on the platform"
        icon={Users}
        exportName="users"
        exportColumns={columns}
        exportRows={filtered}
        actions={(
          <div className="flex items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>)}
              </SelectContent>
            </Select>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={[(r) => r.full_name, (r) => r.email, (r) => r.uid]}
        searchPlaceholder="Search by name or email…"
        exportName="users"
        pageSize={12}
      />
    </div>
  );
}