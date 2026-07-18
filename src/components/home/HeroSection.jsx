import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative bg-background py-16 px-4 sm:px-6 border-b border-primary/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Empowering Zambian Artists</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            I Am An
            <span className="block text-primary">Artist</span>
          </h1>

          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto mb-8">
            Zambia's premier platform for artists to showcase, sell, and thrive
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/explore">
              <Button size="lg" className="rounded-full px-8 gap-2">
                Start Exploring <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/sell">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Sell Your Art
              </Button>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-playfair font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground mt-1">Artists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-playfair font-bold text-primary">2K+</div>
              <div className="text-xs text-muted-foreground mt-1">Artworks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-playfair font-bold text-primary">100%</div>
              <div className="text-xs text-muted-foreground mt-1">Zambian</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}