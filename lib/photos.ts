import manifest from "./manifest.json";

export type Photo = {
  name: string;
  full: string;
  thumb: string;
  width?: number;
  height?: number;
};

export function getPhotos(): Photo[] {
  return manifest.photos as Photo[];
}

export function getPhotoCount(): number {
  return manifest.count ?? manifest.photos.length;
}

export function publicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}
