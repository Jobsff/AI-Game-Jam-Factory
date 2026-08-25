import { spawn } from "node:child_process";
import { access, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { createStaticServer } from "./serve.mjs";

async function exists(file) {
  return access(file).then(() => true, () => false);
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

const candidates = [
  process.env.CHROME_BIN,
  await findCachedHeadlessShell(),
  ...(process.platform === "darwin"
    ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"]
    : ["google-chrome", "chromium", "chromium-browser"]),
].filter(Boolean);

let chrome = null;
for (const candidate of candidates) {
  if (!candidate.includes(path.sep) || await exists(candidate)) { chrome = candidate; break; }
}
if (!chrome) {
  console.log("browser smoke skipped: no Chrome/headless-shell binary found");
  process.exit(0);
}

const service = createStaticServer({ root: path.resolve(import.meta.dirname, ".."), port: 0 });
const templates = ["template_collect_create", "template_defense", "template_choice", "template_action", "template_find"];

function load(url, { canvas = true, markers = [] } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
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
    const timeout = setTimeout(() => child.kill("SIGKILL"), 12_000);
    child.stdout.on("data", (data) => { stdout += data; });
    child.stderr.on("data", (data) => { stderr += data; });
    child.on("error", (error) => { clearTimeout(timeout); reject(error); });
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
    console.log(`browser ok: ${template}`);
  }
  const decisionFile = pathToFileURL(path.resolve(import.meta.dirname, "../03_AI_Decision_System/decision.html")).href;
  await load(decisionFile, { canvas: false, markers: ["候选 1", "候选 2", "候选 3", "唯一方案"] });
  console.log("browser ok: decision.html via file://");
  console.log(`browser smoke ok: ${templates.length} templates + decision tool via ${chrome}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await service.close();
}
