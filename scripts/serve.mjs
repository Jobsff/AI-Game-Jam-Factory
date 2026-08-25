import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const MIME = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".woff2": "font/woff2",
});

function isInside(base, candidate) {
  return candidate === base || candidate.startsWith(`${base}${path.sep}`);
}

function sendText(response, statusCode, text, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  });
  response.end(text);
}

export function createStaticServer({ root = process.cwd(), host = "127.0.0.1", port = 4173 } = {}) {
  if (typeof host !== "string" || !host) throw new TypeError("host must be a non-empty string");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new RangeError("port must be an integer between 0 and 65535");

  const base = path.resolve(root);
  const canonicalBase = realpath(base);
  const server = createServer(async (request, response) => {
    if (!new Set(["GET", "HEAD"]).has(request.method)) {
      sendText(response, 405, "Method Not Allowed", { Allow: "GET, HEAD" });
      return;
    }

    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (pathname.includes("\0")) throw new URIError("null byte in path");
      const candidate = path.resolve(base, `.${pathname}`);
      if (!isInside(base, candidate)) {
        sendText(response, 403, "Forbidden");
        return;
      }

      let file = candidate;
      let info = await stat(file);
      if (info.isDirectory()) {
        file = path.join(file, "index.html");
        info = await stat(file);
      }
      if (!info.isFile()) throw Object.assign(new Error("Not found"), { code: "ENOENT" });

      const [realBase, realFile] = await Promise.all([canonicalBase, realpath(file)]);
      if (!isInside(realBase, realFile)) {
        sendText(response, 403, "Forbidden");
        return;
      }

      response.writeHead(200, {
        "Content-Type": MIME[path.extname(realFile).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": info.size,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(realFile).on("error", () => response.destroy()).pipe(response);
    } catch (error) {
      const statusCode = ["ENOENT", "ENOTDIR"].includes(error.code)
        ? 404
        : error instanceof URIError || error.code === "ERR_INVALID_ARG_VALUE"
          ? 400
          : 500;
      sendText(response, statusCode, statusCode === 404 ? "Not Found" : statusCode === 400 ? "Bad Request" : "Internal Server Error");
    }
  });

  return {
    server,
    listen: () => new Promise((resolve, reject) => {
      const onError = (error) => reject(error);
      server.once("error", onError);
      server.listen(port, host, () => {
        server.off("error", onError);
        resolve(server.address());
      });
    }),
    close: () => new Promise((resolve, reject) => {
      if (!server.listening) { resolve(); return; }
      server.close((error) => error ? reject(error) : resolve());
    }),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] ?? process.cwd());
  const host = process.env.HOST ?? "127.0.0.1";
  const port = Number(process.env.PORT ?? 4173);
  const service = createStaticServer({ root, host, port });
  service.listen()
    .then(() => console.log(`Factory server: http://${host}:${port}/\nRoot: ${root}`))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
