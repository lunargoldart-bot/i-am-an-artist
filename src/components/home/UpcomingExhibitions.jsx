import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";

const typeLabels = {
  live_exhibition: "Live Exhibition",
  auction: "Auction",
  solo_show: "Solo Show",
  group_show: "Group Show",
  performance: "Performance",
  virtual: "Virtual",
};

export default function UpcomingExhibitions({ exhibitions = [] }) {
  if (!exhibitions.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold">Exhibitions & Events</h2>
          <p className="text-muted-foreground font-body mt-2">Live shows, auctions & performances</p>
        </div>
        <Link to="/exhibitions" className="hidden sm:flex items-center gap-1 text-sm font-body text-primary hover:underline">
          All events <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exhibitions.slice(0, 3).map((exh, i) => (
          <motion.div
            key={exh.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={`/exhibitions`} className="group block">
              <div className="relative overflow-hidden rounded-xl aspect-[16/10] bg-muted">
                {exh.cover_image ? (
                  <img src={exh.cover_image} alt={exh.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-primary/30" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    {typeLabels[exh.type] || exh.type}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                  {exh.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                  {exh.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(exh.start_date), "MMM d, yyyy")}
                    </span>
                  )}
                  {exh.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {exh.location}
                    </span>
                  )}
                </div>
                {exh.entry_fee > 0 && (
                  <span className="flex items-center gap-1 text-xs text-primary font-body font-medium">
                    <Ticket className="w-3 h-3" />
                    ZMW {exh.entry_fee?.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}