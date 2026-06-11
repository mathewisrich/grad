import manifestData from "./manifest.json";
import mnManifestData from "./manifest-mn.json";
import type { Manifest, Photo } from "./types";

const manifest = manifestData as Manifest;
const mnManifest = mnManifestData as Manifest;

export function getPhotos(): Photo[] {
  return manifest.photos;
}

export function getPhotoCount(): number {
  return manifest.count ?? manifest.photos.length;
}

export function getGeneratedAt(): string {
  return manifest.generatedAt ?? "";
}

// --- Private Mathew & Naa set --------------------------------------

export function getMnPhotos(): Photo[] {
  return mnManifest.photos;
}

export function getMnPhotoCount(): number {
  return mnManifest.count ?? mnManifest.photos.length;
}

export function publicUrl(key: string): string {
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  const path = key.replace(/^\//, "");
  return `${base}/${path}`;
}
