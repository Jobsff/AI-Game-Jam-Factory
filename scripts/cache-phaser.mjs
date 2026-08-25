import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

export const PHASER_VERSION = "3.90.0";
export const PHASER_SHA256 = "e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7";
const root = path.resolve(import.meta.dirname, "..");
const destination = path.join(root, "vendor", "phaser.min.js");
const temporary = `${destination}.download`;
const url = `https://cdn.jsdelivr.net/npm/phaser@${PHASER_VERSION}/dist/phaser.min.js`;

export async function cachePhaser() {
  await mkdir(path.dirname(destination), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Phaser download failed: HTTP ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 100_000) throw new Error(`Phaser download is unexpectedly small: ${bytes.byteLength} bytes`);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== PHASER_SHA256) throw new Error(`Phaser SHA-256 mismatch: expected ${PHASER_SHA256}, got ${sha256}`);
  await writeFile(temporary, bytes);
  await rename(temporary, destination);
  const result = await stat(destination);
  console.log(`cached Phaser ${PHASER_VERSION}: ${result.size} bytes, sha256 ${PHASER_SHA256} -> ${destination}`);
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  cachePhaser().catch(async (error) => { await rm(temporary, { force: true }); console.error(error.message); process.exitCode = 1; });
}
