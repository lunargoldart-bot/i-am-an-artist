import { Heart, Eye, Gavel, ShoppingBag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SmartImage from '@/components/ui/SmartImage';
import { Link } from 'react-router-dom';

const categoryColors = {
  painting: 'bg-amber-500/20 text-amber-400',
  sculpture: 'bg-stone-500/20 text-stone-300',
  music: 'bg-purple-500/20 text-purple-400',
  photography: 'bg-blue-500/20 text-blue-400',
  digital_art: 'bg-cyan-500/20 text-cyan-400',
  crafts: 'bg-green-500/20 text-green-400',
  performance: 'bg-pink-500/20 text-pink-400',
};

export default function ArtworkCard({ artwork, onBuy, onBid }) {
  const image = artwork.images?.[0] || `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop`;

  return (
    <div className="gallery-card-hover bg-card border border-border rounded-lg overflow-hidden group">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <SmartImage
          src={image}
          alt={artwork.title}
          wrapperClassName="absolute inset-0"
          className="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Overlay actions */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          {artwork.is_auction ? (
            <Button className="w-full green-gradient text-primary-foreground font-semibold h-10" onClick={() => onBid?.(artwork)}>
              <Gavel className="w-4 h-4 mr-2" /> Place Bid
            </Button>
          ) : (
            <Button className="w-full green-gradient text-primary-foreground font-semibold h-10" onClick={() => onBuy?.(artwork)}>
              <ShoppingBag className="w-4 h-4 mr-2" /> Purchase
            </Button>
          )}
        </div>

        {/* Status badge */}
        {artwork.status === 'sold' && (
          <div className="absolute top-2 right-2 bg-destructive/90 text-white text-xs font-semibold px-2 py-0.5 rounded">SOLD</div>
        )}
        {artwork.is_auction && artwork.status !== 'sold' && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1">
            <Gavel className="w-2.5 h-2.5" /> AUCTION
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-playfair font-semibold text-foreground text-sm leading-tight line-clamp-1">{artwork.title}</h3>
          <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${categoryColors[artwork.category] || 'bg-muted text-muted-foreground'}`}>
            {artwork.category?.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{artwork.artist_name}</p>
        
        <div className="flex items-center justify-between">
          <div>
            {artwork.is_auction ? (
              <div>
                <span className="text-xs text-muted-foreground">Current Bid</span>
                <p className="text-primary font-semibold text-sm">ZMW {(artwork.current_bid_zmw || artwork.price_zmw || 0).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-primary font-semibold text-sm">ZMW {(artwork.price_zmw || 0).toLocaleString()}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex items-center gap-0.5 text-xs">
              <Heart className="w-3 h-3" /> {artwork.likes_count || 0}
            </span>
            <span className="flex items-center gap-0.5 text-xs">
              <Eye className="w-3 h-3" /> {artwork.views_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}