import { useMemo, useState } from 'react';
import { ShieldAlert, Check, X, Trash2, Cpu } from 'lucide-react';
import { PageHeader, DataTable, StatCard } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { updateRecord, deleteRecord, withToast } from '@/lib/adminActions';
import { timeAgo } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ModerationPage() {
  const grievances = useCollectionSnapshot('grievances', { max: 3000 }).data;
  const artworks = useCollectionSnapshot('artworks', { max: 5000 }).data;
  const [tab, setTab] = useState('reports');

  const reports = useMemo(() => grievances.filter((g) => ['report', 'flagged', 'abuse'].includes(String(g.type || g.subject || '').toLowerCase()) || g.is_report), [grievances]);
  const flaggedArtwork = useMemo(() => artworks.filter((a) => a.flagged || a.reported || (a.report_count || 0) > 0), [artworks]);

  const items = tab === 'reports' ? reports : flaggedArtwork;
  const isArtwork = tab === 'artwork';

  const resolve = (id, status) => withToast(updateRecord('grievances', id, { status }), `Marked ${status}`);
  const deleteArtwork = (id) => withToast(deleteRecord('artworks', id), 'Artwork removed');

  const artworkColumns = [
    {
      key: 'title', label: 'Artwork',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.image_url || r.image ? <img src={r.image_url || r.image} alt={r.title} className="h-10 w-10 rounded-lg object-cover" /> : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{r.title || r.id}</p>
            <p className="truncate text-xs text-muted-foreground">{r.artist_email}</p>
          </div>
        </div>
      ),
    },
    { key: 'report_count', label: 'Reports', numeric: true, render: (r) => r.report_count || (r.flagged ? 1 : 0) },
    { key: 'status', label: 'Status', status: true },
    { key: 'created_date', label: 'Uploaded', render: (r) => timeAgo(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" aria-label="Approve" onClick={() => withToast(updateRecord('artworks', r.id, { status: 'approved' }), 'Artwork approved')}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" aria-label="Delete" onClick={() => deleteArtwork(r.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const reportColumns = [
    { key: 'title', label: 'Report', render: (r) => <p className="font-medium text-foreground">{r.title || r.subject || 'Report'}</p> },
    { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type || r.category || 'general'}</span> },
    { key: 'user_email', label: 'Reporter', render: (r) => r.user_email || r.reporter_email || '—' },
    { key: 'status', label: 'Status', status: true },
    { key: 'created_date', label: 'Filed', render: (r) => timeAgo(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" aria-label="Approve" onClick={() => resolve(r.id, 'resolved')}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" aria-label="Reject" onClick={() => resolve(r.id, 'dismissed')}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const openCount = grievances.filter((g) => String(g.status).toLowerCase() === 'open').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Moderation"
        description="Reported content, flagged artwork and AI moderation status"
        icon={ShieldAlert}
        exportName="moderation"
        exportColumns={isArtwork ? artworkColumns : reportColumns}
        exportRows={items}
        actions={(
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="artwork">Flagged Artwork</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Open Reports" value={openCount} icon={ShieldAlert} accent="text-amber-400" />
        <StatCard label="Total Reports" value={grievances.length} icon={X} accent="text-rose-400" />
        <StatCard label="AI Moderation" value={grievances.filter((g) => g.ai_flagged).length} icon={Cpu} accent="text-violet-400" />
      </div>

      <DataTable columns={isArtwork ? artworkColumns : reportColumns} data={items} searchKeys={[(r) => r.title, (r) => r.user_email, (r) => r.artist_email, (r) => r.subject]} searchPlaceholder="Search moderation queue…" exportName="moderation" pageSize={12} />
    </div>
  );
}