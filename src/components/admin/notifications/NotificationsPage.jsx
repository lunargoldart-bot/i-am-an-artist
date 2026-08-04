import { useState } from 'react';
import { Bell, Send, BellRing, Mail } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { timeAgo } from '@/lib/adminData';
import { withToast } from '@/lib/adminActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function NotificationsPage() {
  const notifications = useCollectionSnapshot('notifications', { max: 3000 }).data;
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [isPush, setIsPush] = useState(true);
  const [isEmail, setIsEmail] = useState(false);

  const sendNotification = () => {
    if (!title.trim() || !message.trim()) return;
    const docId = `${Date.now()}`;
    withToast(
      setDoc(doc(db, 'notifications', docId), {
        title,
        message,
        target_role: targetRole,
        channels: { push: isPush, email: isEmail },
        status: 'sent',
        created_date: new Date().toISOString(),
      }),
      'Notification broadcast',
    );
    setTitle('');
    setMessage('');
  };

  const columns = [
    { key: 'title', label: 'Title', render: (r) => <p className="font-medium text-foreground">{r.title}</p> },
    { key: 'message', label: 'Message', render: (r) => <p className="max-w-md truncate text-sm text-muted-foreground">{r.message}</p> },
    { key: 'target_role', label: 'Audience', render: (r) => <span className="capitalize">{r.target_role || 'all'}</span> },
    {
      key: 'channels', label: 'Channels',
      render: (r) => (
        <div className="flex gap-1 text-[11px]">
          {r.channels?.push && <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">Push</span>}
          {r.channels?.email && <span className="rounded bg-secondary px-1.5 py-0.5 text-muted-foreground">Email</span>}
        </div>
      ),
    },
    { key: 'created_date', label: 'Sent', render: (r) => timeAgo(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Compose and send push and email notifications" icon={Bell} exportName="notifications" exportColumns={columns} exportRows={notifications} />

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-playfair text-base text-foreground">Broadcast Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title…" />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Notification message…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  <SelectItem value="artist">Artists</SelectItem>
                  <SelectItem value="buyer">Collectors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-6">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={isPush} onCheckedChange={setIsPush} /> <BellRing className="h-3.5 w-3.5" /> Push
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={isEmail} onCheckedChange={setIsEmail} /> <Mail className="h-3.5 w-3.5" /> Email
              </label>
            </div>
          </div>
          <Button onClick={sendNotification}>
            <Send className="mr-2 h-4 w-4" /> Send Notification
          </Button>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={notifications} searchKeys={[(r) => r.title, (r) => r.message]} searchPlaceholder="Search notifications…" exportName="notifications" pageSize={12} />
    </div>
  );
}