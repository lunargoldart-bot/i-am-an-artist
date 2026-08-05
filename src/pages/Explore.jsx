import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SwipeDeck from "@/components/explore/SwipeDeck";
import { ArtworkService } from "@/services";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "painting", label: "🎨 Paintings" },
  { value: "graphic_design", label: "✏️ Graphic Design" },
  { value: "photography", label: "📷 Photography" },
  { value: "film", label: "🎬 Film & Video" },
  { value: "music", label: "🎵 Music" },
  { value: "writing", label: "✍️ Writing" },
  { value: "culinary", label: "👨‍🍳 Culinary" },
  { value: "sculpture", label: "🗿 Sculpture" },
  { value: "digital_art", label: "💻 Digital Art" },
  { value: "fashion", label: "👗 Fashion" },
  { value: "dance", label: "💃 Dance" },
  { value: "pottery", label: "🏺 Pottery" },
  { value: "mixed_media", label: "🌀 Mixed Media" },
  { value: "textile", label: "🧵 Textiles" },
];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  // Read category from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) { setCategory(cat); }
  }, []);

  const { data: artworks = [], isLoading } = useQuery({
    queryKey: ["artworks-explore"],
    queryFn: () => ArtworkService.list("-created_date", 200),
  });

  const filtered = artworks
    .filter((a) => {
      const matchCat = category === "all" || a.category === category;
      const matchSearch = !search || 
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.created_date) - new Date(a.created_date);
      if (sort === "price_asc") return (a.price || 0) - (b.price || 0);
      if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
      if (sort === "popular") return (b.likes || 0) - (a.likes || 0);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-2">Explore</h1>
        <p className="text-muted-foreground font-inter text-sm">
          Discover art from every creative community in Zambia
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search artworks, artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              category === cat.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <SwipeDeck artworks={filtered} />
      )}
    </div>
  );
}