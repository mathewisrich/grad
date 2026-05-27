"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Lightbox from "./Lightbox";
import { downloadSingle, downloadZip } from "@/lib/download";

export type ClientPhoto = {
  name: string;
  full: string;
  thumb: string;
  width?: number;
  height?: number;
};

export default function Gallery({ photos }: { photos: ClientPhoto[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<{
    label: string;
    done: number;
    total: number;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);

  const toggle = useCallback((name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const selectAll = () => setSelected(new Set(photos.map((p) => p.name)));
  const clearAll = () => setSelected(new Set());

  const selectedPhotos = useMemo(
    () => photos.filter((p) => selected.has(p.name)),
    [photos, selected]
  );

  async function handleDownloadSelected() {
    if (selectedPhotos.length === 0) return;
    if (selectedPhotos.length === 1) {
      await downloadSingle(selectedPhotos[0]);
      return;
    }
    setDownloading(true);
    try {
      await downloadZip(selectedPhotos, "kelly-grad-selected.zip", (d, t) =>
        setProgress({ label: "Zipping selected", done: d, total: t })
      );
    } finally {
      setProgress(null);
      setDownloading(false);
    }
  }

  async function handleDownloadAll() {
    setDownloading(true);
    try {
      await downloadZip(photos, "kelly-grad-all.zip", (d, t) =>
        setProgress({ label: "Zipping all", done: d, total: t })
      );
    } finally {
      setProgress(null);
      setDownloading(false);
    }
  }

  // keyboard arrows for lightbox
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i === null ? null : Math.min(photos.length - 1, i + 1)
        );
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? null : Math.max(0, i - 1)));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, photos.length]);

  return (
    <main className="min-h-screen pb-32">
      <header className="sticky top-0 z-30 backdrop-blur bg-ink/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <Link
            href="/landing"
            className="text-xs uppercase tracking-widest text-cream/60 hover:text-gold transition"
          >
            ← Back
          </Link>
          <h1 className="text-sm sm:text-base font-bold flex-1">
            {photos.length} pictures · {selected.size} selected
          </h1>
          <button
            onClick={selectAll}
            className="hidden sm:inline px-3 py-1.5 text-xs uppercase tracking-wider rounded-full border border-white/20 hover:border-gold hover:text-gold transition"
          >
            Select all
          </button>
          {selected.size > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-xs uppercase tracking-wider rounded-full border border-white/20 hover:border-red-400 hover:text-red-400 transition"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {photos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {photos.map((p, i) => {
              const on = selected.has(p.name);
              return (
                <div
                  key={p.name}
                  className={`relative group aspect-square overflow-hidden rounded-xl bg-white/5 cursor-pointer transition ring-offset-2 ring-offset-ink ${
                    on ? "ring-2 ring-gold" : "ring-0"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumb}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    onClick={() => setLightboxIndex(i)}
                    className="absolute inset-0 w-full h-full object-cover transition group-hover:scale-[1.03]"
                  />
                  <button
                    aria-label={on ? "Unselect" : "Select"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(p.name);
                    }}
                    className={`pick-check ${on ? "on" : ""}`}
                  >
                    {on ? "✓" : ""}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-ink via-ink/95 to-ink/0 pt-10 pb-5 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {progress && (
            <div className="mb-3 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-center">
              {progress.label} · {progress.done} / {progress.total}
            </div>
          )}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleDownloadSelected}
              disabled={downloading || selected.size === 0}
              className="flex-1 py-3 sm:py-4 rounded-2xl bg-gold text-ink font-bold uppercase tracking-wider text-sm sm:text-base hover:brightness-110 active:scale-[0.99] transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Download selected
              {selected.size > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-ink text-gold rounded-full w-6 h-6 text-xs">
                  {selected.size}
                </span>
              )}
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={downloading || photos.length === 0}
              className="flex-1 py-3 sm:py-4 rounded-2xl border-2 border-gold text-gold font-bold uppercase tracking-wider text-sm sm:text-base hover:bg-gold/10 active:scale-[0.99] transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Download all
            </button>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && photos[lightboxIndex] && (
        <Lightbox
          photo={photos[lightboxIndex]}
          index={lightboxIndex}
          total={photos.length}
          isSelected={selected.has(photos[lightboxIndex].name)}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setLightboxIndex((i) =>
              Math.min(photos.length - 1, (i ?? 0) + 1)
            )
          }
          onToggleSelect={() => toggle(photos[lightboxIndex].name)}
          onDownload={() => downloadSingle(photos[lightboxIndex])}
        />
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="max-w-xl mx-auto text-center pt-32 px-6">
      <h2 className="text-2xl font-bold mb-3">No pictures yet</h2>
      <p className="text-cream/60">
        Run the upload script to push the photos to R2:
      </p>
      <pre className="mt-4 text-left bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gold overflow-x-auto">
        npm run upload
      </pre>
    </div>
  );
}
