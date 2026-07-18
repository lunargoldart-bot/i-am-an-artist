import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const CHANGEMAKERS = [
  {
    name: "Dr. Nkonde Mwamba",
    title: "Education Innovator",
    impact: "Founded 50+ rural schools across Zambia, providing education to 15,000+ children",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    icon: Star,
  },
];

export default function ZambianChangemakers() {
  return (
    <section className="relative bg-background border-b border-primary/20 py-16 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url('https://media.firebaseClient.com/images/public/69fc831faa42f7d02c44d368/3eb28bae6_generated_image.png')"}} />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-primary/80 font-semibold text-xs uppercase tracking-widest">This Week's Feature</span>
          </div>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold mb-3 text-white">
            Featured Artists
          </h2>
          <p className="text-primary/70 font-inter text-base max-w-2xl mx-auto">
            Meet the visionary creators reshaping Zambia's cultural landscape
          </p>
        </motion.div>

        {/* Cards */}
        <div className="flex justify-center">
          {CHANGEMAKERS.map((maker, idx) => (
            <motion.div
              key={maker.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="group relative bg-card/50 rounded-lg border border-primary/30 overflow-hidden hover:border-primary/60 transition-all duration-300 w-full max-w-md"
            >
              {/* Image */}
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={maker.image}
                  alt={maker.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Icon badge */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                  <maker.icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-playfair font-bold text-white text-xl mb-1">
                  {maker.name}
                </h3>
                <p className="text-primary/90 text-sm font-semibold mb-3">{maker.title}</p>
                <p className="text-white/80 text-sm font-inter leading-relaxed">
                  {maker.impact}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}