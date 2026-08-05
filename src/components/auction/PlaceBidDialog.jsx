import { useState } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gavel, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function PlaceBidDialog({ open, onClose, artwork, currentHighBid, onBidPlaced }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);

  const minBid = (currentHighBid || artwork.price || 0) + 50;

  const handleBid = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < minBid) {
      toast.error(`Minimum bid is ZMW ${minBid.toLocaleString()}`);
      return;
    }
    setLoading(true);
    try {
      const response = await firebaseClient.functions.invoke('placeBid', { artwork_id: artwork.id, amount: val });
      setPlaced(true);
      toast.success("Bid placed!");
      onBidPlaced?.(response.data.currentHighBid);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.minimum 
        ? `Minimum bid is ZMW ${(error.response?.data?.minimum || minBid).toLocaleString()}`
        : "Failed to place bid. Please sign in.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPlaced(false);
    setAmount("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <Gavel className="w-5 h-5 text-gold" /> Place a Bid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Artwork summary */}
          <div className="flex gap-3 bg-secondary rounded-lg p-3">
            {artwork.image_urls?.[0] && (
              <img src={artwork.image_urls[0]} alt={artwork.title} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm text-foreground">{artwork.title}</p>
              <p className="text-xs text-muted-foreground">by {artwork.artist_name}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-gold" />
                <span className="text-xs text-gold font-semibold">
                  Current: ZMW {(currentHighBid || artwork.price || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {placed ? (
            <div className="text-center py-4">
              <Gavel className="w-10 h-10 text-gold mx-auto mb-2" />
              <h3 className="font-playfair font-bold text-lg mb-1">Bid Placed!</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your bid of <span className="text-gold font-bold">ZMW {parseFloat(amount).toLocaleString()}</span> is now active.
              </p>
              <p className="text-xs text-muted-foreground">You'll be notified if you're outbid or win.</p>
              <Button className="gold-gradient text-background w-full mt-4" onClick={handleClose}>Done</Button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Your Bid (ZMW) — minimum ZMW {minBid.toLocaleString()}</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`e.g. ${minBid.toLocaleString()}`}
                  className="text-lg font-bold"
                  min={minBid}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                By bidding you agree to purchase this artwork if you win. Payment on delivery.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                <Button className="flex-1 gold-gradient text-background font-semibold" onClick={handleBid} disabled={loading}>
                  <Gavel className="w-4 h-4 mr-2" />
                  {loading ? "Placing..." : "Place Bid"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}