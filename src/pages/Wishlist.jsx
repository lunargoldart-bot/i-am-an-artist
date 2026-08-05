import React from "react";
import { authService, WishlistService } from "@/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const categoryLabels = {
  painting: "Painting", sculpture: "Sculpture", photography: "Photography",
  music: "Music", digital_art: "Digital Art", mixed_media: "Mixed Media",
  textile: "Textile", pottery: "Pottery", fashion: "Fashion",
  graphic_design: "Graphic Design", film: "Film & Video", writing: "Writing",
  culinary: "Culinary", illustration: "Illustration", dance: "Dance", architecture: "Architecture",
};

export default function Wishlist() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getCurrentUser(),
  });

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.email],
    queryFn: () => WishlistService.filter({ user_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => WishlistService.del(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Bookmark className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
        <h2 className="font-playfair text-2xl font-bold mb-2">Sign in to view your wishlist</h2>
        <Button onClick={() => authService.redirectToLogin()} className="mt-4">Sign In</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-primary" />
          My Wishlist
        </h1>
        <p className="text-muted-foreground font-inter text-sm mt-1">
          {wishlistItems.length} saved artwork{wishlistItems.length !== 1 ? "s" : ""}
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-24">
          <Bookmark className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="font-playfair text-2xl font-semibold mb-2">No saved artworks yet</h3>
          <p className="text-muted-foreground font-inter text-sm mb-6">
            Tap the bookmark icon on any artwork to save it here.
          </p>
          <Link to="/explore">
            <Button className="rounded-full px-8">Explore Gallery</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <Link to={`/artwork/${item.artwork_id}`}>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted gallery-card-hover">
                  {item.artwork_image ? (
                    <img
                      src={item.artwork_image}
                      alt={item.artwork_title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Bookmark className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                    <Link to={`/artwork/${item.artwork_id}`}>
                      <Button className="w-full rounded-full gap-2 text-sm h-10">
                        <ShoppingBag className="w-4 h-4" /> View Artwork
                      </Button>
                    </Link>
                  </div>
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeMutation.mutate(item.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-destructive transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="mt-2 px-1">
                <p className="font-playfair font-semibold text-sm line-clamp-1">{item.artwork_title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{item.artist_name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-primary font-semibold text-sm">ZMW {item.price?.toLocaleString()}</span>
                  {item.category && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {categoryLabels[item.category] || item.category}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}