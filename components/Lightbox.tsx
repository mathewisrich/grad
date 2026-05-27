"use client";

import { useEffect, useState } from "react";
import type { ClientPhoto } from "./Gallery";

type Props = {
  photo: ClientPhoto;
  index: number;
  total: number;
  isSelected: boolean;
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
  onClose,
  onPrev,
  onNext,
  onToggleSelect,
  onDownload,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    setLoaded(false);
  }, [photo.full]);

  // swipe gestures for phone
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    function onStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
    function onEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) onNext();
        else onPrev();
      } else if (dy > 100 && Math.abs(dy) > Math.abs(dx)) {
        onClose();
      }
    }
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [onPrev, onNext, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 text-sm">
        <span className="text-cream/60">
          {index + 1} / {total}
        </span>
        <span className="font-mono text-cream/80 truncate">{photo.name}</span>
        <button
          onClick={onClose}
          className="text-cream/60 hover:text-gold transition text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-cream/40 text-sm uppercase tracking-widest animate-pulse">
              Loading full-size...
            </div>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.full}
          alt={photo.name}
          onLoad={() => setLoaded(true)}
          className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {index > 0 && (
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-gold hover:text-ink transition items-center justify-center text-2xl"
          >
            ‹
          </button>
        )}
        {index < total - 1 && (
          <button
            onClick={onNext}
            aria-label="Next"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-gold hover:text-ink transition items-center justify-center text-2xl"
          >
            ›
          </button>
        )}
      </div>

      <div className="px-4 sm:px-6 py-4 flex flex-wrap gap-2 sm:gap-3 justify-center border-t border-white/10">
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
          className="px-5 py-3 rounded-full bg-white text-ink font-bold uppercase tracking-wider text-xs sm:text-sm hover:brightness-95 transition"
        >
          Download this one
        </button>
      </div>
    </div>
  );
}
