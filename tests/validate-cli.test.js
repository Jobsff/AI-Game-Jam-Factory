import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { chmod, copyFile, mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const factoryRoot = path.resolve(import.meta.dirname, "..");
const validateScript = path.join(factoryRoot, "scripts", "validate.mjs");

function runValidate(cwd) {
  return spawnSync(process.execPath, [validateScript], { cwd, encoding: "utf8" });
}

test("validate succeeds when run from the repository root", () => {
  const result = runValidate(factoryRoot);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(result.stdout.includes("validate ok:"), result.stdout);
  assert.ok(!result.stderr.includes("ENOENT"), result.stderr);
});

test("validate resolves the repository root from the script location, not the caller cwd", async () => {
  const external = await mkdtemp(path.join(os.tmpdir(), "factory-validate-cwd-"));
  try {
    const result = runValidate(external);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.ok(result.stdout.includes("validate ok:"), result.stdout);
    assert.ok(!result.stderr.includes("ENOENT"), result.stderr);
  } finally {
    await rm(external, { recursive: true, force: true });
  }
});

test("validate succeeds when run from a repository subdirectory", () => {
  const result = runValidate(path.join(factoryRoot, "scripts"));
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(result.stdout.includes("validate ok:"), result.stdout);
  assert.ok(!result.stderr.includes("ENOENT"), result.stderr);
});

test("filesUnder reports unreadable directories as structured errors instead of crashing", async (t) => {
  const decoy = await mkdtemp(path.join(os.tmpdir(), "factory-validate-decoy-"));
  let locked;
  try {
    await mkdir(path.join(decoy, "scripts"), { recursive: true });
    await copyFile(validateScript, path.join(decoy, "scripts", "validate.mjs"));
    locked = path.join(decoy, "06_GameJam_Checklist");
    await mkdir(locked);
    let readable = true;
    try { await chmod(locked, 0o000); await readdir(locked); } catch { readable = false; }
    if (readable) return t.skip("chmod 000 cannot make the directory unreadable in this environment");
    // Capture stderr via a file: Node 20's spawnSync truncates piped stderr at 8192 bytes
    // when the child itself spawns grandchildren (validate.mjs runs `node --check` per file),
    // which drops the "unreadable directory:" report emitted near the end of a ~16KB stream.
    const errPath = path.join(decoy, "stderr.txt");
    const errFd = openSync(errPath, "w");
    let result;
    try {
      result = spawnSync(process.execPath, [path.join(decoy, "scripts", "validate.mjs")], { stdio: ["ignore", "ignore", errFd] });
    } finally {
      closeSync(errFd);
    }
    const stderr = await readFile(errPath, "utf8");
    assert.equal(result.status, 1, stderr);
    assert.ok(stderr.includes("unreadable directory:"), stderr);
    assert.ok(!stderr.includes("at async readdir"), stderr);
  } finally {
    if (locked) await chmod(locked, 0o755).catch(() => {});
    await rm(decoy, { recursive: true, force: true });
  }
});
