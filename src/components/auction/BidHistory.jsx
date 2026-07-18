import { useEffect, useState } from "react";
import { firebaseClient } from "@/api/firebaseClient";
import { Gavel, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function BidHistory({ artworkId, topBid }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = async () => {
    const data = await firebaseClient.entities.Bid.filter({ artwork_id: artworkId }, "-created_date", 20);
    setBids(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBids();
    // Real-time subscription
    const unsubscribe = firebaseClient.entities.Bid.subscribe((event) => {
      if (event.data?.artwork_id === artworkId) {
        fetchBids();
      }
    }, { where: { artwork_id: artworkId }, orderBy: '-created_date', limit: 20 });
    return unsubscribe;
  }, [artworkId]);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-8 border border-border rounded-xl">
        <Gavel className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No bids yet — be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bids.map((bid, i) => {
        const isTop = i === 0;
        return (
          <div
            key={bid.id}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
              isTop
                ? "border-gold/40 bg-gold/5"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isTop ? "bg-gold text-background" : "bg-muted text-muted-foreground"}`}>
                {isTop ? <TrendingUp className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{bid.bidder_name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(bid.created_date), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${isTop ? "text-gold" : "text-foreground"}`}>
                ZMW {bid.amount?.toLocaleString()}
              </p>
              {isTop && <p className="text-xs text-gold">Leading</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}