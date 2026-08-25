import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, copyFile, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
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
    const result = spawnSync(process.execPath, [path.join(decoy, "scripts", "validate.mjs")], { encoding: "utf8" });
    assert.equal(result.status, 1, result.stderr || result.stdout);
    assert.ok(result.stderr.includes("unreadable directory:"), result.stderr);
    assert.ok(!result.stderr.includes("at async readdir"), result.stderr);
  } finally {
    if (locked) await chmod(locked, 0o755).catch(() => {});
    await rm(decoy, { recursive: true, force: true });
  }
});
