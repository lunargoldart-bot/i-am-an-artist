import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import WishlistButton from "@/components/artwork/WishlistButton";

const categoryLabels = {
  painting: "Painting",
  sculpture: "Sculpture",
  photography: "Photography",
  music: "Music",
  digital_art: "Digital Art",
  mixed_media: "Mixed Media",
  textile: "Textile",
  pottery: "Pottery",
};

export default function ArtworkCard({ artwork, index = 0 }) {
  const placeholderImages = [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=700&fit=crop",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=700&fit=crop",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=700&fit=crop",
    "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=700&fit=crop",
  ];

  const imageUrl =
    artwork.image_urls?.[0] ||
    placeholderImages[index % placeholderImages.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/artwork/${artwork.id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg bg-muted aspect-[3/4]">
          <img
            src={imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs font-body">
              {categoryLabels[artwork.category] || artwork.category}
            </Badge>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {artwork.status === "sold" && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">Sold</Badge>
            )}
            <WishlistButton artwork={artwork} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-3 text-white/80 text-xs">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" /> {artwork.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {artwork.views || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="font-display font-medium text-sm leading-tight group-hover:text-primary transition-colors">
            {artwork.title}
          </h3>
          <p className="text-xs text-muted-foreground font-body">{artwork.artist_name}</p>
          <p className="text-sm font-semibold font-body text-primary">
            ZMW {artwork.price?.toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}