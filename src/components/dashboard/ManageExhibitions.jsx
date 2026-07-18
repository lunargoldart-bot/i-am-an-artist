import { useEffect, useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, X, Upload, Theater } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const types = ['solo', 'group', 'auction', 'live_performance', 'virtual'];
const statuses = ['upcoming', 'live', 'past'];
const emptyForm = { title: '', description: '', type: 'solo', start_date: '', end_date: '', venue: '', is_virtual: false, stream_url: '', ticket_price_zmw: '' };

export default function ManageExhibitions({ user }) {
  const [exhibitions, setExhibitions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');

  const load = () => {
    if (!user) return;
    firebaseClient.entities.Exhibition.filter({ organizer_email: user.email }).then(setExhibitions).catch(() => {});
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...form,
      ticket_price_zmw: parseFloat(form.ticket_price_zmw) || 0,
      organizer_email: user.email,
      organizer_name: user.full_name,
      cover_image: coverUrl,
    };
    if (editing) {
      await firebaseClient.entities.Exhibition.update(editing.id, data);
      toast.success('Exhibition updated!');
    } else {
      await firebaseClient.entities.Exhibition.create(data);
      toast.success('Exhibition created!');
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditing(null);
    setCoverUrl('');
    setLoading(false);
    load();
  };

  const handleEdit = (ex) => {
    setEditing(ex);
    setForm({ ...emptyForm, ...ex, ticket_price_zmw: ex.ticket_price_zmw?.toString() || '' });
    setCoverUrl(ex.cover_image || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exhibition?')) return;
    await firebaseClient.entities.Exhibition.delete(id);
    toast.success('Exhibition deleted');
    load();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await firebaseClient.integrations.Core.UploadFile({ file });
    setCoverUrl(file_url);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-playfair font-bold text-xl text-foreground">My Exhibitions</h2>
        <Button className="gold-gradient text-background font-semibold" size="sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }}>
          <Plus className="w-4 h-4 mr-1" /> Create Exhibition
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-playfair font-semibold text-foreground">{editing ? 'Edit Exhibition' : 'New Exhibition'}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-background border border-border text-foreground text-sm px-3 py-2 rounded-md">
                {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start Date *</label>
              <Input type="datetime-local" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
              <Input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Venue</label>
              <Input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Gallery, Theatre, Online..." className="bg-background border-border" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ticket Price (ZMW) — 0 for free</label>
              <Input type="number" value={form.ticket_price_zmw} onChange={e => setForm({ ...form, ticket_price_zmw: e.target.value })} className="bg-background border-border" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-background border-border h-20" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="virtual" checked={form.is_virtual} onChange={e => setForm({ ...form, is_virtual: e.target.checked })} className="accent-gold" />
            <label htmlFor="virtual" className="text-sm text-foreground">Virtual Event</label>
            {form.is_virtual && (
              <Input value={form.stream_url} onChange={e => setForm({ ...form, stream_url: e.target.value })} placeholder="Stream URL" className="bg-background border-border ml-2 text-sm flex-1" />
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Cover Image</label>
            <div className="flex gap-3 items-center">
              {coverUrl && <img src={coverUrl} alt="cover" className="w-16 h-16 rounded-md object-cover border border-border" />}
              <label className="flex items-center gap-2 cursor-pointer bg-secondary border border-border rounded-md px-4 py-2 text-sm text-muted-foreground hover:border-gold hover:text-gold transition-colors">
                <Upload className="w-4 h-4" /> Upload Cover
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          <Button type="submit" className="gold-gradient text-background font-semibold w-full" disabled={loading}>
            {loading ? 'Saving...' : editing ? 'Update' : 'Create Exhibition'}
          </Button>
        </form>
      )}

      {exhibitions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Theater className="w-10 h-10 mx-auto mb-2" />
          <p className="font-playfair text-xl mb-2">No exhibitions yet</p>
          <p className="text-sm">Create your first exhibition or event</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exhibitions.map(ex => (
            <div key={ex.id} className="bg-card border border-border rounded-lg p-4 flex gap-3 items-center">
              <img src={ex.cover_image || 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=100&h=100&fit=crop'} alt={ex.title} className="w-16 h-16 rounded-md object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-playfair font-semibold text-foreground">{ex.title}</h4>
                <p className="text-xs text-muted-foreground capitalize">{ex.type?.replace('_', ' ')} · {ex.status}</p>
                <p className="text-xs text-muted-foreground">{ex.start_date ? format(new Date(ex.start_date), 'MMM d, yyyy') : 'TBD'}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => handleEdit(ex)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" className="border-destructive/50 text-destructive text-xs" onClick={() => handleDelete(ex.id)}>
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