import { useEffect, useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, User } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['painting', 'photography', 'sculpture', 'music', 'digital_art', 'crafts', 'performance'];

export default function ArtistProfile({ user }) {
  const [artist, setArtist] = useState(null);
  const [form, setForm] = useState({ display_name: '', bio: '', category: 'painting', location: '', social_links: {} });
  const [profileImg, setProfileImg] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    firebaseClient.entities.Artist.filter({ user_email: user.email }).then(results => {
      if (results.length > 0) {
        const a = results[0];
        setArtist(a);
        setForm({ display_name: a.display_name || '', bio: a.bio || '', category: a.category || 'painting', location: a.location || '', social_links: a.social_links || {} });
        setProfileImg(a.profile_image || '');
        setCoverImg(a.cover_image || '');
      } else {
        setForm(f => ({ ...f, display_name: user.full_name || '' }));
      }
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = { ...form, user_email: user.email, profile_image: profileImg, cover_image: coverImg };
    if (artist) {
      await firebaseClient.entities.Artist.update(artist.id, data);
      toast.success('Profile updated!');
    } else {
      const created = await firebaseClient.entities.Artist.create(data);
      setArtist(created);
      toast.success('Artist profile created!');
    }
    setLoading(false);
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { file_url } = await firebaseClient.integrations.Core.UploadFile({ file });
    if (type === 'profile') setProfileImg(file_url);
    else setCoverImg(file_url);
    setLoading(false);
    toast.success('Image uploaded!');
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-primary" />
        <h2 className="font-playfair font-bold text-xl text-foreground">Artist Profile</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Images */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Profile Photo</label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-secondary">
                {profileImg ? <img src={profileImg} alt="profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-muted-foreground m-5" />}
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-secondary border border-border rounded-md px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Upload className="w-4 h-4" /> Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'profile')} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Cover Image</label>
            <div className="flex items-center gap-3">
              {coverImg && <img src={coverImg} alt="cover" className="w-32 h-16 rounded-md object-cover border border-border" />}
              <label className="flex items-center gap-2 cursor-pointer bg-secondary border border-border rounded-md px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Upload className="w-4 h-4" /> Upload Cover
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'cover')} />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Display Name *</label>
            <Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} required className="bg-background border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Art Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-background border border-border text-foreground text-sm px-3 py-2 rounded-md">
              {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Location</label>
            <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Lusaka, Zambia" className="bg-background border-border" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
            <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell the world about your art..." className="bg-background border-border h-24" />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['instagram', 'facebook', 'twitter', 'youtube'].map(platform => (
              <div key={platform}>
                <label className="text-xs text-muted-foreground mb-1 block capitalize">{platform}</label>
                <Input
                  value={form.social_links?.[platform] || ''}
                  onChange={e => setForm({ ...form, social_links: { ...form.social_links, [platform]: e.target.value } })}
                  placeholder={`${platform}.com/yourhandle`}
                  className="bg-background border-border text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="green-gradient text-primary-foreground font-semibold" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : artist ? 'Update Profile' : 'Create Artist Profile'}
        </Button>
      </form>
    </div>
  );
}