"use client";

import JSZip from "jszip";
import type { DownloadablePhoto, ZipProgress } from "./types";

const FETCH_CONCURRENCY = 6;
const FETCH_RETRIES = 2;

export async function downloadSingle(photo: DownloadablePhoto): Promise<void> {
  try {
    const blob = await fetchBlob(photo.full);
    triggerBlobDownload(blob, `${photo.name}.jpg`);
    markDownloaded([photo.name]);
  } catch (err) {
    console.warn("Single download fell back to new-tab:", err);
    window.open(photo.full, "_blank", "noopener,noreferrer");
  }
}

export async function downloadZip(
  photos: DownloadablePhoto[],
  filename: string,
  onProgress?: (p: ZipProgress) => void
): Promise<void> {
  if (photos.length === 0) return;

  const zip = new JSZip();
  const total = photos.length;
  let fetched = 0;

  const emit = (phase: ZipProgress["phase"], done: number, percent: number) =>
    onProgress?.({ phase, done, total, percent });

  emit("fetching", 0, 0);

  const queue: DownloadablePhoto[] = [...photos];
  const workers: Promise<void>[] = [];
  const succeeded: string[] = [];

  for (let i = 0; i < Math.min(FETCH_CONCURRENCY, total); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const photo = queue.shift();
          if (!photo) return;
          try {
            const buf = await fetchArrayBuffer(photo.full);
            zip.file(`${photo.name}.jpg`, buf);
            succeeded.push(photo.name);
          } catch (e) {
            console.warn(`Skipping ${photo.name} in zip:`, e);
          }
          fetched++;
          const pct = Math.round((fetched / total) * 50);
          emit("fetching", fetched, pct);
        }
      })()
    );
  }

  await Promise.all(workers);

  const blob = await zip.generateAsync(
    { type: "blob", compression: "STORE" },
    (meta) => emit("zipping", fetched, 50 + Math.round(meta.percent / 2))
  );

  triggerBlobDownload(blob, filename);
  markDownloaded(succeeded);
  emit("done", fetched, 100);
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetchWithRetry(url);
  return res.arrayBuffer();
}

async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetchWithRetry(url);
  return res.blob();
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { mode: "cors", cache: "force-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < FETCH_RETRIES) {
        await sleep(300 * (attempt + 1));
      }
    }
  }
  throw lastErr;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// --- "downloaded" memory (so Kelly can see what he already grabbed) -------

const DOWNLOADED_KEY = "kg.downloaded.v1";

export function getDownloadedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DOWNLOADED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function markDownloaded(names: string[]): void {
  if (typeof window === "undefined" || names.length === 0) return;
  try {
    const set = getDownloadedSet();
    for (const n of names) set.add(n);
    window.localStorage.setItem(
      DOWNLOADED_KEY,
      JSON.stringify(Array.from(set))
    );
    window.dispatchEvent(new CustomEvent("kg:downloaded-changed"));
  } catch {
    // localStorage may be full / disabled — non-fatal
  }
}

export function clearDownloadedMemory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DOWNLOADED_KEY);
    window.dispatchEvent(new CustomEvent("kg:downloaded-changed"));
  } catch {
    // ignore
  }
}
