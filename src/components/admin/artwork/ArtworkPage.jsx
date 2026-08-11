import { useMemo, useState } from 'react';
import { ImageIcon, Check, X, Star, StarOff, Trash2 } from 'lucide-react';
import { PageHeader, DataTable } from '@/components/admin/ui';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { updateRecord, deleteRecord, withToast } from '@/lib/adminActions';
import { formatCurrency, formatDate } from '@/lib/adminData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ArtworkPage() {
  const { data } = useCollectionSnapshot('artworks', { max: 5000 });
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter((a) => String(a.status || a.approval_status || 'pending').toLowerCase() === statusFilter);
  }, [data, statusFilter]);

  const setStatus = (row, status) => withToast(updateRecord('artworks', row.id, { status }), `Artwork ${status}`);
  const toggleFeature = (row) => withToast(updateRecord('artworks', row.id, { featured: !row.featured }), row.featured ? 'Removed from featured' : 'Marked as featured');
  const remove = (row) => withToast(deleteRecord('artworks', row.id), 'Artwork deleted');

  const columns = [
    {
      key: 'title', label: 'Artwork',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.image_url || r.image ? (
            <img src={r.image_url || r.image} alt={r.title} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{r.title || r.id}</p>
            <p className="truncate text-xs text-muted-foreground">{r.artist_email}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', badge: (r) => r.category },
    { key: 'price_zmw', label: 'Price (ZMW)', numeric: true, render: (r) => formatCurrency(r.price_zmw || r.price), sortable: true },
    { key: 'views_count', label: 'Views', numeric: true, sortable: true },
    { key: 'likes_count', label: 'Likes', numeric: true, sortable: true },
    { key: 'status', label: 'Status', status: true },
    { key: 'created_date', label: 'Uploaded', render: (r) => formatDate(r.created_date) },
    {
      key: 'actions', label: 'Actions', className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" aria-label="Approve" onClick={() => setStatus(r, 'approved')}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" aria-label="Reject" onClick={() => setStatus(r, 'rejected')}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Feature" onClick={() => toggleFeature(r)}>
            {r.featured ? <Star className="h-3.5 w-3.5 text-primary" /> : <StarOff className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" aria-label="Delete" onClick={() => remove(r)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artwork"
        description="Approve, feature and moderate all artwork"
        icon={ImageIcon}
        exportName="artwork"
        exportColumns={columns}
        exportRows={filtered}
        actions={(
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={[(r) => r.title, (r) => r.artist_email, (r) => r.category, (r) => r.medium]}
        searchPlaceholder="Search artworkâ€¦"
        exportName="artwork"
        pageSize={12}
      />
    </div>
  );
}