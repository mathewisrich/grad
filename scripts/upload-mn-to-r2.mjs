#!/usr/bin/env node
/**
 * Compress every photo in "113D3500/Mathew & NAA" and upload to Cloudflare R2
 * under a SEPARATE key prefix so it never mixes with Kelly's gallery.
 *
 * For each source photo we produce two copies:
 *   1. mn-full/<name>.jpg   - full-size at quality 85 (downloadable)
 *   2. mn-thumb/<name>.jpg  - 800px wide at quality 80 (gallery grid)
 *
 * A manifest-mn.json with the list of photos is generated into /lib so the
 * private /m&n gallery knows what to render.
 *
 * Run with:  npm run upload:mn
 */

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pLimit from "p-limit";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

async function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  if (!existsSync(envPath)) return;
  const txt = await readFile(envPath, "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}
await loadEnv();

const SRC_DIR = path.join(rootDir, "113D3500", "Mathew & NAA");
const MANIFEST_DST = path.join(rootDir, "lib", "manifest-mn.json");
const FULL_PREFIX = "mn-full";
const THUMB_PREFIX = "mn-thumb";

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_ENDPOINT,
} = process.env;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error("Missing R2 credentials in .env.local");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function objectExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404) return false;
    if (err?.name === "NotFound") return false;
    throw err;
  }
}

async function upload(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
}

async function processOne(filename, idx, total) {
  const srcPath = path.join(SRC_DIR, filename);
  const base = filename.replace(/\.[^.]+$/, "");
  const fullKey = `${FULL_PREFIX}/${base}.jpg`;
  const thumbKey = `${THUMB_PREFIX}/${base}.jpg`;

  const [fullExists, thumbExists] = await Promise.all([
    objectExists(fullKey),
    objectExists(thumbKey),
  ]);

  if (fullExists && thumbExists) {
    console.log(`[${idx}/${total}] skip ${filename} (already in R2)`);
    const meta = await sharp(srcPath, { failOn: "none" }).metadata().catch(() => ({}));
    return {
      name: base,
      full: fullKey,
      thumb: thumbKey,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
    };
  }

  const meta = await sharp(srcPath, { failOn: "none" }).rotate().metadata();

  const fullBuf = await sharp(srcPath, { failOn: "none" })
    .rotate()
    .jpeg({ quality: 85, mozjpeg: true, progressive: true })
    .toBuffer();

  const thumbBuf = await sharp(srcPath, { failOn: "none" })
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true, progressive: true })
    .toBuffer();

  if (!fullExists) await upload(fullKey, fullBuf, "image/jpeg");
  if (!thumbExists) await upload(thumbKey, thumbBuf, "image/jpeg");

  const fullKb = Math.round(fullBuf.length / 1024);
  const thumbKb = Math.round(thumbBuf.length / 1024);
  console.log(
    `[${idx}/${total}] ${filename}  ${meta.width}x${meta.height}  ` +
      `full=${fullKb}KB  thumb=${thumbKb}KB`
  );

  return {
    name: base,
    full: fullKey,
    thumb: thumbKey,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source folder not found: ${SRC_DIR}`);
    process.exit(1);
  }

  const all = (await readdir(SRC_DIR)).filter(
    (f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith(".") && !f.startsWith("._")
  );

  // Drop empty / zero-byte files (e.g. broken duplicates)
  const entries = [];
  for (const f of all) {
    try {
      const s = await stat(path.join(SRC_DIR, f));
      if (s.size > 0) entries.push(f);
      else console.log(`skip ${f} (0 bytes)`);
    } catch {
      // ignore
    }
  }
  entries.sort();
  console.log(`Found ${entries.length} photos in ${SRC_DIR}\n`);

  const limit = pLimit(4);
  const photos = [];
  let done = 0;

  await Promise.all(
    entries.map((file) =>
      limit(async () => {
        try {
          const photo = await processOne(file, ++done, entries.length);
          photos.push(photo);
        } catch (e) {
          console.error(`[FAIL] ${file}:`, e?.message ?? e);
        }
      })
    )
  );

  photos.sort((a, b) => a.name.localeCompare(b.name));

  await mkdir(path.dirname(MANIFEST_DST), { recursive: true });
  await writeFile(
    MANIFEST_DST,
    JSON.stringify(
      {
        bucket: R2_BUCKET,
        accountId: R2_ACCOUNT_ID,
        count: photos.length,
        generatedAt: new Date().toISOString(),
        photos,
      },
      null,
      2
    )
  );

  console.log(
    `\nDone. ${photos.length} M&N photos in R2. Manifest -> ${MANIFEST_DST}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
