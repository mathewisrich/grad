"use client";

import JSZip from "jszip";

export type DownloadablePhoto = {
  name: string;
  full: string;
};

export async function downloadSingle(photo: DownloadablePhoto): Promise<void> {
  try {
    const res = await fetch(photo.full, { mode: "cors" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const blob = await res.blob();
    triggerBlobDownload(blob, `${photo.name}.jpg`);
  } catch {
    // Fallback: open in a new tab so the user can long-press / save-as.
    window.open(photo.full, "_blank", "noopener");
  }
}

export async function downloadZip(
  photos: DownloadablePhoto[],
  filename: string,
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total = photos.length;
  let done = 0;

  const concurrency = 5;
  const queue = [...photos];

  async function worker() {
    while (queue.length) {
      const p = queue.shift();
      if (!p) return;
      try {
        const res = await fetch(p.full, { mode: "cors" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const buf = await res.arrayBuffer();
        zip.file(`${p.name}.jpg`, buf);
      } catch (e) {
        console.warn(`Skipping ${p.name}:`, e);
      }
      done++;
      onProgress?.(done, total);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, total) }, worker)
  );

  const blob = await zip.generateAsync(
    { type: "blob", compression: "STORE" },
    (meta) => onProgress?.(Math.round((meta.percent / 100) * total), total)
  );
  triggerBlobDownload(blob, filename);
}

function triggerBlobDownload(blob: Blob, filename: string) {
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
