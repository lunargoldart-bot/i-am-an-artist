import React, { useState } from "react";
import SwipeCard from "./SwipeCard";
import { Heart, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SwipeDeck({ artworks }) {
  const [stack, setStack] = useState(artworks);
  const [liked, setLiked] = useState([]);
  const [gone, setGone] = useState([]);

  const handleLike = () => {
    const top = stack[stack.length - 1];
    setLiked((prev) => [...prev, top]);
    setGone((prev) => [...prev, top]);
    setStack((prev) => prev.slice(0, -1));
  };

  const handlePass = () => {
    const top = stack[stack.length - 1];
    setGone((prev) => [...prev, top]);
    setStack((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    setStack(artworks);
    setLiked([]);
    setGone([]);
  };

  if (stack.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 px-6">
        <div className="text-7xl">ðŸŽ¨</div>
        <h3 className="font-playfair text-3xl font-bold text-foreground">You've seen it all!</h3>
        <p className="text-muted-foreground text-base">
          {liked.length} artwork{liked.length !== 1 ? "s" : ""} liked
        </p>
        <Button onClick={handleReset} variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10 h-11">
          <RotateCcw className="w-5 h-5" /> Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-4 px-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-green-500 fill-green-500" />
          <span className="font-semibold text-foreground">{liked.length} liked</span>
        </div>
        <span className="text-muted-foreground text-sm">{stack.length} remaining</span>
      </div>

      {/* Card stack */}
      <div className="relative w-full" style={{ height: 'min(500px, 70vh)', minHeight: '300px' }}>
        {stack.slice(-3).map((artwork, i) => {
          const isTop = i === Math.min(stack.length - 1, 2);
          const offset = (2 - i) * 6;
          return (
            <div
              key={artwork.id}
              className="absolute inset-0"
              style={{
                transform: `scale(${1 - (2 - i) * 0.03}) translateY(${offset}px)`,
                zIndex: i + 1,
              }}
            >
              <SwipeCard
                artwork={artwork}
                onLike={handleLike}
                onPass={handlePass}
                isTop={isTop}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}