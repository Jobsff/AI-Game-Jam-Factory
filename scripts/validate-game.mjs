import { readFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.argv[2] ?? process.cwd());
const errors = [];

async function collect(directory) {
  const files = [];
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    errors.push(`cannot read ${path.relative(root, directory) || "."}: ${error.message}`);
    return files;
  }
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(candidate));
    else files.push(candidate);
  }
  return files;
}

async function requireFile(relative, minimumBytes = 1) {
  const file = path.join(root, relative);
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size < minimumBytes) errors.push(`${relative} is missing or too small`);
  } catch {
    errors.push(`missing ${relative}`);
  }
}

const required = [
  "index.html",
  "src/main.js",
  "src/config.js",
  "src/scenes/BootScene.js",
  "src/scenes/GameScene.js",
  "src/scenes/UIScene.js",
  "02_Game_Core/core/EventBus.js",
  "08_Prefab_Library/prefab.manifest.json",
  "vendor/phaser.min.js",
  "vendor/PHASER_LICENSE.txt",
  "AGENTS.md",
  "GDD.md",
  "TDD.md",
  "GAME_MAP.md",
  "docs/MODULE_CONTRACT.md",
  "docs/DEBUG_REPORT.md",
  "docs/AI_USAGE_LOG.md",
  "docs/CHILD_CONTRIBUTION_LOG.md",
  "00_Command_Center/OPEN_SOURCE_POLICY.md",
  "06_GameJam_Checklist/submission.md",
  "THIRD_PARTY_NOTICES.md",
];
for (const file of required) await requireFile(file, file === "vendor/phaser.min.js" ? 100_000 : 1);

const files = await collect(root);
for (const file of files.filter((candidate) => /\.(?:js|mjs)$/.test(candidate))) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`syntax error: ${path.relative(root, file)}\n${result.stderr.trim()}`);
}
for (const file of files.filter((candidate) => candidate.endsWith(".json"))) {
  try { JSON.parse(await readFile(file, "utf8")); }
  catch (error) { errors.push(`invalid JSON: ${path.relative(root, file)}: ${error.message}`); }
}
try {
  const phaser = await readFile(path.join(root, "vendor/phaser.min.js"));
  const hash = createHash("sha256").update(phaser).digest("hex");
  if (hash !== "e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7") errors.push(`vendor/phaser.min.js SHA-256 mismatch: ${hash}`);
} catch (error) { errors.push(`Phaser hash validation failed: ${error.message}`); }

async function validateLink(sourceFile, rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "").split("#")[0].split("?")[0];
  if (!target || /^(?:[a-z]+:|\/\/)/i.test(target) || target.includes("{{")) return;
  let decoded;
  try { decoded = decodeURIComponent(target); }
  catch { errors.push(`invalid link encoding: ${path.relative(root, sourceFile)} -> ${rawTarget}`); return; }
  const resolved = path.resolve(path.dirname(sourceFile), decoded);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    errors.push(`internal link escapes project: ${path.relative(root, sourceFile)} -> ${rawTarget}`);
    return;
  }
  await stat(resolved).catch(() => errors.push(`broken internal link: ${path.relative(root, sourceFile)} -> ${rawTarget}`));
}
for (const file of files.filter((candidate) => candidate.endsWith(".md"))) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) await validateLink(file, match[1]);
}

try {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  for (const marker of ["./vendor/phaser.min.js", '"#factory/":"./02_Game_Core/"', '"#prefabs/":"./08_Prefab_Library/"', "load-error"]) {
    if (!html.includes(marker)) errors.push(`index.html missing ${marker}`);
  }
  if (html.includes("../../")) errors.push("index.html still references the factory parent directory");
} catch {}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`game validate ok: ${files.length} files under ${root}`);
