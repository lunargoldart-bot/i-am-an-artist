import React from "react";
import { TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function CompetitivePricing() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-card border-y border-primary/10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Best Commission Rates</span>
          </div>

          <h2 className="font-playfair text-3xl sm:text-4xl font-bold mb-4">
            10% Commission
            <span className="block text-primary">vs Galleries' 30-50%</span>
          </h2>

          <p className="text-muted-foreground font-inter text-lg max-w-2xl mx-auto mb-8">
            Keep more of what you earn. We charge significantly less than traditional galleries while providing the same professional marketplace, secure payments, and artist support.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-background rounded-lg p-6 border border-border"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mx-auto mb-3">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">I Am An Artist</h3>
              <p className="text-2xl font-bold text-primary">10%</p>
              <p className="text-xs text-muted-foreground mt-1">You keep 90%</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-background rounded-lg p-6 border border-destructive/20"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 mx-auto mb-3">
                <DollarSign className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Traditional Galleries</h3>
              <p className="text-2xl font-bold text-destructive">30-50%</p>
              <p className="text-xs text-muted-foreground mt-1">You keep 50-70%</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}