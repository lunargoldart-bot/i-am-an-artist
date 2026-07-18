import { useEffect, useState } from 'react';
import { NewsFeedService } from '@/services';
import { Zap, TrendingUp, Search } from 'lucide-react';
import NewsCard from '@/components/ui/NewsCard';
import { Input } from '@/components/ui/input';

const categories = ['all', 'breaking', 'exhibition', 'artist_spotlight', 'auction', 'community', 'achievement'];

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    NewsFeedService.list('-created_date', 50)
      .then(setNews)
      .finally(() => setLoading(false));
  }, []);

  const filtered = news.filter(n => {
    const matchCat = selectedCat === 'all' || n.category === selectedCat;
    const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.author_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const breaking = news.filter(n => n.category === 'breaking').slice(0, 3);
  const featured = filtered.find(n => n.is_featured) || filtered[0];
  const rest = filtered.filter(n => n.id !== featured?.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-red-400" />
            <h1 className="font-playfair font-bold text-4xl text-foreground">Art News Feed</h1>
          </div>
          <p className="text-muted-foreground">Breaking stories, artist spotlights, and the Zambian art scene</p>
        </div>
      </div>

      {/* Breaking ticker */}
      {breaking.length > 0 && (
        <div className="bg-red-500/10 border-b border-red-500/20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-red-400 font-bold text-xs shrink-0">
              <Zap className="w-3 h-3" /> BREAKING
            </span>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide text-xs text-muted-foreground">
              {breaking.map(b => (
                <span key={b.id} className="shrink-0">{b.title}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCat === cat ? 'bg-gold text-background border-gold' : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
                }`}
              >
                {cat === 'all' ? 'All' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse h-32" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-playfair text-2xl text-muted-foreground">No news yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main featured */}
            <div className="md:col-span-2">
              {featured && <NewsCard item={featured} featured />}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {rest.slice(0, 6).map(item => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                <h3 className="font-playfair font-semibold text-foreground">Trending</h3>
              </div>
              {news.slice(0, 8).map(item => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}