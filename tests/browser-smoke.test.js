import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const factoryRoot = path.resolve(import.meta.dirname, "..");
const smokeScript = path.join(factoryRoot, "scripts", "browser-smoke.mjs");

const { main, resolveChromeCandidate } = await import(pathToFileURL(smokeScript).href);

function recordingExists(result = false) {
  const probes = [];
  return { probes, existsFn: async (candidate) => { probes.push(candidate); return result; } };
}

class EarlyExit extends Error {
  constructor(code) {
    super(`main exited early with code ${code}`);
    this.exitCode = code;
  }
}

// Drives main() with every browser probe forced to miss, so the skip/strict
// branches are exercised deterministically even on machines that have Chrome.
async function runMainWithoutBrowser({ requireBrowser }) {
  const logs = [];
  const errors = [];
  let exitCode = null;
  const env = { CHROME_BIN: path.join(os.tmpdir(), "browser-smoke-missing", "chrome"), PATH: "" };
  if (requireBrowser) env.REQUIRE_BROWSER = "1";
  try {
    await main({
      env,
      platform: "linux",
      existsFn: async () => false,
      headlessShell: null,
      log: (message) => logs.push(String(message)),
      error: (message) => errors.push(String(message)),
      exit: (code) => { exitCode = code; throw new EarlyExit(code); },
    });
  } catch (error) {
    if (!(error instanceof EarlyExit)) throw error;
  }
  return { logs, errors, exitCode };
}

test("resolveChromeCandidate: no browser when every probe misses (missing CHROME_BIN, empty PATH)", async () => {
  const candidate = await resolveChromeCandidate({
    env: { CHROME_BIN: "/nonexistent/chrome", PATH: "" },
    platform: "linux",
    existsFn: async () => false,
    headlessShell: null,
  });
  assert.equal(candidate, null);
});

test("resolveChromeCandidate: CHROME_BIN is probed first and wins when it exists", async () => {
  const { probes, existsFn } = recordingExists(true);
  const chromeBin = path.join(os.tmpdir(), "browser-smoke-custom", "chrome");
  const candidate = await resolveChromeCandidate({
    env: { CHROME_BIN: chromeBin, PATH: "" },
    platform: "linux",
    existsFn,
    headlessShell: null,
  });
  assert.equal(candidate, chromeBin);
  assert.equal(probes[0], chromeBin);
});

test("resolveChromeCandidate: existsFn throwing on a probe degrades to 'missing' and resolution continues to the next candidate", async () => {
  const chromeBin = path.join(os.tmpdir(), "browser-smoke-custom", "chrome");
  const headlessShell = path.join(os.tmpdir(), "browser-smoke-cache", "chrome-headless-shell");
  const candidate = await resolveChromeCandidate({
    env: { CHROME_BIN: chromeBin, PATH: "" },
    platform: "linux",
    existsFn: async (probe) => {
      if (probe === chromeBin) throw new Error("simulated filesystem error");
      return probe === headlessShell;
    },
    headlessShell,
  });
  assert.equal(candidate, headlessShell);
});

test("resolveChromeCandidate: existsFn throwing on every probe resolves to null instead of leaking the exception", async () => {
  const candidate = await resolveChromeCandidate({
    env: { CHROME_BIN: "/some/path/chrome", PATH: "/usr/bin" },
    platform: "linux",
    existsFn: async () => {
      throw new Error("simulated filesystem error");
    },
    headlessShell: null,
  });
  assert.equal(candidate, null);
});

test("resolveChromeCandidate: default exists requires a regular file, so CHROME_BIN pointing at a directory is skipped", async () => {
  // No existsFn injected: this exercises the real default (stat + isFile).
  const candidate = await resolveChromeCandidate({
    env: { CHROME_BIN: os.tmpdir(), PATH: "" },
    platform: "linux",
    headlessShell: null,
  });
  assert.equal(candidate, null);
});

test("resolveChromeCandidate: win32 probes both Program Files chrome.exe paths and never accepts bare names unconditionally", async () => {
  const { probes, existsFn } = recordingExists();
  const candidate = await resolveChromeCandidate({
    env: { CHROME_BIN: "", PATH: "C:\\fake\\bin" },
    platform: "win32",
    existsFn,
    headlessShell: null,
  });
  assert.equal(candidate, null);
  assert.ok(probes.includes("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"), probes.join("\n"));
  assert.ok(probes.includes("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"), probes.join("\n"));
  assert.ok(!probes.includes("chrome"), "bare command names must be resolved through PATH, not accepted as-is");
  assert.ok(!probes.includes("chrome.exe"), "bare command names must be resolved through PATH, not accepted as-is");
  assert.ok(
    probes.some((probe) => probe.includes("fake") && probe.includes("chrome")),
    `expected a PATH-joined probe under the fake bin dir, got: ${probes.join("\n")}`,
  );
});

test("resolveChromeCandidate: darwin probes the /Applications Chrome and Chromium paths", async () => {
  const { probes, existsFn } = recordingExists();
  await resolveChromeCandidate({
    env: { PATH: "" },
    platform: "darwin",
    existsFn,
    headlessShell: null,
  });
  assert.ok(probes.includes("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"), probes.join("\n"));
  assert.ok(probes.includes("/Applications/Chromium.app/Contents/MacOS/Chromium"), probes.join("\n"));
});

test("main: without a browser, non-strict mode reports skip and exits 0", async () => {
  const { logs, errors, exitCode } = await runMainWithoutBrowser({ requireBrowser: false });
  assert.equal(exitCode, 0);
  assert.ok(logs.some((line) => line.includes("browser smoke skipped")), logs.join("\n"));
  assert.equal(errors.length, 0, errors.join("\n"));
});

test("main: without a browser, REQUIRE_BROWSER=1 fails loudly and exits 1", async () => {
  const { logs, errors, exitCode } = await runMainWithoutBrowser({ requireBrowser: true });
  assert.equal(exitCode, 1);
  assert.equal(logs.length, 0, logs.join("\n"));
  assert.ok(errors.some((line) => line.includes("REQUIRE_BROWSER")), errors.join("\n"));
});

test("integration: scripts/browser-smoke.mjs exits 0 on this machine", () => {
  // Non-strict mode must exit 0 both when a browser is found (real run, this
  // machine has the puppeteer-cached chrome-headless-shell) and when none is
  // found (skip). Integration is happy-path smoke only; the strict and
  // degraded-probe semantics are covered by the injected unit cases above.
  const result = spawnSync(process.execPath, [smokeScript], { encoding: "utf8", timeout: 120_000 });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.ok(
    result.stdout.includes("browser smoke ok:") || result.stdout.includes("browser smoke skipped:"),
    result.stdout,
  );
});
