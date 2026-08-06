import React from "react";
import { cn } from "@/lib/utils";

/**
 * StickyActionBar — a native-style bottom action bar.
 * Uses `sticky bottom-0` inside a tall parent so it stays pinned to the
 * bottom of the viewport while scrolling, without overlapping the footer.
 *
 * Props:
 * - `children`: bar content (buttons, totals, etc.)
 * - `className`: extra classes
 * - `elevated`: add shadow + stronger blur (default true)
 * - `noBlur`: disable backdrop blur
 */
export default function StickyActionBar({ children, className, elevated = true }) {
  return (
    <div
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className={cn(
        "sticky bottom-0 z-30 border-t border-border/80 bg-background/90",
        elevated && "shadow-[0_-8px_30px_rgba(0,0,0,0.25)]",
        "backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}
