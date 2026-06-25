import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ArtworkCard from "../artwork/ArtworkCard";

export default function FeaturedArtworks({ artworks = [] }) {
  if (!artworks.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Featured Works</h2>
          <p className="text-muted-foreground font-body mt-2">Curated selections from top artists</p>
        </div>
        <Link to="/explore" className="hidden sm:flex items-center gap-1 text-sm font-body text-primary hover:underline">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {artworks.slice(0, 8).map((artwork, i) => (
          <ArtworkCard key={artwork.id} artwork={artwork} index={i} />
        ))}
      </div>
    </section>
  );
}