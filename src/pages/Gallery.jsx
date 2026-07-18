import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import ArtworkCard from '@/components/ui/ArtworkCard';
import BuyArtworkModal from '@/components/modals/BuyArtworkModal';
import BidModal from '@/components/modals/BidModal';
import { ArtworkService } from '@/services';

const categories = ['all', 'painting', 'photography', 'sculpture', 'music', 'digital_art', 'crafts', 'performance'];

export default function Gallery() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [buyingArtwork, setBuyingArtwork] = useState(null);
  const [biddingArtwork, setBiddingArtwork] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    if (cat) setSelectedCat(cat);
  }, []);

  useEffect(() => {
    setLoading(true);
    const sortMap = { newest: '-created_date', 'price-low': 'price', 'price-high': '-price', popular: '-likes' };
    ArtworkService.list(sortMap[sortBy] || '-created_date', 50)
      .then(setArtworks)
      .finally(() => setLoading(false));
  }, [sortBy]);

  const filtered = artworks.filter(a => {
    const matchCat = selectedCat === 'all' || a.category === selectedCat;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.artist_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="font-playfair font-bold text-4xl text-foreground mb-1">The Gallery</h1>
          <p className="text-muted-foreground">Original Zambian art — available to purchase in Kwacha</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks, artists..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-card border border-border text-foreground text-sm px-3 py-2 rounded-md"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCat === cat
                    ? 'bg-gold text-background border-gold'
                    : 'border-border text-muted-foreground hover:border-gold hover:text-gold'
                }`}
              >
                {cat === 'all' ? 'All Art' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-5">{filtered.length} works found</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-playfair text-2xl text-muted-foreground mb-2">No artworks found</p>
            <p className="text-sm text-muted-foreground">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(artwork => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                onBuy={setBuyingArtwork}
                onBid={setBiddingArtwork}
              />
            ))}
          </div>
        )}
      </div>

      {buyingArtwork && <BuyArtworkModal artwork={buyingArtwork} onClose={() => setBuyingArtwork(null)} />}
      {biddingArtwork && <BidModal artwork={biddingArtwork} onClose={() => setBiddingArtwork(null)} />}
    </div>
  );
}