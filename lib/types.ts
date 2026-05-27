/**
 * Shared types used across server and client code.
 */

export type Photo = {
  /** Filename without extension, e.g. "DSC_0001" */
  name: string;
  /** R2 object key for the full-size variant (e.g. "full/DSC_0001.jpg") */
  full: string;
  /** R2 object key for the thumbnail variant (e.g. "thumb/DSC_0001.jpg") */
  thumb: string;
  width?: number;
  height?: number;
};

export type ClientPhoto = {
  name: string;
  /** Fully-qualified public URL for the full-size image */
  full: string;
  /** Fully-qualified public URL for the thumbnail */
  thumb: string;
  width?: number;
  height?: number;
};

export type Manifest = {
  bucket: string;
  accountId?: string;
  count: number;
  generatedAt: string;
  photos: Photo[];
};

export type DownloadablePhoto = Pick<ClientPhoto, "name" | "full">;

export type ZipProgress = {
  phase: "fetching" | "zipping" | "done";
  done: number;
  total: number;
  percent: number;
};
