import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Heart, X, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SWIPE_THRESHOLD = 120;

export default function SwipeCard({ artwork, onLike, onPass, isTop }) {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -30], [1, 0]);
  const controls = useAnimation();

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    if (offset > SWIPE_THRESHOLD) {
      controls.start({ x: 600, opacity: 0, transition: { duration: 0.3 } }).then(onLike);
    } else if (offset < -SWIPE_THRESHOLD) {
      controls.start({ x: -600, opacity: 0, transition: { duration: 0.3 } }).then(onPass);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300 } });
    }
  };

  const swipeRight = () =>
    controls.start({ x: 600, opacity: 0, transition: { duration: 0.3 } }).then(onLike);
  const swipeLeft = () =>
    controls.start({ x: -600, opacity: 0, transition: { duration: 0.3 } }).then(onPass);

  const imageUrl =
    artwork.image_urls?.[0] ||
    `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=800&fit=crop`;

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ x, rotate }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
    >
      {/* Like/Pass indicators */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-20 rotate-[-15deg] border-4 border-green-500 text-green-500 font-black text-4xl px-6 py-2 rounded-xl bg-white/20 backdrop-blur-sm"
      >
        LIKE
      </motion.div>
      <motion.div
        style={{ opacity: passOpacity }}
        className="absolute top-6 right-6 z-20 rotate-[15deg] border-4 border-red-500 text-red-500 font-black text-4xl px-6 py-2 rounded-xl bg-white/20 backdrop-blur-sm"
      >
        NOPE
      </motion.div>

      {/* Card */}
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-card">
        <img src={imageUrl} alt={artwork.title} className="w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-24">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
              {artwork.category?.replace('_', ' ')}
            </span>
          </div>
          <h2 className="font-playfair font-bold text-white text-3xl leading-tight mb-2">
            {artwork.title}
          </h2>
          <p className="text-white/90 text-base mb-3">by {artwork.artist_name}</p>
          <div className="flex items-center justify-between">
            <span className="text-gold font-bold text-2xl">ZMW {artwork.price?.toLocaleString()}</span>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 gap-2"
              onClick={(e) => { e.stopPropagation(); navigate(`/artwork/${artwork.id}`); }}
            >
              <Eye className="w-4 h-4" /> View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Action buttons - Tinder style */}
      {isTop && (
        <div className="absolute -bottom-24 left-0 right-0 flex justify-center items-center gap-4 z-30">
          <button
            onClick={swipeLeft}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-200"
          >
            <X className="w-6 h-6 text-white" strokeWidth={3} />
          </button>
          <button
            onClick={() => navigate(`/artwork/${artwork.id}`)}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-200"
          >
            <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>
          <button
            onClick={swipeRight}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-200"
          >
            <Heart className="w-6 h-6 text-white" strokeWidth={3} fill="white" />
          </button>
        </div>
      )}
    </motion.div>
  );
}