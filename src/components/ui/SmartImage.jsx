import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * SmartImage — lazy, progressive image with shimmer placeholder and a smooth
 * blur-up reveal. Falls back to a subtle placeholder on error.
 *
 * Props:
 * - src, alt, className (applied to the <img>)
 * - wrapperClassName (applied to the outer div)
 * - eager: skip lazy-loading (default false)
 * - onClick: optional tap handler (e.g. open lightbox)
 * - priority: render immediately even above the fold
 */
export default function SmartImage({
  src,
  alt = "",
  className,
  wrapperClassName,
  eager = false,
  priority = false,
  onClick,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(eager || priority);
  const ref = useRef(null);

  useEffect(() => {
    if (eager || priority) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, priority]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn("relative overflow-hidden bg-muted", wrapperClassName, onClick && "cursor-zoom-in")}
    >
      {inView && src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? undefined : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-700 ease-out",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      ) : null}

      {/* Shimmer / placeholder while not yet loaded */}
      {(!loaded || !inView || failed) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 shimmer" aria-hidden="true" />
          <span className="text-3xl opacity-40 select-none" aria-hidden="true">🎨</span>
        </div>
      )}
    </div>
  );
}
