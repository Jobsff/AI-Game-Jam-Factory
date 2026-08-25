import { spawn } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL, fileURLToPath } from "node:url";
import { createStaticServer } from "./serve.mjs";

async function exists(file) {
  // stat + isFile(): a candidate is only usable when it is a regular file.
  // access() would also succeed for directories, and spawning a directory
  // path fails at the OS level (EACCES/EISDIR) instead of being skipped here.
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function findCachedHeadlessShell() {
  const root = path.join(os.homedir(), ".cache", "puppeteer", "chrome-headless-shell");
  let versions;
  try {
    versions = await readdir(root, { withFileTypes: true });
  } catch {
    return null;
  }
  const platformFolders = process.platform === "darwin"
    ? ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64"]
    : process.platform === "linux"
      ? ["chrome-headless-shell-linux64"]
      : ["chrome-headless-shell-win64"];
  for (const version of versions.filter((entry) => entry.isDirectory()).sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }))) {
    for (const folder of platformFolders) {
      const binary = path.join(root, version.name, folder, process.platform === "win32" ? "chrome-headless-shell.exe" : "chrome-headless-shell");
      if (await exists(binary)) return binary;
    }
  }
  return null;
}

function platformCandidates(platform) {
  if (platform === "darwin") {
    return ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"];
  }
  if (platform === "win32") {
    return [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      "chrome",
    ];
  }
  return ["google-chrome", "chromium", "chromium-browser"];
}

// Returns the first candidate proven to exist, or null when none does.
// Bare command names (no path separator) are never accepted as-is: they must
// resolve to an existing file inside one of env.PATH's directories, so a
// missing system browser is detected instead of surfacing as spawn ENOENT.
// A probe that throws is treated as "missing" so one broken path (permission
// error, EPERM on stat, injected existsFn failure, ...) degrades to trying
// the next candidate instead of crashing the whole resolution.
export async function resolveChromeCandidate({ env = process.env, platform = process.platform, existsFn = exists, headlessShell = null } = {}) {
  const isBare = (candidate) => !/[/\\]/.test(candidate);
  const pathDelimiter = platform === "win32" ? ";" : ":";
  const pathDirs = String(env.PATH ?? "").split(pathDelimiter).filter(Boolean);
  const nameSuffixes = platform === "win32" ? ["", ".exe"] : [""];

  const probe = async (target) => {
    try {
      return await existsFn(target);
    } catch {
      return false;
    }
  };

  const resolveOnPath = async (name) => {
    for (const dir of pathDirs) {
      for (const suffix of nameSuffixes) {
        const resolved = path.join(dir, `${name}${suffix}`);
        if (await probe(resolved)) return resolved;
      }
    }
    return null;
  };

  const candidates = [env.CHROME_BIN, headlessShell, ...platformCandidates(platform)].filter(Boolean);
  for (const candidate of candidates) {
    if (isBare(candidate)) {
      const resolved = await resolveOnPath(candidate);
      if (resolved) return resolved;
    } else if (await probe(candidate)) {
      return candidate;
    }
  }
  return null;
}

const templates = ["template_collect_create", "template_defense", "template_choice", "template_action", "template_find"];

export async function main({
  env = process.env,
  platform = process.platform,
  existsFn = exists,
  headlessShell,
  exit = process.exit,
  log = console.log,
  error = console.error,
} = {}) {
  const chrome = await resolveChromeCandidate({
    env,
    platform,
    existsFn,
    headlessShell: headlessShell !== undefined ? headlessShell : await findCachedHeadlessShell(),
  });

  if (!chrome) {
    // REQUIRE_BROWSER=1 semantics (ruled by the lead agent, F-03): "a usable
    // browser is mandatory" — the puppeteer-cached chrome-headless-shell
    // counts as a legal one because it really executes the smoke run. It does
    // NOT mean "must be explicitly configured" (CHROME_BIN is optional).
    if (env.REQUIRE_BROWSER === "1") {
      error("browser smoke failed: no Chrome/headless-shell binary found; REQUIRE_BROWSER=1 forbids skipping (install Chrome/chromium or point CHROME_BIN at an existing binary)");
      exit(1);
      return;
    }
    log("browser smoke skipped: no Chrome/headless-shell binary found");
    exit(0);
    return;
  }

  const service = createStaticServer({ root: path.resolve(import.meta.dirname, ".."), port: 0 });

  function load(url, { canvas = true, markers = [] } = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(chrome, [
        "--headless",
        "--disable-gpu",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--no-sandbox",
        "--disable-crashpad",
        "--disable-breakpad",
        "--disable-dev-shm-usage",
        "--enable-unsafe-swiftshader",
        "--virtual-time-budget=2500",
        "--dump-dom",
        url,
      ]);
      let stdout = "";
      let stderr = "";
      const timeout = setTimeout(() => child.kill("SIGKILL"), 45_000);
      child.stdout.on("data", (data) => { stdout += data; });
      child.stderr.on("data", (data) => { stderr += data; });
      child.on("error", (error_) => { clearTimeout(timeout); reject(error_); });
      child.on("close", (code, signal) => {
        clearTimeout(timeout);
        const pageError = /Uncaught (?:TypeError|Error|ReferenceError|SyntaxError)|Failed to resolve module specifier/i.test(stderr);
        const overlayShown = /id="load-error"[^>]*style="[^"]*display:\s*block/i.test(stdout);
        const canvasCreated = /<canvas\b/i.test(stdout);
        const missingMarker = markers.find((marker) => !stdout.includes(marker));
        if (code !== 0 || signal || pageError || overlayShown || (canvas && !canvasCreated) || missingMarker) {
          reject(new Error(`${url}: browser validation failed (exit=${code ?? signal}, canvas=${canvasCreated}, missing=${missingMarker ?? "none"})\n${stderr}\n${stdout.slice(0, 800)}`));
        } else {
          resolve();
        }
      });
    });
  }

  try {
    const address = await service.listen();
    for (const template of templates) {
      const url = `http://127.0.0.1:${address.port}/01_Template_Games/${template}/`;
      await load(url);
      log(`browser ok: ${template}`);
    }
    const decisionFile = pathToFileURL(path.resolve(import.meta.dirname, "../03_AI_Decision_System/decision.html")).href;
    await load(decisionFile, { canvas: false, markers: ["候选 1", "候选 2", "候选 3", "唯一方案"] });
    log("browser ok: decision.html via file://");
    log(`browser smoke ok: ${templates.length} templates + decision tool via ${chrome}`);
  } catch (error_) {
    error(error_.message);
    process.exitCode = 1;
  } finally {
    await service.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
