import { useState } from 'react';
import { firebaseClient } from '@/api/firebaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Gavel, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BidModal({ artwork, onClose }) {
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);

  const minBid = (artwork.current_bid_zmw || artwork.price_zmw || 0) + 50;

  const handleBid = async () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minBid) {
      toast.error(`Minimum bid is ZMW ${minBid.toLocaleString()}`);
      return;
    }
    setLoading(true);
    try {
      const user = await firebaseClient.auth.me();
      if (!user) { firebaseClient.auth.redirectToLogin(); return; }
      await firebaseClient.functions.invoke('placeBid', {
        artwork_id: artwork.id,
        amount,
      });
      setPlaced(true);
      toast.success('Bid placed successfully!');
    } catch {
      toast.error('Please sign in to place a bid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-gold" />
            <h2 className="font-playfair font-bold text-lg text-foreground">Place a Bid</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Artwork preview */}
          <div className="flex gap-3 bg-secondary rounded-lg p-3 mb-4">
            <img
              src={artwork.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'}
              alt={artwork.title}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div>
              <h3 className="font-playfair font-semibold text-foreground text-sm">{artwork.title}</h3>
              <p className="text-xs text-muted-foreground">{artwork.artist_name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-gold" />
                  Current: <span className="text-gold font-semibold ml-0.5">ZMW {(artwork.current_bid_zmw || artwork.price_zmw || 0).toLocaleString()}</span>
                </span>
              </div>
              {artwork.auction_end_date && (
                <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                  <Clock className="w-3 h-3 text-red-400" />
                  Ends: {format(new Date(artwork.auction_end_date), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
          </div>

          {placed ? (
            <div className="text-center py-4">
              <Gavel className="w-10 h-10 text-gold mx-auto mb-2" />
              <h3 className="font-playfair font-bold text-lg text-foreground mb-1">Bid Placed!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your bid of <span className="text-gold font-bold">ZMW {parseFloat(bidAmount).toLocaleString()}</span> is now active.
              </p>
              <p className="text-xs text-muted-foreground">You'll be notified if you're outbid or if you win.</p>
              <Button className="gold-gradient text-background w-full mt-4" onClick={onClose}>Done</Button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Your Bid (ZMW) — Minimum ZMW {minBid.toLocaleString()}</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  placeholder={`e.g. ${minBid.toLocaleString()}`}
                  className="bg-background border-border text-lg font-bold"
                  min={minBid}
                />
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                By bidding, you agree to purchase this artwork if you win. Payment on delivery.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Cancel</Button>
                <Button className="flex-1 gold-gradient text-background font-semibold" onClick={handleBid} disabled={loading}>
                  <Gavel className="w-4 h-4 mr-2" />
                  {loading ? 'Placing...' : 'Place Bid'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}