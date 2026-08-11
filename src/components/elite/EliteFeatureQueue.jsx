import { useState, useEffect } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { motion } from 'framer-motion';
import { Diamond, Calendar, Plus, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'painting', label: 'Painting' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'photography', label: 'Photography' },
  { value: 'music', label: 'Music' },
  { value: 'digital_art', label: 'Digital Art' },
  { value: 'mixed_media', label: 'Mixed Media' },
  { value: 'textile', label: 'Textile' },
  { value: 'pottery', label: 'Pottery' },
  { value: 'fashion', label: 'Fashion' },
];

export default function EliteFeatureQueue() {
  const [user, setUser] = useState(null);
  const [myArtworks, setMyArtworks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const me = await firebaseClient.auth.me();
      setUser(me);
      if (me?.subscription_tier !== 'elite') { setLoading(false); return; }
      const [artworks, existing] = await Promise.all([
        firebaseClient.entities.Artwork.filter({ artist_email: me.email }),
        firebaseClient.entities.FeatureQueue.filter({ artist_email: me.email }),
      ]);
      setMyArtworks(artworks || []);
      setQueue((existing || []).sort((a, b) => new Date(a.feature_date) - new Date(b.feature_date)));
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  // Auto-fill category when artwork is selected
  useEffect(() => {
    if (selectedArtwork) {
      const art = myArtworks.find(a => a.id === selectedArtwork);
      if (art?.category) setSelectedCategory(art.category);
    }
  }, [selectedArtwork, myArtworks]);

  const handleQueue = async () => {
    if (!selectedArtwork || !selectedCategory || !selectedDate) {
      toast.error('Please fill in all fields');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate <= today) {
      toast.error('Feature date must be in the future');
      return;
    }
    // Check no conflict on same date+category
    const conflict = queue.find(q => q.feature_date === selectedDate && q.category === selectedCategory && q.status === 'queued');
    if (conflict) {
      toast.error('You already have a feature queued for that date & category');
      return;
    }
    setSubmitting(true);
    const art = myArtworks.find(a => a.id === selectedArtwork);
    await firebaseClient.entities.FeatureQueue.create({
      artwork_id: selectedArtwork,
      artwork_title: art?.title || '',
      artwork_image: art?.image_urls?.[0] || '',
      artist_name: user.full_name,
      artist_email: user.email,
      category: selectedCategory,
      feature_date: selectedDate,
      status: 'queued',
      queued_by_tier: 'elite',
    });
    toast.success('Feature slot queued successfully!');
    setSelectedArtwork('');
    setSelectedDate('');
    // Refresh queue
    const updated = await firebaseClient.entities.FeatureQueue.filter({ artist_email: user.email });
    setQueue((updated || []).sort((a, b) => new Date(a.feature_date) - new Date(b.feature_date)));
    setSubmitting(false);
  };

  const handleCancel = async (id) => {
    await firebaseClient.entities.FeatureQueue.update(id, { status: 'cancelled' });
    setQueue(prev => prev.filter(q => q.id !== id));
    toast.success('Feature slot cancelled');
  };

  if (loading) return <div className="animate-pulse h-48 rounded-2xl bg-muted" />;

  if (!user || user.subscription_tier !== 'elite') {
    return (
      <div className="rounded-2xl border border-gold/20 bg-card p-8 text-center">
        <Diamond className="w-10 h-10 text-gold/30 mx-auto mb-3" />
        <h3 className="font-playfair font-bold text-lg text-foreground mb-2">Elite Feature Queue</h3>
        <p className="text-muted-foreground text-sm mb-4">Only Elite members can manually queue their artworks for daily features. Pro members are picked algorithmically.</p>
        <Button size="sm" className="gold-gradient text-[#1F1F1F] font-semibold">
          <Crown className="w-3.5 h-3.5 mr-1" /> Upgrade to Elite
        </Button>
      </div>
    );
  }

  const upcoming = queue.filter(q => q.status === 'queued');

  return (
    <div className="space-y-6">
      {/* Queue new slot */}
      <div className="rounded-2xl border border-gold/25 bg-card p-6"
        style={{ boxShadow: '0 0 30px rgba(212,175,55,0.05)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Diamond className="w-4 h-4 text-gold fill-gold/30" />
          <h3 className="font-playfair font-bold text-lg text-foreground">Queue a Feature Slot</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Artwork</label>
            <Select value={selectedArtwork} onValueChange={setSelectedArtwork}>
              <SelectTrigger><SelectValue placeholder="Select artwork" /></SelectTrigger>
              <SelectContent>
                {myArtworks.map(art => (
                  <SelectItem key={art.id} value={art.id}>{art.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Feature Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            />
          </div>
        </div>

        <Button onClick={handleQueue} disabled={submitting} className="gold-gradient text-[#1F1F1F] font-semibold">
          <Plus className="w-4 h-4 mr-1" /> {submitting ? 'Queuingâ€¦' : 'Queue Feature'}
        </Button>
      </div>

      {/* Upcoming queue */}
      {upcoming.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <h4 className="font-playfair font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold" /> Upcoming Feature Slots
          </h4>
          <div className="space-y-3">
            {upcoming.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-gold/30 transition-colors"
              >
                {item.artwork_image && (
                  <img src={item.artwork_image} alt={item.artwork_title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{item.artwork_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORIES.find(c => c.value === item.category)?.label} Â· {new Date(item.feature_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-medium">Queued</span>
                  <button onClick={() => handleCancel(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No upcoming feature slots queued. Add one above to guarantee your artwork is featured.
        </div>
      )}
    </div>
  );
}