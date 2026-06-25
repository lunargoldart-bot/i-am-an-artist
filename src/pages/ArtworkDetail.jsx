import React, { useState, useEffect } from "react";
import { ArtworkService, OrderService, BuyerPreferenceService, authService } from "@/services";
import { functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, DollarSign, CheckCircle, Clock, Heart, Eye, Shield, Truck, ShoppingBag, Gavel, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ConversationThread from "@/components/messaging/ConversationThread";
import QuickContactCard from "@/components/messaging/QuickContactCard";
import NegotiationPanel from "@/components/messaging/NegotiationPanel";
import AuctionCountdown from "@/components/auction/AuctionCountdown";
import SocialShareButtons from "@/components/artwork/SocialShareButtons";
import WishlistButton from "@/components/artwork/WishlistButton";
import BidHistory from "@/components/auction/BidHistory";
import PlaceBidDialog from "@/components/auction/PlaceBidDialog";

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
  const queryClient = useQueryClient();
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [currentHighBid, setCurrentHighBid] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState("courier");
  const [orderForm, setOrderForm] = useState({
    delivery_address: "", delivery_phone: "", delivery_notes: "", buyer_name: "",
  });

  const { data: artwork, isLoading } = useQuery({
    queryKey: ["artwork", id],
    queryFn: async () => {
      const art = await ArtworkService.get(id);
      if (art) {
        const authed = await authService.isAuthenticated();
        if (authed) {
          const prefs = await BuyerPreferenceService.list();
          if (prefs.some(p => p.categories?.includes(art.category))) {
            httpsCallable(functions, 'trackBuyerInterest')({ artwork_id: art.id, action: 'view' }).catch(() => {});
          }
        }
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

  const orderMutation = useMutation({
    mutationFn: async (orderData) => {
      await OrderService.create(orderData);
      await ArtworkService.update(id, { status: "reserved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artwork", id] });
      setBuyDialogOpen(false);
      toast.success("Order placed! The artist will be notified. You pay on delivery.");
    },
  });

  const handleOrder = () => {
    const user = { email: "buyer@example.com" };
    orderMutation.mutate({
      artwork_id: id,
      artwork_title: artwork.title,
      buyer_email: artwork.created_by || "buyer@example.com",
      buyer_name: orderForm.buyer_name,
      seller_email: artwork.artist_email,
      seller_name: artwork.artist_name,
      amount: artwork.price,
      delivery_method: deliveryMethod,
      delivery_address: orderForm.delivery_address,
      delivery_phone: orderForm.delivery_phone,
      delivery_notes: orderForm.delivery_notes,
      status: "pending",
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
        <ArrowLeft className="w-4 h-4" /> Back to gallery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative overflow-hidden rounded-xl bg-muted aspect-[3/4]">
            <img src={imageUrl} alt={artwork.title} className="w-full h-full object-cover" />
          </div>
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
          {artwork.status === "auction" && (
            <div className="space-y-4 border border-gold/30 rounded-xl p-4 bg-gold/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Current Bid</p>
                  <p className="text-2xl font-playfair font-bold text-gold">
                    ZMW {(currentHighBid ?? artwork.current_bid ?? artwork.price ?? 0).toLocaleString()}
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
          />

          {artwork.status === "available" ? (
            <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full rounded-full font-body gap-2 text-base">
                  <ShoppingBag className="w-5 h-5" /> Purchase This Artwork
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Complete Your Order</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="p-3 bg-muted rounded-lg text-sm font-body">
                    <p className="font-medium">{artwork.title}</p>
                    <p className="text-primary font-semibold mt-1">ZMW {artwork.price?.toLocaleString()}</p>
                    <p className="text-muted-foreground text-xs mt-1">Pay on delivery</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-sm">Your Name</Label>
                    <Input value={orderForm.buyer_name} onChange={(e) => setOrderForm({...orderForm, buyer_name: e.target.value})} placeholder="Full name" className="font-body" required />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-sm">Delivery Method</Label>
                    <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="grid grid-cols-1 gap-2">
                      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === 'yango' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <RadioGroupItem value="yango" />
                        <div className="font-body text-sm"><p className="font-medium">Yango Delivery</p><p className="text-xs text-muted-foreground">Fast delivery via Yango</p></div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === 'courier' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <RadioGroupItem value="courier" />
                        <div className="font-body text-sm"><p className="font-medium">Contact a Courier</p><p className="text-xs text-muted-foreground">We'll connect you with a courier</p></div>
                      </label>
                      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${deliveryMethod === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <RadioGroupItem value="pickup" />
                        <div className="font-body text-sm"><p className="font-medium">Pickup</p><p className="text-xs text-muted-foreground">Collect from the artist</p></div>
                      </label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-sm">Delivery Address</Label>
                    <Input value={orderForm.delivery_address} onChange={(e) => setOrderForm({...orderForm, delivery_address: e.target.value})} placeholder="Your delivery address" className="font-body" required />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-sm">Phone Number</Label>
                    <Input value={orderForm.delivery_phone} onChange={(e) => setOrderForm({...orderForm, delivery_phone: e.target.value})} placeholder="+260..." className="font-body" required />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body text-sm">Notes (optional)</Label>
                    <Textarea value={orderForm.delivery_notes} onChange={(e) => setOrderForm({...orderForm, delivery_notes: e.target.value})} placeholder="Special instructions..." className="font-body" rows={2} />
                  </div>

                  <Button onClick={handleOrder} disabled={orderMutation.isPending} className="w-full rounded-full font-body">
                    {orderMutation.isPending ? "Placing Order..." : "Place Order — Pay on Delivery"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button size="lg" disabled className="w-full rounded-full font-body text-base">
              {artwork.status === "sold" ? "Sold" : artwork.status === "reserved" ? "Reserved" : "Unavailable"}
            </Button>
          )}
        </motion.div>
      </div>

      {artwork && (
        <PlaceBidDialog
          open={bidDialogOpen}
          onClose={() => setBidDialogOpen(false)}
          artwork={artwork}
          currentHighBid={currentHighBid ?? artwork.current_bid}
          onBidPlaced={(val) => setCurrentHighBid(val)}
        />
      )}
    </div>
  );
}