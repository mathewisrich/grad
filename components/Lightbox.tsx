"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientPhoto } from "@/lib/types";

type Props = {
  photo: ClientPhoto;
  index: number;
  total: number;
  isSelected: boolean;
  isDownloaded: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleSelect: () => void;
  onDownload: () => void;
};

export default function Lightbox({
  photo,
  index,
  total,
  isSelected,
  isDownloaded,
  onClose,
  onPrev,
  onNext,
  onToggleSelect,
  onDownload,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    setLoaded(false);
  }, [photo.full]);

  // touch gestures
  useEffect(() => {
    function onStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        t: Date.now(),
      };
    }
    function onEnd(e: TouchEvent) {
      const start = touchStart.current;
      if (!start) return;
      const end = e.changedTouches[0];
      const dx = end.clientX - start.x;
      const dy = end.clientY - start.y;
      const dt = Date.now() - start.t;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (dt < 500 && absX > 60 && absX > absY) {
        if (dx < 0) onNext();
        else onPrev();
      } else if (dt < 500 && dy > 90 && absY > absX) {
        onClose();
      }
      touchStart.current = null;
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [onPrev, onNext, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/97 backdrop-blur-md flex flex-col animate-fade-in">
      {/* top bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 text-sm border-b border-white/5">
        <div className="text-cream/60 text-xs uppercase tracking-widest tabular-nums">
          {index + 1} / {total}
        </div>
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-center">
          <span className="font-mono text-cream/80 text-xs sm:text-sm truncate">
            {photo.name}.jpg
          </span>
          {isDownloaded && (
            <span className="text-[10px] uppercase tracking-widest text-gold/80 border border-gold/40 rounded-full px-2 py-0.5">
              saved
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-cream/60 hover:text-gold transition text-3xl leading-none px-2"
        >
          ×
        </button>
      </div>

      {/* image area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-3 text-cream/40 text-xs uppercase tracking-widest">
              <span className="block w-2 h-2 bg-gold rounded-full animate-pulse" />
              Loading full size
            </div>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.full}
          alt={photo.name}
          onLoad={() => setLoaded(true)}
          draggable={false}
          className={`max-h-full max-w-full object-contain select-none img-fade ${
            loaded ? "loaded" : ""
          }`}
        />

        {index > 0 && (
          <button
            onClick={onPrev}
            aria-label="Previous picture"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/50 backdrop-blur hover:bg-gold hover:text-ink transition flex items-center justify-center text-2xl"
          >
            ‹
          </button>
        )}
        {index < total - 1 && (
          <button
            onClick={onNext}
            aria-label="Next picture"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/50 backdrop-blur hover:bg-gold hover:text-ink transition flex items-center justify-center text-2xl"
          >
            ›
          </button>
        )}
      </div>

      {/* bottom bar */}
      <div className="px-3 sm:px-6 py-4 flex flex-wrap gap-2 sm:gap-3 justify-center border-t border-white/5">
        <button
          onClick={onToggleSelect}
          className={`px-5 py-3 rounded-full font-bold uppercase tracking-wider text-xs sm:text-sm transition ${
            isSelected
              ? "bg-gold text-ink"
              : "border border-white/30 text-cream hover:border-gold hover:text-gold"
          }`}
        >
          {isSelected ? "✓ Selected" : "Select this"}
        </button>
        <button
          onClick={onDownload}
          className="px-5 py-3 rounded-full bg-cream text-ink font-bold uppercase tracking-wider text-xs sm:text-sm hover:brightness-95 transition"
        >
          Download this one
        </button>
        <p className="basis-full text-center text-[10px] uppercase tracking-widest text-cream/30 mt-1">
          Swipe / arrow keys to move · space to select · esc to close
        </p>
      </div>
    </div>
  );
}
