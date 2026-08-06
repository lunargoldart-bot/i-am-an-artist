import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search artworks, artists..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
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
                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
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
        <p className="text-sm text-muted-foreground mb-5">{filtered.length} works found</p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-playfair text-2xl text-muted-foreground mb-2">No artworks found</p>
            <p className="text-sm text-muted-foreground">Try a different category or search term</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCat + search + sortBy}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filtered.map((artwork, i) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.25 }}
                >
                  <ArtworkCard
                    artwork={artwork}
                    onBuy={setBuyingArtwork}
                    onBid={setBiddingArtwork}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {buyingArtwork && <BuyArtworkModal artwork={buyingArtwork} onClose={() => setBuyingArtwork(null)} />}
      {biddingArtwork && <BidModal artwork={biddingArtwork} onClose={() => setBiddingArtwork(null)} />}
    </div>
  );
}