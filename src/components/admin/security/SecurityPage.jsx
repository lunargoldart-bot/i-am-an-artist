import { useEffect, useState } from 'react';
import { Lock, Fingerprint, ScrollText, ShieldCheck, ShieldAlert } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { timeAgo, countBy } from '@/lib/adminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function SecurityPage() {
  const { data: auditLogs } = useCollectionSnapshot('audit_logs', { max: 3000 });
  const loginAttempts = useCollectionSnapshot('login_attempts', { max: 3000 }).data;
  const users = useCollectionSnapshot('users', { max: 5000 }).data;

  const [local, setLocal] = useState([]);
  useEffect(() => {
    try { setLocal(JSON.parse(window.localStorage.getItem('iamanartist_audit_logs') || '[]')); } catch { /* ignore */ }
  }, []);

  const actions = [...auditLogs, ...local]
    .sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)))
    .slice(0, 200);

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const bannedCount = users.filter((u) => u.status === 'suspended' || u.banned).length;

  const actionDist = countBy(actions, 'action').slice(0, 8);

  const columns = [
    { key: 'action', label: 'Action', render: (r) => <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-gold">{r.action}</code> },
    { key: 'actor', label: 'Actor', render: (r) => r.actor },
    { key: 'entity', label: 'Entity', render: (r) => <span className="capitalize">{r.entity}</span> },
    { key: 'created_date', label: 'Timestamp', render: (r) => timeAgo(r.created_date) },
  ];

  const attemptColumns = [
    { key: 'email', label: 'Email', render: (r) => r.email || r.identifier },
    { key: 'success', label: 'Result', badge: (r) => (r.success ? 'success' : 'failed') },
    { key: 'ip', label: 'IP Address', render: (r) => r.ip || r.ip_address || '—' },
    { key: 'created_date', label: 'Time', render: (r) => timeAgo(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Security" description="Login attempts, admin actions and platform hardening" icon={Lock} />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Active Admins', value: adminCount, icon: ShieldCheck, tone: 'text-emerald-400' },
          { label: 'Suspended Accounts', value: bannedCount, icon: ShieldAlert, tone: 'text-rose-400' },
          { label: 'Failed Logins', value: loginAttempts.filter((a) => !a.success).length, icon: Fingerprint, tone: 'text-amber-400' },
        ].map((c) => (
          <Card key={c.label} className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className={`font-playfair text-3xl font-bold ${c.tone}`}>{c.value}</p>
              </div>
              <c.icon className={`h-6 w-6 ${c.tone}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-playfair text-base text-foreground">
              <ScrollText className="h-4 w-4 text-gold" /> Admin Action Log
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <DataTable columns={columns} data={actions} onExport={false} pageSize={8} emptyMessage="No admin actions yet." searchPlaceholder="Search actions…" />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-playfair text-base text-foreground">Action Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ value: { label: 'Count', color: 'var(--chart-2)' } }} className="h-[360px]">
              <BarChart data={actionDist} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={110} tickFormatter={(v) => String(v).slice(0, 16)} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" name="value" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-playfair text-base text-foreground">Login Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={attemptColumns} data={loginAttempts} searchKeys={[(r) => r.email, (r) => r.ip]} searchPlaceholder="Search login attempts…" exportName="login-attempts" pageSize={10} emptyMessage="No login attempts recorded yet." />
        </CardContent>
      </Card>
    </div>
  );
}