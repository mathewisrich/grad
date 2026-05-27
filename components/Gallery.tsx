"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import Lightbox from "./Lightbox";
import PhotoTile from "./PhotoTile";
import DownloadProgress from "./DownloadProgress";
import { downloadSingle, downloadZip } from "@/lib/download";
import {
  usePersistedSelection,
  useDownloadedSet,
  useMediaQuery,
} from "@/lib/hooks";
import type { ClientPhoto, ZipProgress } from "@/lib/types";

type SortMode = "name-asc" | "name-desc";
type ViewFilter = "all" | "selected" | "undownloaded";

export default function Gallery({ photos }: { photos: ClientPhoto[] }) {
  const { selected, toggle, selectMany, clear, hydrated } =
    usePersistedSelection();
  const downloaded = useDownloadedSet();

  const [sort, setSort] = useState<SortMode>("name-asc");
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<ZipProgress | null>(null);
  const [busy, setBusy] = useState(false);

  const isSmall = useMediaQuery("(max-width: 640px)");

  // --- derived views -------------------------------------------------

  const visible = useMemo<ClientPhoto[]>(() => {
    let arr = photos;
    if (filter === "selected") arr = arr.filter((p) => selected.has(p.name));
    else if (filter === "undownloaded")
      arr = arr.filter((p) => !downloaded.has(p.name));
    const sorted = [...arr].sort((a, b) =>
      sort === "name-asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    return sorted;
  }, [photos, filter, sort, selected, downloaded]);

  const selectedPhotos = useMemo(
    () => photos.filter((p) => selected.has(p.name)),
    [photos, selected]
  );

  // --- actions -------------------------------------------------------

  const handleSelectAll = useCallback(() => {
    selectMany(photos.map((p) => p.name));
  }, [photos, selectMany]);

  const handleSelectAllVisible = useCallback(() => {
    selectMany(visible.map((p) => p.name));
  }, [visible, selectMany]);

  async function handleDownloadSelected() {
    if (selectedPhotos.length === 0) return;
    if (selectedPhotos.length === 1) {
      setBusy(true);
      try {
        await downloadSingle(selectedPhotos[0]);
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    try {
      await downloadZip(
        selectedPhotos,
        `kelly-grad-${selectedPhotos.length}-pics.zip`,
        setProgress
      );
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }

  async function handleDownloadAll() {
    setBusy(true);
    try {
      await downloadZip(photos, "kelly-grad-all.zip", setProgress);
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/";
  }

  // --- keyboard ------------------------------------------------------

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) =>
          i === null ? null : Math.min(visible.length - 1, i + 1)
        );
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? null : Math.max(0, i - 1)));
      if (e.key === " ") {
        e.preventDefault();
        if (lightboxIndex !== null && visible[lightboxIndex])
          toggle(visible[lightboxIndex].name);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, visible, toggle]);

  // --- render --------------------------------------------------------

  return (
    <main className="min-h-screen pb-44">
      <Header
        total={photos.length}
        visibleCount={visible.length}
        selectedCount={selected.size}
        downloadedCount={downloaded.size}
        filter={filter}
        sort={sort}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onSelectAll={handleSelectAll}
        onSelectAllVisible={handleSelectAllVisible}
        onClear={clear}
        onLogout={handleLogout}
      />

      {photos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4">
          {visible.length === 0 ? (
            <FilterEmpty
              filter={filter}
              onReset={() => setFilter("all")}
            />
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {visible.map((p, i) => (
                <PhotoTile
                  key={p.name}
                  photo={p}
                  index={i}
                  selected={selected.has(p.name)}
                  downloaded={downloaded.has(p.name)}
                  hydrated={hydrated}
                  onOpen={() => setLightboxIndex(i)}
                  onToggle={() => toggle(p.name)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <ActionBar
        selectedCount={selected.size}
        totalCount=
          {photos.length}
        progress={progress}
        busy={busy}
        compact={isSmall}
        onDownloadSelected={handleDownloadSelected}
        onDownloadAll={handleDownloadAll}
      />

      {lightboxIndex !== null && visible[lightboxIndex] && (
        <Lightbox
          photo={visible[lightboxIndex]}
          index={lightboxIndex}
          total={visible.length}
          isSelected={selected.has(visible[lightboxIndex].name)}
          isDownloaded={downloaded.has(visible[lightboxIndex].name)}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setLightboxIndex((i) =>
              Math.min(visible.length - 1, (i ?? 0) + 1)
            )
          }
          onToggleSelect={() => toggle(visible[lightboxIndex].name)}
          onDownload={() => downloadSingle(visible[lightboxIndex])}
        />
      )}
    </main>
  );
}

// --- header ---------------------------------------------------------

type HeaderProps = {
  total: number;
  visibleCount: number;
  selectedCount: number;
  downloadedCount: number;
  filter: ViewFilter;
  sort: SortMode;
  onFilterChange: (f: ViewFilter) => void;
  onSortChange: (s: SortMode) => void;
  onSelectAll: () => void;
  onSelectAllVisible: () => void;
  onClear: () => void;
  onLogout: () => void;
};

function Header({
  total,
  visibleCount,
  selectedCount,
  downloadedCount,
  filter,
  sort,
  onFilterChange,
  onSortChange,
  onSelectAll,
  onSelectAllVisible,
  onClear,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-ink/85 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Link
            href="/landing"
            className="text-xs uppercase tracking-widest text-cream/60 hover:text-gold transition shrink-0"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-bold truncate">
              {visibleCount} of {total}{" "}
              <span className="text-cream/40 font-normal">·</span>{" "}
              <span className="text-gold">{selectedCount}</span> selected
              {downloadedCount > 0 && (
                <>
                  {" "}
                  <span className="text-cream/40 font-normal">·</span>{" "}
                  <span className="text-cream/60 font-normal">
                    {downloadedCount} downloaded
                  </span>
                </>
              )}
            </h1>
          </div>

          <select
            value={filter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onFilterChange(e.target.value as ViewFilter)
            }
            className="bg-white/5 border border-white/15 rounded-full px-3 py-1.5 text-xs uppercase tracking-wider hover:border-gold transition cursor-pointer"
            aria-label="Filter photos"
          >
            <option value="all">All</option>
            <option value="selected">Selected</option>
            <option value="undownloaded">Not downloaded</option>
          </select>

          <select
            value={sort}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onSortChange(e.target.value as SortMode)
            }
            className="hidden sm:block bg-white/5 border border-white/15 rounded-full px-3 py-1.5 text-xs uppercase tracking-wider hover:border-gold transition cursor-pointer"
            aria-label="Sort order"
          >
            <option value="name-asc">A → Z</option>
            <option value="name-desc">Z → A</option>
          </select>

          {selectedCount > 0 ? (
            <button
              onClick={onClear}
              className="px-3 py-1.5 text-xs uppercase tracking-wider rounded-full border border-white/20 hover:border-red-400 hover:text-red-400 transition"
            >
              Clear
            </button>
          ) : (
            <button
              onClick={
                filter === "all" ? onSelectAll : onSelectAllVisible
              }
              className="px-3 py-1.5 text-xs uppercase tracking-wider rounded-full border border-white/20 hover:border-gold hover:text-gold transition"
            >
              Select{" "}
              {filter === "all" ? "all" : "visible"}
            </button>
          )}

          <button
            onClick={onLogout}
            className="hidden sm:inline px-3 py-1.5 text-xs uppercase tracking-wider rounded-full text-cream/40 hover:text-cream transition"
            aria-label="Log out"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

// --- bottom action bar ---------------------------------------------

type ActionBarProps = {
  selectedCount: number;
  totalCount: number;
  progress: ZipProgress | null;
  busy: boolean;
  compact: boolean;
  onDownloadSelected: () => void;
  onDownloadAll: () => void;
};

function ActionBar({
  selectedCount,
  totalCount,
  progress,
  busy,
  onDownloadSelected,
  onDownloadAll,
}: ActionBarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="bg-gradient-to-t from-ink via-ink/95 to-transparent pt-12 pb-4 px-3 sm:px-6">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {progress && <DownloadProgress progress={progress} />}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onDownloadSelected}
              disabled={busy || selectedCount === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <span>
                Download {selectedCount === 1 ? "" : "selected"}
                {selectedCount === 1 && "this one"}
              </span>
              {selectedCount > 1 && (
                <span className="inline-flex items-center justify-center bg-ink text-gold rounded-full min-w-6 h-6 px-2 text-xs font-bold">
                  {selectedCount}
                </span>
              )}
            </button>
            <button
              onClick={onDownloadAll}
              disabled={busy || totalCount === 0}
              className="btn-ghost flex-1"
            >
              Download all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- empty states --------------------------------------------------

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

function FilterEmpty({
  filter,
  onReset,
}: {
  filter: ViewFilter;
  onReset: () => void;
}) {
  const msg =
    filter === "selected"
      ? "Nothing selected yet."
      : "All caught up — every picture has been downloaded.";
  return (
    <div className="text-center py-24">
      <p className="text-cream/60 mb-4">{msg}</p>
      <button onClick={onReset} className="text-gold underline">
        Show all pictures
      </button>
    </div>
  );
}
