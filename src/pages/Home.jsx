import React from "react";
import ZambianChangemakers from "@/components/home/ZambianChangemakers";
import AppFeatures from "@/components/home/AppFeatures";
import CategoryGallery from "@/components/home/CategoryGallery";
import CompetitivePricing from "@/components/home/CompetitivePricing";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen pb-20">
      <ZambianChangemakers />
      <AppFeatures />
      <CompetitivePricing />
      <CategoryGallery />

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="font-playfair text-4xl sm:text-5xl font-bold mb-4 text-foreground">
          Ready to join?
        </h2>
        <p className="text-primary/60 font-inter max-w-xl mx-auto mb-8">
          Discover, collect, and sell art from Zambia's finest creators
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/explore">
            <Button size="lg" className="rounded-lg px-8 gap-2 bg-primary hover:bg-primary/90">
              Explore <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/sell">
            <Button size="lg" variant="outline" className="rounded-lg px-8 border-primary/50 hover:border-primary">
              Start Selling
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}