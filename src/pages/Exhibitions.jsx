import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, Radio } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ExhibitionService } from "@/services";

const typeLabels = {
  live_exhibition: "Live Exhibition",
  auction: "Auction",
  solo_show: "Solo Show",
  group_show: "Group Show",
  performance: "Performance",
  virtual: "Virtual",
};

const statusColors = {
  upcoming: "bg-primary/10 text-primary",
  live: "bg-green-100 text-green-700",
  ended: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function Exhibitions() {
  const [filter, setFilter] = useState("all");

  const { data: exhibitions = [], isLoading } = useQuery({
    queryKey: ["exhibitions"],
    queryFn: () => ExhibitionService.list("-start_date", 50),
    initialData: [],
  });

  const filtered = filter === "all" ? exhibitions : exhibitions.filter((e) => e.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Exhibitions & Events</h1>
        <p className="text-muted-foreground font-body mt-2">Live shows, auctions, solo performances & more</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-8">
        <TabsList>
          <TabsTrigger value="all" className="font-body">All</TabsTrigger>
          <TabsTrigger value="upcoming" className="font-body">Upcoming</TabsTrigger>
          <TabsTrigger value="live" className="font-body">Live Now</TabsTrigger>
          <TabsTrigger value="ended" className="font-body">Past</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="aspect-[16/10] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold">No exhibitions found</h3>
          <p className="text-muted-foreground font-body text-sm mt-2">Check back soon for upcoming events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((exh, i) => (
            <motion.div
              key={exh.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                {exh.cover_image ? (
                  <img src={exh.cover_image} alt={exh.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={statusColors[exh.status]}>{exh.status}</Badge>
                  <Badge variant="secondary" className="text-xs">{typeLabels[exh.type]}</Badge>
                </div>
                {exh.status === "live" && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 text-white animate-pulse flex items-center gap-1">
                      <Radio className="w-3 h-3" /> LIVE
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                  {exh.title}
                </h3>
                {exh.description && (
                  <p className="text-sm text-muted-foreground font-body line-clamp-2">{exh.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-body">
                  {exh.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(exh.start_date), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  )}
                  {exh.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {exh.location}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  {exh.entry_fee > 0 ? (
                    <span className="flex items-center gap-1 text-sm text-primary font-body font-semibold">
                      <Ticket className="w-4 h-4" /> ZMW {exh.entry_fee?.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-sm text-green-600 font-body font-medium">Free Entry</span>
                  )}
                  {exh.host_name && (
                    <span className="text-xs text-muted-foreground font-body">
                      by {exh.host_name}
                    </span>
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