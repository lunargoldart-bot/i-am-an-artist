import React from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function WishlistButton({ artwork, variant = "icon", className }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist", user?.email],
    queryFn: () => base44.entities.Wishlist.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const saved = wishlistItems.find((w) => w.artwork_id === artwork?.id);

  const addMutation = useMutation({
    mutationFn: () =>
      base44.entities.Wishlist.create({
        user_email: user.email,
        artwork_id: artwork.id,
        artwork_title: artwork.title,
        artwork_image: artwork.image_urls?.[0] || "",
        artist_name: artwork.artist_name,
        price: artwork.price,
        category: artwork.category,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Added to wishlist");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => base44.entities.Wishlist.delete(saved.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    if (saved) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  const isPending = addMutation.isPending || removeMutation.isPending;

  if (variant === "full") {
    return (
      <Button
        variant={saved ? "default" : "outline"}
        onClick={handleClick}
        disabled={isPending}
        className={cn("gap-2", className)}
      >
        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        {saved ? "Saved" : "Save to Wishlist"}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "p-2 rounded-full transition-all",
        saved
          ? "bg-primary text-primary-foreground"
          : "bg-black/50 text-white hover:bg-primary hover:text-primary-foreground",
        className
      )}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </button>
  );
}