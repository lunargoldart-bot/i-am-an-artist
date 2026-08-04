import { useEffect, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { timeAgo } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

const LOCAL_KEY = 'iamanartist_audit_logs';

const loadLocal = () => {
  try { return JSON.parse(window.localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
};

export function recordAudit({ action, entity, entityId, actor, details = {} }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action, entity, entity_id: entityId, actor, details, created_date: new Date().toISOString(),
  };
  const current = loadLocal();
  const next = [entry, ...current].slice(0, 500);
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  return entry;
}

export default function AuditLogsPage() {
  const { data: remoteLogs, loading } = useCollectionSnapshot('audit_logs', { max: 3000 });
  const [localLogs, setLocalLogs] = useState([]);

  useEffect(() => {
    setLocalLogs(loadLocal());
  }, []);

  const logs = [...remoteLogs.map((l) => ({ source: 'firestore', ...l })), ...localLogs.map((l) => ({ source: 'local', ...l }))]
    .sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)))
    .slice(0, 300);

  const seedSample = () => {
    const entry = recordAudit({ action: 'admin.view', entity: 'users', entityId: 'sample', actor: 'admin@iamanartistapp.com', details: { note: 'Sample audit event' } });
    setLocalLogs(loadLocal());
    return entry;
  };

  const columns = [
    { key: 'action', label: 'Action', render: (r) => <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-gold">{r.action}</code> },
    { key: 'entity', label: 'Entity', render: (r) => <span className="capitalize">{r.entity}</span> },
    { key: 'entity_id', label: 'Entity ID', render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.entity_id}</span> },
    { key: 'actor', label: 'Actor', render: (r) => r.actor },
    { key: 'source', label: 'Source', badge: (r) => r.source },
    { key: 'created_date', label: 'Timestamp', render: (r) => timeAgo(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Every admin action, tracked in real time"
        icon={ScrollText}
        exportName="audit-logs"
        exportColumns={columns}
        exportRows={logs}
        actions={(
          <Button variant="outline" size="sm" onClick={seedSample}>
            <Save className="mr-2 h-3.5 w-3.5" /> Sample Event
          </Button>
        )}
      />

      <DataTable columns={columns} data={logs} searchKeys={[(r) => r.action, (r) => r.entity, (r) => r.actor, (r) => r.entity_id]} searchPlaceholder="Search audit logs…" exportName="audit-logs" pageSize={15} />

      <p className="text-xs text-muted-foreground">
        Events are recorded to the Firestore <code className="rounded bg-secondary px-1 font-mono">audit_logs</code> collection and mirrored locally for resilience. {loading ? 'Syncing…' : `${remoteLogs.length} remote events`}.
      </p>
    </div>
  );
}