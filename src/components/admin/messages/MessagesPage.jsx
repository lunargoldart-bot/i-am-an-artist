import { useMemo, useState } from 'react';
import { MessageSquare, CheckCheck, Clock } from 'lucide-react';
import { PageHeader, DataTable, StatCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { timeAgo } from '@/lib/adminData';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MessagesPage() {
  const { data } = useCollectionSnapshot('messages', { max: 3000 });
  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => {
    if (tab === 'unread') return data.filter((m) => !m.read && !m.is_read);
    if (tab === 'read') return data.filter((m) => m.read || m.is_read);
    return data;
  }, [data, tab]);

  const unread = data.filter((m) => !m.read && !m.is_read).length;

  const columns = [
    {
      key: 'sender_email', label: 'From → To',
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{r.sender_email}</p>
          <p className="truncate text-xs text-muted-foreground">→ {r.recipient_email}</p>
        </div>
      ),
    },
    { key: 'content', label: 'Message', render: (r) => <p className="max-w-md truncate text-sm text-muted-foreground">{r.content || r.message || r.text || '—'}</p> },
    { key: 'read', label: 'Status', badge: (r) => (r.read || r.is_read ? 'read' : 'unread') },
    { key: 'created_date', label: 'Sent', render: (r) => timeAgo(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description={`${data.length} messages in total`}
        icon={MessageSquare}
        exportName="messages"
        exportColumns={columns}
        exportRows={filtered}
        actions={(
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total Messages" value={data.length} icon={MessageSquare} accent="text-cyan-400" />
        <StatCard label="Unread" value={unread} icon={Clock} accent="text-amber-400" />
        <StatCard label="Read" value={data.length - unread} icon={CheckCheck} accent="text-emerald-400" />
      </div>

      <DataTable columns={columns} data={filtered} searchKeys={[(r) => r.sender_email, (r) => r.recipient_email, (r) => r.content]} searchPlaceholder="Search messages…" exportName="messages" pageSize={12} />
    </div>
  );
}