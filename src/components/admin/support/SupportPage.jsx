import { useMemo, useState } from 'react';
import { LifeBuoy, Send, UserCheck, Flame, CheckCircle2 } from 'lucide-react';
import { PageHeader, DataTable, StatCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { updateRecord, withToast } from '@/lib/adminActions';
import { timeAgo } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SupportPage() {
  const { data } = useCollectionSnapshot('grievances', { max: 3000 });
  const [tab, setTab] = useState('open');
  const [replyOpen, setReplyOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [reply, setReply] = useState('');

  const tickets = data;

  const filtered = useMemo(() => {
    if (tab === 'open') return tickets.filter((t) => ['open', 'pending'].includes(String(t.status).toLowerCase()));
    if (tab === 'closed') return tickets.filter((t) => ['closed', 'resolved'].includes(String(t.status).toLowerCase()));
    if (tab === 'urgent') return tickets.filter((t) => ['high', 'urgent'].includes(String(t.priority || t.severity || '').toLowerCase()));
    return tickets;
  }, [tickets, tab]);

  const setStatus = (id, status) => withToast(updateRecord('grievances', id, { status }), `Ticket ${status}`);

  const submitReply = () => {
    if (!target) return;
    const nowIso = new Date().toISOString();
    withToast(
      updateRecord('grievances', target.id, {
        status: 'open',
        last_reply: reply,
        staff_reply: reply,
        updated_date: nowIso,
      }),
      'Reply saved',
    );
    setReply('');
    setReplyOpen(false);
  };

  const columns = [
    { key: 'title', label: 'Subject', render: (r) => <p className="font-medium text-foreground">{r.title || r.subject || 'Support ticket'}</p> },
    { key: 'user_email', label: 'User', render: (r) => r.user_email },
    { key: 'priority', label: 'Priority', badge: (r) => r.priority || r.severity || 'medium' },
    { key: 'status', label: 'Status', status: true },
    { key: 'created_date', label: 'Opened', render: (r) => timeAgo(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Dialog open={replyOpen && target?.id === r.id} onOpenChange={(open) => { setReplyOpen(open); if (open) setTarget(r); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Send className="mr-1 h-3.5 w-3.5" /> Reply
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reply to ticket</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">Re: {r.title || r.subject} — {r.user_email}</p>
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your response…" rows={4} />
              <DialogFooter>
                <Button variant="secondary" onClick={() => setReplyOpen(false)}>Cancel</Button>
                <Button onClick={submitReply}>Send Reply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Select onValueChange={(v) => setStatus(r.id, v)} defaultValue={r.status}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  const openCount = tickets.filter((t) => ['open', 'pending'].includes(String(t.status).toLowerCase())).length;
  const urgentCount = tickets.filter((t) => ['high', 'urgent'].includes(String(t.priority || t.severity || '').toLowerCase())).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Respond to and manage user support requests"
        icon={LifeBuoy}
        exportName="tickets"
        exportColumns={columns}
        exportRows={filtered}
        actions={(
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Tickets" value={tickets.length} icon={LifeBuoy} accent="text-sky-400" />
        <StatCard label="Open" value={openCount} icon={Flame} accent="text-amber-400" />
        <StatCard label="Urgent" value={urgentCount} icon={UserCheck} accent="text-rose-400" />
        <StatCard label="Resolved" value={tickets.filter((t) => ['closed', 'resolved'].includes(String(t.status).toLowerCase())).length} icon={CheckCircle2} accent="text-emerald-400" />
      </div>

      <DataTable columns={columns} data={filtered} searchKeys={[(r) => r.title, (r) => r.user_email, (r) => r.subject]} searchPlaceholder="Search tickets…" exportName="tickets" pageSize={12} />
    </div>
  );
}