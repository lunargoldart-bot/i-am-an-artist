import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Trophy } from 'lucide-react';
import ArtistCard from '@/components/ui/ArtistCard';
import { ArtistService } from '@/services';

const categories = ['all', 'painting', 'photography', 'sculpture', 'music', 'digital_art', 'crafts', 'performance'];

const categoryEmojis = { painting: '🎨', photography: '📸', sculpture: '🗿', music: '🎵', digital_art: '💻', crafts: '🧶', performance: '🎭' };

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    ArtistService.list('-created_date', 100)
      .then(setArtists)
      .finally(() => setLoading(false));
  }, []);

  const filtered = artists.filter(a => {
    const matchCat = selectedCat === 'all' || a.category === selectedCat;
    const matchSearch = !search || a.display_name?.toLowerCase().includes(search.toLowerCase()) || a.location?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group by category for ranking view
  const categoryGroups = categories.filter(c => c !== 'all').reduce((acc, cat) => {
    const catArtists = artists.filter(a => a.category === cat).slice(0, 10);
    if (catArtists.length > 0) acc[cat] = catArtists;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-gold" />
            <h1 className="font-playfair font-bold text-4xl text-foreground">Artist Rankings</h1>
          </div>
          <p className="text-muted-foreground">Zambia's top artists ranked by sales, views, and community engagement</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search artists..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                    selectedCat === cat ? 'bg-gold text-background border-gold' : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
                  }`}
                >
                  {cat === 'all' ? 'All' : `${categoryEmojis[cat] || ''} ${cat.replace('_', ' ')}`}
                </button>
              ))}
            </div>
          </div>

        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse flex gap-4">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedCat === 'all' ? (
          // Show all categories grouped
          <div className="space-y-12">
            {Object.entries(categoryGroups).map(([cat, catArtists]) => (
              <div key={cat}>
                <h2 className="font-playfair font-bold text-2xl text-foreground mb-4 flex items-center gap-2">
                  <span>{categoryEmojis[cat]}</span>
                  <span className="capitalize">{cat.replace('_', ' ')}</span>
                  <span className="text-muted-foreground text-base font-normal ml-1">Rankings</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catArtists.map((artist, i) => (
                    <ArtistCard key={artist.id} artist={artist} rank={i + 1} />
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(categoryGroups).length === 0 && (
              <div className="text-center py-20">
                <p className="font-playfair text-2xl text-muted-foreground">No artists yet</p>
                <p className="text-sm text-muted-foreground mt-2">Be the first to join ZambiaArts!</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="font-playfair font-bold text-2xl text-foreground mb-4">
              {categoryEmojis[selectedCat]} {selectedCat.replace('_', ' ')} Artists
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((artist, i) => (
                <ArtistCard key={artist.id} artist={artist} rank={i + 1} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="font-playfair text-2xl text-muted-foreground">No artists in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}