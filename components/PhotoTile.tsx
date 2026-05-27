"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { ClientPhoto } from "@/lib/types";

type Props = {
  photo: ClientPhoto;
  index: number;
  selected: boolean;
  downloaded: boolean;
  hydrated: boolean;
  onOpen: () => void;
  onToggle: () => void;
};

function PhotoTile({
  photo,
  index,
  selected,
  downloaded,
  hydrated,
  onOpen,
  onToggle,
}: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // If the browser already had the image cached, React's onLoad event can fire
  // before our handler is attached. Check the img's `complete` flag on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  // Use 3:2 (typical DSLR ratio) until we know the real one
  const aspect =
    photo.width && photo.height ? `${photo.width} / ${photo.height}` : "3 / 2";

  return (
    <div
      className={`relative group overflow-hidden rounded-xl bg-white/[0.03] transition ring-offset-2 ring-offset-[#0c081e] ${
        selected ? "ring-2 ring-pink-500 shadow-lg shadow-pink-500/20" : "ring-0"
      }`}
      style={{ aspectRatio: aspect }}
    >
      {!loaded && <div className="skeleton absolute inset-0 rounded-xl" />}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={photo.thumb}
        alt={photo.name}
        loading={index < 12 ? "eager" : "lazy"}
        decoding="async"
        onClick={onOpen}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04] ${
          loaded ? "opacity-100" : "opacity-0"
        } cursor-zoom-in`}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {hydrated && (
        <button
          aria-label={selected ? "Unselect" : "Select"}
          aria-pressed={selected}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`pick-check ${selected ? "on" : ""}`}
        >
          {selected ? "✓" : ""}
        </button>
      )}

      {hydrated && downloaded && (
        <div className="absolute bottom-2 right-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-cyan-950/80 backdrop-blur text-cyan-300 border border-cyan-500/30 font-bold">
          ✓ saved
        </div>
      )}
    </div>
  );
}

export default memo(PhotoTile);
