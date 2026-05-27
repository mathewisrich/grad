"use client";

import type { ZipProgress } from "@/lib/types";

export default function DownloadProgress({
  progress,
}: {
  progress: ZipProgress;
}) {
  const labels: Record<ZipProgress["phase"], string> = {
    fetching: "Downloading pictures",
    zipping: "Zipping them up",
    done: "Done",
  };
  return (
    <div className="mb-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest mb-2">
        <span className="text-white/70">{labels[progress.phase]}</span>
        <span className="text-yellow-400 font-black">{progress.percent}%</span>
      </div>
      <div className="bar">
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      {progress.phase === "fetching" && (
        <p className="text-[10px] text-white/40 mt-2 text-right font-semibold">
          {progress.done} / {progress.total} pics fetched
        </p>
      )}
    </div>
  );
}
