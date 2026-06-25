import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, X, Upload, Zap } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['breaking', 'exhibition', 'artist_spotlight', 'auction', 'community', 'achievement'];
const emptyForm = { title: '', content: '', category: 'community', tags: '' };

export default function ManageNews({ user }) {
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const load = () => {
    if (!user) return;
    base44.entities.NewsFeed.filter({ author_email: user.email }).then(setNews).catch(() => {});
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      author_name: user.full_name,
      author_email: user.email,
      image: imageUrl,
    };
    if (editing) {
      await base44.entities.NewsFeed.update(editing.id, data);
      toast.success('Post updated!');
    } else {
      await base44.entities.NewsFeed.create(data);
      toast.success('Post published!');
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditing(null);
    setImageUrl('');
    setLoading(false);
    load();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ ...emptyForm, ...item, tags: (item.tags || []).join(', ') });
    setImageUrl(item.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await base44.entities.NewsFeed.delete(id);
    toast.success('Post deleted');
    load();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair font-bold text-xl text-foreground">My Posts & Stories</h2>
        <Button className="gold-gradient text-background font-semibold" size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      <div className="bg-secondary border border-border rounded-lg p-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><Zap className="w-4 h-4 text-gold" /> <strong className="text-foreground">Earn from your content!</strong> Posts with high engagement boost your artist ranking and visibility, leading to more sales and exhibition opportunities.</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-playfair font-semibold text-foreground">{editing ? 'Edit Post' : 'Publish New Story'}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-background border border-border text-foreground text-sm px-3 py-2 rounded-md">
                {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</label>
              <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. Lusaka, painting, exhibition" className="bg-background border-border" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Content *</label>
            <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required className="bg-background border-border h-32" placeholder="Write your story..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Featured Image</label>
            <div className="flex gap-3 items-center">
              {imageUrl && <img src={imageUrl} alt="preview" className="w-16 h-16 rounded-md object-cover border border-border" />}
              <label className="flex items-center gap-2 cursor-pointer bg-secondary border border-border rounded-md px-4 py-2 text-sm text-muted-foreground hover:border-gold hover:text-gold transition-colors">
                <Upload className="w-4 h-4" /> Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          <Button type="submit" className="gold-gradient text-background font-semibold w-full" disabled={loading}>
            {loading ? 'Publishing...' : editing ? 'Update Post' : 'Publish Story'}
          </Button>
        </form>
      )}

      {news.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Zap className="w-10 h-10 mx-auto mb-2" />
          <p className="font-playfair text-xl mb-2">No stories published yet</p>
          <p className="text-sm">Share your journey, exhibitions, and art news to grow your audience</p>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map(item => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-3 items-center">
              {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 rounded-md object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <h4 className="font-playfair font-semibold text-foreground line-clamp-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground capitalize">{item.category?.replace('_', ' ')} · {item.views_count || 0} views</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => handleEdit(item)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="border-destructive/50 text-destructive text-xs" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}