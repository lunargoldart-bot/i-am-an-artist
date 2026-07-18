import { useEffect, useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['painting', 'photography', 'sculpture', 'music', 'digital_art', 'crafts', 'performance'];

const emptyForm = { title: '', description: '', category: 'painting', price_zmw: '', is_auction: false, auction_end_date: '', medium: '', dimensions: '', year_created: '' };

export default function ManageArtworks({ user }) {
  const [artworks, setArtworks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const load = () => {
    if (!user) return;
    firebaseClient.entities.Artwork.filter({ artist_email: user.email }).then(setArtworks).catch(() => {});
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form,
      price_zmw: parseFloat(form.price_zmw) || 0,
      year_created: parseInt(form.year_created) || new Date().getFullYear(),
      artist_name: user.full_name,
      artist_email: user.email,
      images: imageUrl ? [imageUrl] : [],
      status: form.is_auction ? 'auction' : 'available',
    };
    if (editing) {
      await firebaseClient.entities.Artwork.update(editing.id, data);
      toast.success('Artwork updated!');
    } else {
      await firebaseClient.entities.Artwork.create(data);
      toast.success('Artwork listed successfully!');
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditing(null);
    setImageUrl('');
    setLoading(false);
    load();
  };

  const handleEdit = (artwork) => {
    setEditing(artwork);
    setForm({ ...emptyForm, ...artwork, price_zmw: artwork.price_zmw?.toString() || '' });
    setImageUrl(artwork.images?.[0] || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this artwork?')) return;
    await firebaseClient.entities.Artwork.delete(id);
    toast.success('Artwork removed');
    load();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await firebaseClient.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setLoading(false);
    toast.success('Image uploaded!');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair font-bold text-xl text-foreground">My Artworks</h2>
        <Button className="gold-gradient text-background font-semibold" size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> List Artwork
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-playfair font-semibold text-foreground">{editing ? 'Edit Artwork' : 'List New Artwork'}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-background border border-border text-foreground text-sm px-3 py-2 rounded-md">
                {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Price (ZMW)</label>
              <Input type="number" value={form.price_zmw} onChange={e => setForm({ ...form, price_zmw: e.target.value })} className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Medium</label>
              <Input value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} placeholder="e.g. Oil on canvas" className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Dimensions</label>
              <Input value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} placeholder="e.g. 60x80cm" className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Year</label>
              <Input type="number" value={form.year_created} onChange={e => setForm({ ...form, year_created: e.target.value })} placeholder={new Date().getFullYear().toString()} className="bg-background border-border" />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-background border-border h-20" />
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Artwork Image</label>
            <div className="flex gap-3 items-center">
              {imageUrl && <img src={imageUrl} alt="preview" className="w-16 h-16 rounded-md object-cover border border-border" />}
              <label className="flex items-center gap-2 cursor-pointer bg-secondary border border-border rounded-md px-4 py-2 text-sm text-muted-foreground hover:border-gold hover:text-gold transition-colors">
                <Upload className="w-4 h-4" /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          {/* Auction toggle */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="auction" checked={form.is_auction} onChange={e => setForm({ ...form, is_auction: e.target.checked })} className="accent-gold" />
            <label htmlFor="auction" className="text-sm text-foreground">List as Auction</label>
            {form.is_auction && (
              <Input type="datetime-local" value={form.auction_end_date} onChange={e => setForm({ ...form, auction_end_date: e.target.value })} className="bg-background border-border text-sm ml-2" />
            )}
          </div>

          <Button type="submit" className="gold-gradient text-background font-semibold w-full" disabled={loading}>
            {loading ? 'Saving...' : editing ? 'Update Artwork' : 'List Artwork'}
          </Button>
        </form>
      )}

      {artworks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-playfair text-xl mb-2">No artworks listed yet</p>
          <p className="text-sm">Click "List Artwork" to start selling</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {artworks.map(artwork => (
            <div key={artwork.id} className="bg-card border border-border rounded-lg overflow-hidden">
              <img
                src={artwork.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'}
                alt={artwork.title}
                className="w-full h-36 object-cover"
              />
              <div className="p-3">
                <h4 className="font-playfair font-semibold text-foreground text-sm mb-0.5">{artwork.title}</h4>
                <p className="text-gold text-sm font-bold">ZMW {artwork.price_zmw?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground capitalize">{artwork.status}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="flex-1 border-border text-xs" onClick={() => handleEdit(artwork)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-destructive/50 text-destructive text-xs" onClick={() => handleDelete(artwork.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}