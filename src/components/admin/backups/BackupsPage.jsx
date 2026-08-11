import { useState } from 'react';
import { DatabaseBackup, DownloadCloud, Clock, HardDrive } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatDateTime, formatCompact } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { downloadJSON } from '@/utils/exporters';
import toast from 'react-hot-toast';

const SNAPSHOT_COLLECTIONS = [
  'users', 'artworks', 'artists', 'orders', 'payments',
  'transactions', 'checkoutSessions', 'artistPayouts', 'grievances', 'platformRevenue',
];

function CollectionCountCard({ name }) {
  const { data } = useCollectionSnapshot(name, { max: 5000 });
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <HardDrive className="h-4 w-4" />
          <p className="truncate font-mono text-xs">{name}</p>
        </div>
        <p className="mt-2 font-playfair text-2xl font-bold text-foreground">{formatCompact(data.length || 0)}</p>
      </CardContent>
    </Card>
  );
}

function useBackupSnapshots() {
  const users = useCollectionSnapshot('users', { max: 5000 });
  const artworks = useCollectionSnapshot('artworks', { max: 5000 });
  const artists = useCollectionSnapshot('artists', { max: 5000 });
  const orders = useCollectionSnapshot('orders', { max: 5000 });
  const payments = useCollectionSnapshot('payments', { max: 5000 });
  const transactions = useCollectionSnapshot('transactions', { max: 5000 });
  const checkoutSessions = useCollectionSnapshot('checkoutSessions', { max: 5000 });
  const artistPayouts = useCollectionSnapshot('artistPayouts', { max: 5000 });
  const grievances = useCollectionSnapshot('grievances', { max: 5000 });
  const platformRevenue = useCollectionSnapshot('platform_revenue', { max: 5000 });
  return { users, artworks, artists, orders, payments, transactions, checkoutSessions, artistPayouts, grievances, platformRevenue };
}

export default function BackupsPage() {
  const [building, setBuilding] = useState(false);
  const [snapshots, setSnapshots] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('iamanartist_backups') || '[]'); } catch { return []; }
  });

  const snap = useBackupSnapshots();

  const runBackup = () => {
    setBuilding(true);
    try {
      const payload = {};
      SNAPSHOT_COLLECTIONS.forEach((name) => { payload[name] = snap[name].data; });
      downloadJSON({ filename: `backup-${Date.now()}`, data: payload });
      const records = Object.values(payload).reduce((s, a) => s + (a?.length || 0), 0);
      const record = { id: `${Date.now()}`, status: 'completed', created_date: new Date().toISOString(), collections: SNAPSHOT_COLLECTIONS.length, records };
      const next = [record, ...snapshots].slice(0, 20);
      setSnapshots(next);
      window.localStorage.setItem('iamanartist_backups', JSON.stringify(next));
      toast.success('Backup downloaded');
    } finally {
      setBuilding(false);
    }
  };

  const columns = [
    { key: 'id', label: 'Backup', render: (r) => <span className="font-mono text-xs text-primary">BK-{r.id}</span> },
    { key: 'status', label: 'Status', status: true },
    { key: 'collections', label: 'Collections', numeric: true },
    { key: 'records', label: 'Records', numeric: true, sortable: true },
    { key: 'created_date', label: 'Created', render: (r) => formatDateTime(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backups"
        description="Snapshot and restore platform data"
        icon={DatabaseBackup}
        exportName="backups"
        exportColumns={columns}
        exportRows={snapshots}
        actions={(
          <Button onClick={runBackup} disabled={building}>
            <DownloadCloud className="mr-2 h-4 w-4" /> {building ? 'Backing upâ€¦' : 'Run Backup'}
          </Button>
        )}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {SNAPSHOT_COLLECTIONS.map((name) => <CollectionCountCard key={name} name={name} />)}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-playfair text-base text-foreground">
              <Clock className="h-4 w-4 text-primary" /> Automatic Backups
            </CardTitle>
            <CardDescription className="text-xs">Scheduled daily snapshots of core collections.</CardDescription>
          </div>
          <Badge variant="secondary">Every 24h</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Automatic backups run server-side. Manual backups download a JSON snapshot of all collections to your browser. Restore is available by importing the JSON into Firestore.
          </p>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={snapshots} onExport={false} searchKeys={[(r) => r.id]} searchPlaceholder="Search backupsâ€¦" pageSize={10} emptyMessage="No backups yet. Run your first backup above." />
    </div>
  );
}