import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, Heart, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { NewsPostService } from "@/services";

const categoryLabels = {
  trending: "Trending",
  breaking: "Breaking",
  featured_artist: "Featured Artist",
  exhibition: "Exhibition",
  music: "Music",
  visual_arts: "Visual Arts",
  community: "Community",
};

export default function NewsFeed() {
  const [filter, setFilter] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: () => NewsPostService.list("-created_date", 50),
    initialData: [],
  });

  const filtered = filter === "all" ? posts : posts.filter((p) => p.category === filter);
  const breakingPost = posts.find((p) => p.is_breaking);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Art News</h1>
        <p className="text-muted-foreground font-body mt-2">What's happening in Zambia's art scene</p>
      </div>

      {breakingPost && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-xl bg-destructive/5 border border-destructive/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-destructive" />
            <Badge className="bg-destructive text-destructive-foreground">Breaking</Badge>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold">{breakingPost.title}</h2>
          <p className="text-muted-foreground font-body mt-2 line-clamp-2">{breakingPost.content}</p>
          {breakingPost.author_name && (
            <p className="text-xs text-muted-foreground font-body mt-3">By {breakingPost.author_name}</p>
          )}
        </motion.div>
      )}

      <Tabs value={filter} onValueChange={setFilter} className="mb-8">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all" className="font-body">All</TabsTrigger>
          <TabsTrigger value="trending" className="font-body">Trending</TabsTrigger>
          <TabsTrigger value="breaking" className="font-body">Breaking</TabsTrigger>
          <TabsTrigger value="featured_artist" className="font-body">Artists</TabsTrigger>
          <TabsTrigger value="music" className="font-body">Music</TabsTrigger>
          <TabsTrigger value="visual_arts" className="font-body">Visual Arts</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold">No stories yet</h3>
          <p className="text-muted-foreground font-body text-sm mt-2">Check back for the latest art news</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 sm:gap-6 p-4 sm:p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              {post.image_url && (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-body">
                    {categoryLabels[post.category] || post.category}
                  </Badge>
                  {post.is_breaking && (
                    <Badge className="bg-destructive text-destructive-foreground text-xs">Breaking</Badge>
                  )}
                </div>
                <h3 className="font-display text-base sm:text-lg font-semibold leading-tight">{post.title}</h3>
                <p className="text-sm text-muted-foreground font-body line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                  {post.author_name && <span>By {post.author_name}</span>}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(post.created_date), "MMM d")}
                  </span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes || 0}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views || 0}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}