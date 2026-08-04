import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Palette, ImageIcon, ShoppingCart, X } from 'lucide-react';
import { useCollectionSnapshot } from '@/hooks/useCollectionSnapshot';
import { Skeleton } from '@/components/ui/skeleton';

const sources = [
  { key: 'users', label: 'Users', icon: Users, href: (r) => `/admin/users?q=${encodeURIComponent(r.email || r.id)}`, searchKeys: ['email', 'full_name'] },
  { key: 'artists', label: 'Artists', icon: Palette, href: (r) => `/admin/artists?q=${encodeURIComponent(r.user_email || r.id)}`, searchKeys: ['user_email', 'artist_name', 'full_name'] },
  { key: 'artworks', label: 'Artwork', icon: ImageIcon, href: (r) => `/admin/artwork?q=${encodeURIComponent(r.title || r.id)}`, searchKeys: ['title', 'artist_email', 'category'] },
  { key: 'orders', label: 'Orders', icon: ShoppingCart, href: (r) => `/admin/orders?q=${encodeURIComponent(r.id)}`, searchKeys: ['buyer_email', 'seller_email', 'artwork_title'] },
];

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const users = useCollectionSnapshot('users', { max: 200 });
  const artists = useCollectionSnapshot('artists', { max: 200 });
  const artworks = useCollectionSnapshot('artworks', { max: 200 });
  const orders = useCollectionSnapshot('orders', { max: 200 });

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const needle = query.trim().toLowerCase();
    return sources.flatMap(({ key, label, icon, href, searchKeys }) => {
      const pool = { users: users.data, artists: artists.data, artworks: artworks.data, orders: orders.data }[key];
      const matches = pool
        .filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(needle)))
        .slice(0, 6)
        .map((row) => ({ type: label, icon, row, href: href(row) }));
      return matches;
    });
  }, [query, users.data, artists.data, artworks.data, orders.data]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const loading = users.loading || artists.loading || artworks.loading || orders.loading;

  const subtitle = (type, row) => {
    if (type === 'Users') return row.email;
    if (type === 'Artists') return row.artist_name || row.user_email;
    if (type === 'Artwork') return `${row.artist_email || ''} · ${row.category || ''}`;
    return `${row.buyer_email || ''} · ${row.artwork_title || ''}`;
  };

  return (
    <div className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, artists, artwork, orders…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : results.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {query.trim() ? 'No matching results.' : 'Start typing to search across the platform.'}
          </p>
        ) : (
          results.map((result, i) => {
            const Icon = result.icon;
            return (
              <button
                key={`${result.type}-${i}`}
                onClick={() => { navigate(result.href); onClose?.(); }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-secondary"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-gold">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {result.type === 'Artwork' ? (result.row.title || result.row.id) : (result.row.full_name || result.row.user_email || result.row.id)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{subtitle(result.type, result.row)}</p>
                </div>
                <span className="text-xs text-muted-foreground">{result.type}</span>
              </button>
            );
          })
        )}
      </div>
      <div className="border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
        Navigate with results · Esc to close
      </div>
    </div>
  );
}