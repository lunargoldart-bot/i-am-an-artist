import { Layers } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { formatDate } from '@/lib/adminData';

export default function CollectionsPage() {
  const exhibitions = useCollectionSnapshot('exhibitions', { max: 3000 }).data;

  const columns = [
    {
      key: 'title', label: 'Collection',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.cover_image || r.featured_image ? (
            <img src={r.cover_image || r.featured_image} alt={r.title} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Layers className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{r.title || r.name || r.id}</p>
            <p className="truncate text-xs text-muted-foreground">{r.organizer_email}</p>
          </div>
        </div>
      ),
    },
    { key: 'status', label: 'Status', status: true },
    { key: 'artwork_count', label: 'Artworks', numeric: true, render: (r) => r.artwork_ids?.length || r.artwork_count || 0 },
    { key: 'created_date', label: 'Created', render: (r) => formatDate(r.created_date) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collections"
        description="Exhibitions and curated collections"
        icon={Layers}
        exportName="collections"
        exportColumns={columns}
        exportRows={exhibitions}
      />
      <DataTable columns={columns} data={exhibitions} searchKeys={[(r) => r.title, (r) => r.name, (r) => r.organizer_email]} searchPlaceholder="Search collections…" exportName="collections" pageSize={12} />
    </div>
  );
}