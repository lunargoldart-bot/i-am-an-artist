import { useState } from 'react';
import { Megaphone, Send, Users, BarChart3 } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { firebaseClient } from '@/api/firebaseClient';
import { withToast } from '@/lib/adminActions';
import toast from 'react-hot-toast';

export default function MarketingPage() {
  const users = useCollectionSnapshot('users', { max: 5000 }).data;
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');

  const audienceCount = () => {
    if (audience === 'artists') return users.filter((u) => u.role === 'artist').length;
    if (audience === 'collectors') return users.filter((u) => u.role === 'buyer').length;
    if (audience === 'subscribers') return users.filter((u) => (u.subscription_tier || 'free') !== 'free').length;
    return users.length;
  };

  const sendBroadcast = async () => {
    if (!subject.trim() || !body.trim()) return toast.error('Subject and message are required');
    const targets = users
      .filter((u) => {
        if (audience === 'artists') return u.role === 'artist';
        if (audience === 'collectors') return u.role === 'buyer';
        if (audience === 'subscribers') return (u.subscription_tier || 'free') !== 'free';
        return true;
      })
      .slice(0, 50);
    if (!targets.length) return toast.error('No recipients in this audience');

    await withToast(
      Promise.all(targets.map((u) => firebaseClient.integrations.Core.SendEmail({ to: u.email, subject, html: `<p>${body}</p>`, text: body }).catch(() => null))),
      `Broadcast queued to ${targets.length} recipients`,
    );
    setSubject('');
    setBody('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Marketing" description="Campaigns and broadcast announcements" icon={Megaphone} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Audience" value={users.length} icon={Users} accent="text-sky-400" />
        <StatCard label="Artists" value={users.filter((u) => u.role === 'artist').length} icon={Users} accent="text-emerald-400" />
        <StatCard label="Collectors" value={users.filter((u) => u.role === 'buyer').length} icon={Users} accent="text-violet-400" />
        <StatCard label="Subscribers" value={users.filter((u) => (u.subscription_tier || 'free') !== 'free').length} icon={BarChart3} accent="text-primary" />
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-playfair text-base text-foreground">Email Broadcast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="artists">Artists</SelectItem>
                <SelectItem value="collectors">Collectors</SelectItem>
                <SelectItem value="subscribers">Subscribers</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{audienceCount()} recipients will receive this message (limited to 50 per run).</p>
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Announcement subjectâ€¦" />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Write your announcementâ€¦" />
          </div>
          <Button onClick={sendBroadcast}>
            <Send className="mr-2 h-4 w-4" /> Send Broadcast
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}