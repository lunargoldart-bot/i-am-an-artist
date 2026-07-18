import { useState, useEffect } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { motion } from 'framer-motion';
import { Megaphone, Plus, Trash2, PauseCircle, PlayCircle, Crown, Eye, MousePointerClick, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import LipilaPaymentModal from './LipilaPaymentModal';

const TIER_LABEL = { pro: 'Pro', elite: 'Elite' };
const TIER_COLOR = { pro: 'text-sky-400 border-sky-400/25 bg-sky-400/10', elite: 'text-gold border-gold/25 bg-gold/10' };

export default function ManageAds() {
  const [user, setUser] = useState(null);
  const [ads, setAds] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payingAd, setPayingAd] = useState(null);
  const [form, setForm] = useState({ headline: '', tagline: '', image_url: '', cta_label: 'View Artwork', cta_link: '', start_date: '', end_date: '' });

  useEffect(() => {
    const init = async () => {
      const me = await firebaseClient.auth.me();
      setUser(me);
      if (!me || (me.subscription_tier !== 'pro' && me.subscription_tier !== 'elite')) { setLoading(false); return; }
      const [myAds, myArtworks] = await Promise.all([
        firebaseClient.entities.SponsoredAd.filter({ artist_email: me.email }, '-created_date'),
        firebaseClient.entities.Artwork.filter({ artist_email: me.email }),
      ]);
      setAds(myAds || []);
      setArtworks(myArtworks || []);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.headline || !form.image_url) { toast.error('Headline and image are required'); return; }
    setSubmitting(true);
    await firebaseClient.entities.SponsoredAd.create({
      ...form,
      artist_email: user.email,
      artist_name: user.full_name,
      tier: user.subscription_tier,
      status: 'paused',
      payment_status: 'unpaid',
      impressions: 0,
      clicks: 0,
    });
    toast.success('Ad created. Complete payment to activate it.');
    setShowForm(false);
    setForm({ headline: '', tagline: '', image_url: '', cta_label: 'View Artwork', cta_link: '', start_date: '', end_date: '' });
    const updated = await firebaseClient.entities.SponsoredAd.filter({ artist_email: user.email }, '-created_date');
    setAds(updated || []);
    setSubmitting(false);
  };

  const toggleStatus = async (ad) => {
    if (ad.payment_status !== 'paid') {
      toast.error('Complete payment before activating this ad.');
      setPayingAd(ad);
      return;
    }
    const next = ad.status === 'active' ? 'paused' : 'active';
    await firebaseClient.entities.SponsoredAd.update(ad.id, { status: next });
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: next } : a));
  };

  const deleteAd = async (id) => {
    await firebaseClient.entities.SponsoredAd.delete(id);
    setAds(prev => prev.filter(a => a.id !== id));
    toast.success('Ad removed');
  };

  const prefillFromArtwork = (artworkId) => {
    const art = artworks.find(a => a.id === artworkId);
    if (!art) return;
    setForm(f => ({
      ...f,
      headline: art.title,
      tagline: art.description?.slice(0, 100) || '',
      image_url: art.image_urls?.[0] || '',
      cta_link: `/artwork/${art.id}`,
    }));
  };

  if (loading) return <div className="animate-pulse h-48 rounded-2xl bg-muted" />;

  if (!user || (user.subscription_tier !== 'pro' && user.subscription_tier !== 'elite')) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Megaphone className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
        <h3 className="font-playfair font-bold text-lg text-foreground mb-2">Sponsored Ads</h3>
        <p className="text-muted-foreground text-sm mb-4">Upgrade to Pro ($80/mo) or Elite ($170/mo) to run sponsored ad campaigns and put your art in front of every collector on Zartia.</p>
        <div className="flex gap-3 justify-center">
          <Button size="sm" className="bg-sky-500 hover:bg-sky-400 text-white font-semibold">Upgrade to Pro — $80/mo</Button>
          <Button size="sm" className="gold-gradient text-background font-semibold"><Crown className="w-3.5 h-3.5 mr-1" />Elite — $170/mo</Button>
        </div>
      </div>
    );
  }

  const isElite = user.subscription_tier === 'elite';
  const activeAds = ads.filter(a => a.status === 'active');
  const totalImpressions = ads.reduce((s, a) => s + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.clicks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-gold" />
          <div>
            <h3 className="font-playfair font-bold text-xl text-foreground">Sponsored Ads</h3>
            <p className="text-xs text-muted-foreground">
              {isElite ? 'Elite — Priority top-of-feed placement' : 'Pro — Standard feed placement'}
              <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${TIER_COLOR[user.subscription_tier]}`}>
                {TIER_LABEL[user.subscription_tier]}
              </span>
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(s => !s)} size="sm" className="gold-gradient text-background font-semibold">
          <Plus className="w-3.5 h-3.5 mr-1" /> New Ad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Ads', value: activeAds.length, iconEl: <Megaphone className="w-4 h-4 text-gold mx-auto mb-1" /> },
          { label: 'Total Impressions', value: totalImpressions.toLocaleString(), iconEl: <Eye className="w-4 h-4 text-gold mx-auto mb-1" /> },
          { label: 'Total Clicks', value: totalClicks.toLocaleString(), iconEl: <MousePointerClick className="w-4 h-4 text-gold mx-auto mb-1" /> },
        ].map(({ label, value, iconEl }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            {iconEl}
            <p className="font-playfair font-bold text-2xl text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gold/20 bg-card p-6 space-y-4">
          <h4 className="font-playfair font-semibold text-foreground">Create New Ad</h4>

          {artworks.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Quick-fill from artwork</label>
              <select
                onChange={e => prefillFromArtwork(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select artwork to pre-fill…</option>
                {artworks.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Headline *</label>
              <Input value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="Captivating headline…" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Image URL *</label>
              <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://…" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block">Tagline</label>
              <Textarea value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Short supporting text…" rows={2} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">CTA Label</label>
              <Input value={form.cta_label} onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))} placeholder="View Artwork" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">CTA Link</label>
              <Input value={form.cta_link} onChange={e => setForm(f => ({ ...f, cta_link: e.target.value }))} placeholder="/artwork/…" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreate} disabled={submitting} className="gold-gradient text-background font-semibold">
              {submitting ? 'Launching…' : 'Launch Ad'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Ad List */}
      {ads.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No ads yet. Create your first sponsored ad to start reaching collectors.
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad, i) => (
            <motion.div key={ad.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-gold/20 transition-colors bg-card">
              {ad.image_url && <img src={ad.image_url} alt={ad.headline} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{ad.headline}</p>
                {ad.tagline && <p className="text-xs text-muted-foreground truncate">{ad.tagline}</p>}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{ad.impressions || 0}</span>
                  <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{ad.clicks || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ad.status === 'active' ? 'text-green-400 border-green-400/25 bg-green-400/10' : 'text-muted-foreground border-border bg-muted/30'}`}>
                  {ad.status}
                </span>
                {(ad.payment_status === 'unpaid' || ad.payment_status === 'failed' || !ad.payment_status) && (
                  <button onClick={() => setPayingAd(ad)} className="p-1.5 rounded-lg hover:bg-gold/10 text-gold transition-colors" title="Pay to activate">
                    <CreditCard className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => toggleStatus(ad)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  {ad.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteAd(ad.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    {payingAd && (
      <LipilaPaymentModal
        open={!!payingAd}
        ad={payingAd}
        onClose={() => setPayingAd(null)}
        onSuccess={async () => {
          const updated = await firebaseClient.entities.SponsoredAd.filter({ artist_email: user.email }, '-created_date');
          setAds(updated || []);
          toast.success('Payment initiated! Ad will activate once confirmed.');
        }}
      />
    )}
    </div>
  );
}