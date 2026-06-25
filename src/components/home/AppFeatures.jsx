import React from "react";
import { motion } from "framer-motion";
import { Palette, Zap, Shield, Users, TrendingUp, Award } from "lucide-react";

const FEATURES = [
  {
    icon: Palette,
    title: "Discover Art",
    desc: "Swipe through curated artworks from Zambia's finest creators",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Quick Actions",
    desc: "Like, save, and purchase with intuitive mobile-first design",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Verified Artists",
    desc: "Every creator is verified for authenticity and quality",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Join Zambia's fastest-growing creative network",
    color: "from-purple-500 to-violet-500",
  },
];

export default function AppFeatures() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold mb-3 text-white">Why I Am An Artist?</h2>
          <p className="text-primary/60 font-inter">Everything you need to showcase, sell, and grow</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="group relative bg-card rounded-2xl border border-border p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-playfair font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm font-inter leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}