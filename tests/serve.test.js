import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createStaticServer } from "../scripts/serve.mjs";

function request(port, requestPath, method = "GET") {
  return new Promise((resolve, reject) => {
    const call = http.request({ host: "127.0.0.1", port, path: requestPath, method }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks),
      }));
    });
    call.on("error", reject);
    call.end();
  });
}

test("static server handles MIME, HEAD and method restrictions", async () => {
  const service = createStaticServer({ root: path.resolve(import.meta.dirname, ".."), port: 0 });
  try {
    const address = await service.listen();
    const script = await request(address.port, "/scripts/serve.mjs");
    assert.equal(script.status, 200);
    assert.match(script.headers["content-type"], /^text\/javascript/);
    assert.ok(script.body.length > 0);

    const head = await request(address.port, "/scripts/serve.mjs", "HEAD");
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);

    const post = await request(address.port, "/scripts/serve.mjs", "POST");
    assert.equal(post.status, 405);
    assert.equal(post.headers.allow, "GET, HEAD");
    assert.equal((await request(address.port, "/..%2f..%2fetc%2fpasswd")).status, 403);
  } finally {
    await service.close();
  }
});

test("static server blocks symlinks that escape the root", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-server-"));
  const root = path.join(temporary, "public");
  const outside = path.join(temporary, "secret.txt");
  await import("node:fs/promises").then(({ mkdir }) => mkdir(root));
  await writeFile(path.join(root, "index.html"), "ok");
  await writeFile(outside, "secret");
  await symlink(outside, path.join(root, "escape.txt"));
  const service = createStaticServer({ root, port: 0 });
  try {
    const address = await service.listen();
    assert.equal((await request(address.port, "/")).status, 200);
    assert.equal((await request(address.port, "/escape.txt")).status, 403);
  } finally {
    await service.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
