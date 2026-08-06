import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SCALE = 3;
const MIN_SCALE = 1;
const DOUBLE_TAP_MS = 280;
const CLOSE_SWIPE_PX = 110;

/**
 * ArtworkLightbox — native fullscreen image viewer.
 * - Double-tap to zoom (zooms toward the tap point)
 * - Pinch-to-zoom (two pointers)
 * - Pan while zoomed
 * - Mouse wheel zoom on desktop
 * - Swipe down to dismiss
 * - Esc / X / backdrop click to close
 */
export default function ArtworkLightbox({ open, src, alt = "", onClose }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [swipeY, setSwipeY] = useState(0);

  const imgRef = useRef(null);
  const pointers = useRef(new Map());
  const lastTapRef = useRef(0);
  const gestureRef = useRef(null);

  const reset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSwipeY(0);
    pointers.current.clear();
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(MAX_SCALE, s + 0.5));
      if (e.key === "-") setScale((s) => Math.max(MIN_SCALE, s - 0.5));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const clampOffset = (next, nextScale) => {
    if (!imgRef.current) return next;
    const rect = imgRef.current.getBoundingClientRect();
    const boundedW = Math.max(0, (rect.width * nextScale - rect.width) / 2);
    const boundedH = Math.max(0, (rect.height * nextScale - rect.height) / 2);
    return {
      x: Math.max(-boundedW, Math.min(boundedW, next.x)),
      y: Math.max(-boundedH, Math.min(boundedH, next.y)),
    };
  };

  const handlePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const first = pointers.current.size === 1;
    gestureRef.current = {
      startScale: scale,
      startOffset: offset,
      lastPinchDist: pointers.current.size === 2 ? dist(pointers.current) : 0,
      origin: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      panStart: first ? { x: e.clientX, y: e.clientY } : (gestureRef.current?.panStart || { x: e.clientX, y: e.clientY }),
      moved: false,
    };
    setDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!gestureRef.current) return;
    const g = gestureRef.current;
    const prev = pointers.current.get(e.pointerId);
    if (prev) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) g.moved = true;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Pinch zoom
    if (pointers.current.size === 2) {
      const d = dist(pointers.current);
      if (g.lastPinchDist > 0) {
        const ratio = d / g.lastPinchDist;
        const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, g.startScale * ratio));
        setScale(nextScale);
      }
      g.lastPinchDist = d;
      return;
    }

    // Pan while zoomed
    if (scale > 1) {
      const next = clampOffset(
        {
          x: g.startOffset.x + (e.clientX - g.panStart.x),
          y: g.startOffset.y + (e.clientY - g.panStart.y),
        },
        scale
      );
      setOffset(next);
      return;
    }

    // Vertical swipe to dismiss
    const dy = e.clientY - g.panStart.y;
    if (dy > 0) {
      setSwipeY(dy * 0.4);
    }
  };

  const handlePointerUp = (e) => {
    const g = gestureRef.current;
    pointers.current.delete(e.pointerId);

    if (pointers.current.size === 0) {
      // Double-tap detection
      const now = Date.now();
      if (!g?.moved && now - lastTapRef.current < DOUBLE_TAP_MS) {
        handleDoubleTap(g);
      } else {
        lastTapRef.current = now;
      }

      // Close-swipe
      if (scale === 1 && swipeY > CLOSE_SWIPE_PX) {
        onClose();
      } else {
        setSwipeY(0);
      }
      setDragging(false);
      gestureRef.current = null;
    } else if (pointers.current.size === 1) {
      // Lift one finger of a pinch — restart pan gesture from remaining pointer
      const remaining = [...pointers.current.values()][0];
      gestureRef.current = {
        startScale: scale,
        startOffset: offset,
        lastPinchDist: 0,
        origin: g?.origin || { x: 0, y: 0 },
        panStart: { x: remaining.x, y: remaining.y },
        moved: false,
      };
    }
  };

  const handleDoubleTap = (g) => {
    lastTapRef.current = 0;
    if (scale > 1) {
      reset();
      return;
    }
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const target = 2.5;
    const originX = (g?.origin.x || rect.width / 2) / rect.width;
    const originY = (g?.origin.y || rect.height / 2) / rect.height;
    const x = (originX - 0.5) * rect.width * (target - 1);
    const y = (originY - 0.5) * rect.height * (target - 1);
    setScale(target);
    setOffset({ x, y });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setScale((s) => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s + delta));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[80] bg-black/95 touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-4 right-4 z-10 h-11 w-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors sat-top"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Zoom controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/10 rounded-full p-1.5 sat-bottom">
          <button
            onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30"
            disabled={scale === 1}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-xs text-white/80 font-medium tabular-nums">{(scale * 100).toFixed(0)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(MAX_SCALE, s + 0.5))}
            className="h-10 w-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30"
            disabled={scale >= MAX_SCALE}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{ transform: `translateY(${swipeY}px)`, transition: "transform 0.25s ease" }}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            draggable={false}
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
              transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            className="rounded-lg"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function dist(pointers) {
  const [a, b] = [...pointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}
