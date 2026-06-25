import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, Palette } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Palette,
    title: "Sell Your Art",
    desc: "List paintings, sculptures, photographs & more. Set your own prices in ZMW.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Audience",
    desc: "Get ranked, featured, and discovered by collectors across Zambia.",
  },
  {
    icon: Users,
    title: "Host Exhibitions",
    desc: "Create live shows, auctions, and solo exhibitions to showcase your work.",
  },
  {
    icon: DollarSign,
    title: "Earn Money",
    desc: "Pay-on-delivery ensures secure transactions. Artists get paid when buyers receive their art.",
  },
];

export default function MonetizationCTA() {
  return (
    <section className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Turn Your Art Into <span className="text-primary italic">Income</span>
          </h2>
          <p className="mt-4 text-background/60 font-body">
            Join hundreds of Zambian artists already making money through Zartia. Your creativity deserves to be rewarded.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <feat.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-background">{feat.title}</h3>
              <p className="mt-2 text-sm text-background/50 font-body leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/sell">
            <Button size="lg" className="rounded-full px-10 font-body">
              Start Earning Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}