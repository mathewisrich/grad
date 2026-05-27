"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientPhoto } from "@/lib/types";

type Props = {
  photo: ClientPhoto;
  index: number;
  total: number;
  isSelected: boolean;
  isDownloaded: boolean;
  startInSlideshow?: boolean;
  /** Neighboring photos (next/prev) to preload in the background */
  preloadUrls?: string[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleSelect: () => void;
  onDownload: () => void;
};

type Speed = "slow" | "normal" | "fast";
const SPEED_MS: Record<Speed, number> = {
  slow: 6000,
  normal: 3500,
  fast: 1800,
};

const COOKING_LINES = [
  "Sit down and let me cook... 🍳",
  "Cooking your picture, chef vibes 👨🏾‍🍳",
  "Hold up, plating it real nice 🍽️",
  "Patience boss, this one's seasoned 🧂",
  "Still cooking... must be a big one 🔥",
  "Almost ready, looking crispy 🥘",
];

export default function Lightbox({
  photo,
  index,
  total,
  isSelected,
  isDownloaded,
  startInSlideshow = false,
  preloadUrls = [],
  onClose,
  onPrev,
  onNext,
  onToggleSelect,
  onDownload,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(startInSlideshow);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [cookingLine, setCookingLine] = useState(COOKING_LINES[0]);
  const fullImgRef = useRef<HTMLImageElement | null>(null);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  // If the full image is already cached, the onLoad event might fire before
  // React attaches the handler. Check `complete` after mount/photo change.
  useEffect(() => {
    setLoaded(false);
    const id = requestAnimationFrame(() => {
      const img = fullImgRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        setLoaded(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [photo.full]);

  // Rotate the funny loading line every 1.6s while the image is loading
  useEffect(() => {
    if (loaded) return;
    setCookingLine(COOKING_LINES[0]);
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % COOKING_LINES.length;
      setCookingLine(COOKING_LINES[i]);
    }, 1600);
    return () => clearInterval(id);
  }, [loaded, photo.full]);

  // Preload neighboring full-size images in the background so navigation
  // is instant. Browsers cache them, so when the user hits next/prev the
  // image is already in memory.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const preloaders: HTMLImageElement[] = [];
    for (const url of preloadUrls) {
      const img = new window.Image();
      img.src = url;
      preloaders.push(img);
    }
    return () => {
      // Allow GC
      preloaders.length = 0;
    };
  }, [preloadUrls]);

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  // slideshow auto-advance — only ticks after image has loaded
  useEffect(() => {
    if (!playing || !loaded) return;
    const id = setTimeout(() => {
      if (index >= total - 1) {
        // loop back to start
        for (let i = 0; i < index; i++) onPrev();
      } else {
        onNext();
      }
    }, SPEED_MS[speed]);
    return () => clearTimeout(id);
  }, [playing, loaded, index, total, speed, onNext, onPrev]);

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
        setPlaying(false); // pause on manual swipe
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
    <div
      className="fixed inset-0 z-50 bg-black/97 backdrop-blur-md flex flex-col animate-fade-in"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        touchAction: "pan-y",
      }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 text-sm border-b border-white/5 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-cream/60 text-[10px] sm:text-xs uppercase tracking-widest tabular-nums font-bold">
            {index + 1} / {total}
          </div>
          {playing && (
            <span className="text-[10px] uppercase tracking-widest text-pink-400 border border-pink-500/40 bg-pink-950/30 rounded-full px-2 py-0.5 font-bold flex items-center gap-1">
              <span className="block w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />
              <span className="hidden xs:inline">Slidih show</span>
              <span className="xs:hidden">Live</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-center">
          <span className="font-mono text-white/80 text-[11px] sm:text-sm truncate">
            {photo.name}.jpg
          </span>
          {isDownloaded && (
            <span className="hidden xs:inline text-[10px] uppercase tracking-widest text-yellow-400 border border-yellow-500/40 bg-yellow-950/30 rounded-full px-2 py-0.5 font-bold">
              saved
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-cream/60 hover:text-pink-400 transition text-3xl leading-none h-10 w-10 flex items-center justify-center -mr-1"
        >
          ×
        </button>
      </div>

      {/* progress bar for slideshow */}
      {playing && (
        <div className="h-0.5 w-full bg-white/5">
          <div
            key={`${index}-${photo.full}-${speed}`}
            className="h-full bg-gradient-to-r from-pink-500 to-yellow-400"
            style={{
              animation: loaded
                ? `slideshow-progress ${SPEED_MS[speed]}ms linear forwards`
                : "none",
            }}
          />
        </div>
      )}

      {/* image area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Thumb shown immediately, scaled up + blurred, as a placeholder while full loads */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.thumb}
          alt=""
          aria-hidden
          draggable={false}
          className={`absolute max-h-full max-w-full object-contain select-none transition-opacity duration-500 ${
            loaded ? "opacity-0" : "opacity-100 blur-md scale-105"
          }`}
        />

        {!loaded && (
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center pointer-events-none gap-2 z-10">
            <div className="flex items-center gap-2">
              <span className="block w-2 h-2 bg-pink-500 rounded-full animate-ping" />
              <span className="block w-2 h-2 bg-yellow-400 rounded-full animate-ping [animation-delay:0.2s]" />
              <span className="block w-2 h-2 bg-pink-500 rounded-full animate-ping [animation-delay:0.4s]" />
            </div>
            <p className="text-sm font-extrabold text-gradient-sunset text-center px-6 animate-pulse bg-black/60 rounded-full py-1.5 px-4 backdrop-blur">
              {cookingLine}
            </p>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={fullImgRef}
          src={photo.full}
          alt={photo.name}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          draggable={false}
          className={`relative max-h-full max-w-full object-contain select-none transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {index > 0 && (
          <button
            onClick={() => {
              setPlaying(false);
              onPrev();
            }}
            aria-label="Previous picture"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/60 backdrop-blur hover:bg-pink-500 hover:text-white transition flex items-center justify-center text-2xl border border-white/5"
          >
            ‹
          </button>
        )}
        {index < total - 1 && (
          <button
            onClick={() => {
              setPlaying(false);
              onNext();
            }}
            aria-label="Next picture"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/60 backdrop-blur hover:bg-pink-500 hover:text-white transition flex items-center justify-center text-2xl border border-white/5"
          >
            ›
          </button>
        )}
      </div>

      {/* bottom bar */}
      <div className="px-2 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-1.5 sm:gap-3 justify-center items-center border-t border-white/5 bg-black/60 backdrop-blur-md">
        {/* Play / Pause */}
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          className={`px-3 sm:px-5 py-2 sm:py-3 rounded-full font-extrabold uppercase tracking-wider text-[11px] sm:text-sm transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
            playing
              ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-black shadow-lg shadow-pink-500/30"
              : "border border-pink-500/40 text-pink-300 hover:border-pink-400 hover:text-white bg-pink-950/20"
          }`}
        >
          {playing ? (
            <>
              <span className="text-base leading-none">⏸</span> Pause
            </>
          ) : (
            <>
              <span className="text-base leading-none">▶</span>
              <span className="hidden xs:inline">Slidih show</span>
              <span className="xs:hidden">Play</span>
            </>
          )}
        </button>

        {/* Speed selector */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          {(["slow", "normal", "fast"] as Speed[]).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold rounded-full transition ${
                speed === s
                  ? "bg-yellow-400 text-black"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleSelect}
          className={`px-3 sm:px-5 py-2 sm:py-3 rounded-full font-extrabold uppercase tracking-wider text-[11px] sm:text-sm transition-all duration-300 ${
            isSelected
              ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-black shadow-lg shadow-pink-500/30 scale-[1.02]"
              : "border border-yellow-500/30 text-yellow-200 hover:border-yellow-400 hover:text-white bg-yellow-950/20"
          }`}
        >
          {isSelected ? "✓ Selected" : "Select"}
        </button>
        <button
          onClick={onDownload}
          className="px-3 sm:px-5 py-2 sm:py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-extrabold uppercase tracking-wider text-[11px] sm:text-sm hover:brightness-105 transition-all duration-300 shadow-lg shadow-yellow-500/10 scale-[1.02]"
        >
          Download
        </button>
        <p className="hidden sm:block basis-full text-center text-[10px] uppercase tracking-widest text-white/30 mt-1">
          Swipe / arrows · space = select · P = play/pause · esc = close
        </p>
        <p className="sm:hidden basis-full text-center text-[10px] uppercase tracking-widest text-white/30 mt-0.5">
          Swipe · tap × to close
        </p>
      </div>

      <style jsx>{`
        @keyframes slideshow-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
