import React, { useState } from "react";
import { ArtworkService, authService } from "@/services";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Heart, Eye, Shield, Truck, ShoppingBag, ShoppingCart, Gavel, TrendingUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import QuickContactCard from "@/components/messaging/QuickContactCard";
import AuctionCountdown from "@/components/auction/AuctionCountdown";
import SocialShareButtons from "@/components/artwork/SocialShareButtons";
import WishlistButton from "@/components/artwork/WishlistButton";
import BidHistory from "@/components/auction/BidHistory";
import PlaceBidDialog from "@/components/auction/PlaceBidDialog";
import StickyActionBar from "@/components/ui/StickyActionBar";
import SmartImage from "@/components/ui/SmartImage";
import ArtworkLightbox from "@/components/ui/ArtworkLightbox";
import { useCart } from "@/lib/CartContext";
import { hapticMedium } from "@/utils/native";

const categoryLabels = {
  painting: "Painting", sculpture: "Sculpture", photography: "Photography",
  music: "Music", digital_art: "Digital Art", mixed_media: "Mixed Media",
  textile: "Textile", pottery: "Pottery",
};

const placeholderImages = [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1000&fit=crop",
];

export default function ArtworkDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [currentHighBid, setCurrentHighBid] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addItem, items: cartItems } = useCart();
  const inCart = cartItems.some((i) => i.id === id);

  const shouldOpenMessage = searchParams.get("open_messages") === "true";
  const [contactOpen, setContactOpen] = useState(shouldOpenMessage);

  const { data: artwork, isLoading } = useQuery({
    queryKey: ["artwork", id],
    queryFn: async () => {
      const art = await ArtworkService.get(id);
      if (art && await authService.isAuthenticated()) {
        httpsCallable(functions, 'trackBuyerInterest')({ artwork_id: art.id, action: 'view' }).catch(() => {});
      }
      return art;
    },
  });

  const trackInterest = (action) => {
    if (!artwork) return;
    authService.isAuthenticated().then(authed => {
      if (authed) {
        httpsCallable(functions, 'trackBuyerInterest')({ artwork_id: artwork.id, action }).catch(() => {});
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-2xl">Artwork not found</h2>
        <Link to="/explore" className="text-primary mt-4 inline-block font-body text-sm hover:underline">
          Back to gallery
        </Link>
      </div>
    );
  }

  const imageUrl = artwork.image_urls?.[0] || placeholderImages[0];
  const isAuction = artwork.status === "auction";
  const isAvailable = artwork.status === "available";
  const highBid = currentHighBid ?? artwork.current_bid ?? artwork.price ?? 0;

  const handleAddToCart = () => {
    hapticMedium();
    addItem(artwork);
    toast.success('Added to cart');
  };

  const renderAvailableActions = (barStyle) => {
    if (inCart) {
      return (
        <Link to="/cart" className={barStyle}>
          <Button size="lg" className="w-full rounded-full font-body gap-2 text-base bg-green-primary hover:bg-green-secondary">
            <Check className="w-5 h-5" /> View in Cart
          </Button>
        </Link>
      );
    }
    return (
      <div className={`${barStyle ? "flex gap-3" : "flex flex-col sm:flex-row gap-3"}`}>
        <Button size="lg" onClick={handleAddToCart} className="flex-1 rounded-full font-body gap-2 text-base">
          <ShoppingCart className="w-5 h-5" /> Add to Cart
        </Button>
        <Link to={`/checkout?quickBuy=${artwork.id}`} className="flex-1">
          <Button size="lg" variant="outline" className="w-full rounded-full font-body gap-2 text-base border-primary text-primary hover:bg-primary/5">
            <ShoppingBag className="w-5 h-5" /> Buy Now
          </Button>
        </Link>
      </div>
    );
  };

  const renderUnavailable = (barStyle) => (
    <Button size="lg" disabled className={`${barStyle} w-full rounded-full font-body text-base`}>
      {artwork.status === "sold" ? "Sold" : artwork.status === "reserved" ? "Reserved" : "Unavailable"}
    </Button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
        <ArrowLeft className="w-4 h-4" /> Back to gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <SmartImage
            src={imageUrl}
            alt={artwork.title}
            wrapperClassName="rounded-xl aspect-[3/4] w-full"
            eager
            onClick={() => setLightboxOpen(true)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3 font-body text-xs">
              {categoryLabels[artwork.category]}
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">{artwork.title}</h1>
            <p className="text-muted-foreground font-body mt-2">
              by <Link to="/rankings" className="text-primary hover:underline">{artwork.artist_name}</Link>
            </p>
          </div>

          <div className="text-3xl font-display font-bold text-primary">
            ZMW {artwork.price?.toLocaleString()}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {artwork.likes || 0} likes</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {artwork.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <WishlistButton artwork={artwork} variant="full" />
              <SocialShareButtons artwork={artwork} />
            </div>
          </div>

          {artwork.description && (
            <p className="text-muted-foreground font-body leading-relaxed">{artwork.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm font-body">
            {artwork.medium && <div><span className="text-muted-foreground">Medium:</span> <span className="font-medium">{artwork.medium}</span></div>}
            {artwork.dimensions && <div><span className="text-muted-foreground">Size:</span> <span className="font-medium">{artwork.dimensions}</span></div>}
            {artwork.year_created && <div><span className="text-muted-foreground">Year:</span> <span className="font-medium">{artwork.year_created}</span></div>}
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-body">
              <Shield className="w-4 h-4 text-primary" />
              <span>Pay on delivery — you only pay when the artwork arrives</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground font-body">
              <Truck className="w-4 h-4 text-primary" />
              <span>Delivery via Yango, courier, or pickup</span>
            </div>
          </div>

          {/* Auction panel */}
          {isAuction && (
            <div className="space-y-4 border border-gold/30 rounded-xl p-4 bg-gold/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Current Bid</p>
                  <p className="text-2xl font-playfair font-bold text-gold">
                    ZMW {highBid.toLocaleString()}
                  </p>
                </div>
                <Badge className="bg-gold/15 text-gold border-gold/30 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Live Auction
                </Badge>
              </div>

              {artwork.auction_end_date && (
                <AuctionCountdown endDate={artwork.auction_end_date} />
              )}

              <Button
                size="lg"
                className="w-full gold-gradient text-background font-semibold gap-2 text-base"
                onClick={() => { setBidDialogOpen(true); trackInterest('bid'); }}
              >
                <Gavel className="w-5 h-5" /> Place Bid
              </Button>

              <div>
                <h3 className="font-playfair font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-gold" /> Bid History
                </h3>
                <BidHistory artworkId={artwork.id} onTopBidChange={(val) => setCurrentHighBid(val)} />
              </div>
            </div>
          )}

          {/* Contact Artist - Quick Card */}
          <QuickContactCard
            artworkId={artwork.id}
            artworkTitle={artwork.title}
            artistEmail={artwork.artist_email}
            artistName={artwork.artist_name}
            onSuccess={() => trackInterest('message')}
            open={contactOpen}
            onOpenChange={setContactOpen}
          />

          {/* Desktop (in-flow) actions */}
          <div className="hidden lg:block">
            {isAvailable ? renderAvailableActions() : isAuction ? null : renderUnavailable()}
          </div>
        </motion.div>
      </div>

      {/* Mobile sticky action bar */}
      <StickyActionBar className="lg:hidden">
        <div className="flex items-center gap-3 p-4 max-w-7xl mx-auto">
          <div className="min-w-0 flex-shrink-0 mr-1">
            <p className="text-[11px] text-muted-foreground font-body leading-tight">
              {isAuction ? "Current Bid" : isAvailable ? "Price" : "Status"}
            </p>
            <p className={`font-display font-bold truncate ${isAuction ? "text-gold" : "text-primary"}`}>
              {isAuction ? `ZMW ${highBid.toLocaleString()}` : isAvailable ? `ZMW ${artwork.price?.toLocaleString()}` : artwork.status === "sold" ? "Sold" : artwork.status === "reserved" ? "Reserved" : "Unavailable"}
            </p>
          </div>
          <div className="flex-1">
            {isAvailable ? (
              renderAvailableActions(true)
            ) : isAuction ? (
              <Button
                size="lg"
                className="w-full gold-gradient text-background font-semibold gap-2 text-base rounded-full"
                onClick={() => { setBidDialogOpen(true); trackInterest('bid'); }}
              >
                <Gavel className="w-5 h-5" /> Place Bid
              </Button>
            ) : (
              renderUnavailable()
            )}
          </div>
        </div>
      </StickyActionBar>

      {artwork && (
        <PlaceBidDialog
          open={bidDialogOpen}
          onClose={() => setBidDialogOpen(false)}
          artwork={artwork}
          currentHighBid={highBid}
          onBidPlaced={(val) => setCurrentHighBid(val)}
        />
      )}

      <ArtworkLightbox
        open={lightboxOpen}
        src={imageUrl}
        alt={artwork.title}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
