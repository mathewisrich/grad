#!/usr/bin/env node
/**
 * Smoke-test R2 credentials by uploading a tiny test object.
 */

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucket = process.env.R2_BUCKET;
const key = "_health-check.txt";

console.log(`Uploading test object to bucket "${bucket}"...`);
await s3.send(
  new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: `OK ${new Date().toISOString()}`,
    ContentType: "text/plain",
  })
);
console.log("Upload OK.");

const url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
console.log(`\nFetching it back over the public URL:\n  ${url}`);
const res = await fetch(url);
console.log(`  status: ${res.status}`);
const body = await res.text();
console.log(`  body  : ${body}`);

if (res.ok) {
  console.log("\nPublic access works. Cleaning up...");
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.log("Done. R2 is ready for the real upload.");
} else {
  console.error("\nPublic URL did not return the file. Check that Public Development URL is enabled in R2.");
  process.exit(1);
}
