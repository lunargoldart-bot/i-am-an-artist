import React, { useState } from "react";
import { UserService, ArtworkService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, TrendingUp, Crown, Award, Medal } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { value: "all", label: "All" },
  { value: "painting", label: "Painters" },
  { value: "sculpture", label: "Sculptors" },
  { value: "photography", label: "Photographers" },
  { value: "music", label: "Musicians" },
  { value: "digital_art", label: "Digital Artists" },
  { value: "fashion", label: "Fashion" },
];

const rankIcons = [Crown, Award, Medal];
const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

export default function Rankings() {
  const [category, setCategory] = useState("all");

  const { data: users = [] } = useQuery({
    queryKey: ["users-rankings"],
    queryFn: () => UserService.filter({ role: "artist" }, "-ranking_score", 50),
    initialData: [],
  });

  const { data: artworks = [] } = useQuery({
    queryKey: ["artworks-all"],
    queryFn: () => ArtworkService.list("-likes", 100),
    initialData: [],
  });

  // Build ranking from artworks if no user profiles exist
  const artistStats = {};
  artworks.forEach((art) => {
    const key = art.artist_email || art.artist_name;
    if (!artistStats[key]) {
      artistStats[key] = { name: art.artist_name, email: art.artist_email, category: art.category, works: 0, likes: 0, views: 0 };
    }
    artistStats[key].works++;
    artistStats[key].likes += art.likes || 0;
    artistStats[key].views += art.views || 0;
  });

  const rankings = Object.values(artistStats)
    .filter((a) => category === "all" || a.category === category)
    .sort((a, b) => b.likes - a.likes);

  const combined = users.length > 0 ? users.filter((u) => category === "all" || u.artist_category === category) : rankings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Artist Rankings</h1>
        </div>
        <p className="text-muted-foreground font-body">Zambia's top artists ranked by community engagement</p>
      </div>

      <Tabs value={category} onValueChange={setCategory} className="mb-8">
        <TabsList className="flex flex-wrap justify-center gap-1">
          {categories.map((c) => (
            <TabsTrigger key={c.value} value={c.value} className="font-body text-sm">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="max-w-3xl mx-auto space-y-3">
        {combined.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold">No artists ranked yet</h3>
            <p className="text-muted-foreground font-body text-sm mt-2">Artists are ranked based on their artworks and engagement</p>
          </div>
        ) : (
          combined.map((artist, i) => {
            const RankIcon = rankIcons[i] || TrendingUp;
            const rankColor = rankColors[i] || "text-muted-foreground";
            const isUserEntity = !!artist.full_name;
            const name = isUserEntity ? artist.full_name : artist.name;
            const score = isUserEntity ? artist.ranking_score : artist.likes;

            return (
              <motion.div
                key={artist.email || artist.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                  i < 3 ? "bg-primary/5 border-primary/20" : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-center w-10 h-10">
                  {i < 3 ? (
                    <RankIcon className={`w-6 h-6 ${rankColor}`} />
                  ) : (
                    <span className="text-lg font-display font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  )}
                </div>

                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {isUserEntity && artist.profile_image ? (
                    <img src={artist.profile_image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-muted-foreground">
                      {name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm truncate">{name}</h3>
                  <p className="text-xs text-muted-foreground font-body">
                    {isUserEntity ? artist.artist_category?.replace(/_/g, " ") : artist.category?.replace(/_/g, " ")}
                    {!isUserEntity && ` · ${artist.works} works`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-display font-bold text-primary">{score || 0}</p>
                  <p className="text-xs text-muted-foreground font-body">
                    {isUserEntity ? "score" : "likes"}
                  </p>
                </div>

                {isUserEntity && artist.is_verified && (
                  <Badge variant="secondary" className="text-xs font-body">Verified</Badge>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}