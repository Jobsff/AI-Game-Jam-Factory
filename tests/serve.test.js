import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import { mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import test from "node:test";
import { createStaticServer } from "../scripts/serve.mjs";

const serveScript = path.resolve(import.meta.dirname, "../scripts/serve.mjs");

async function until(predicate, timeoutMs = 30_000, intervalMs = 25) {
  const deadline = Date.now() + timeoutMs;
  while (!(await predicate())) {
    if (Date.now() > deadline) return false;
    await sleep(intervalMs);
  }
  return true;
}

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

test("static server blocks symlinks that escape the root", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-server-"));
  const root = path.join(temporary, "public");
  const outside = path.join(temporary, "secret.txt");
  await import("node:fs/promises").then(({ mkdir }) => mkdir(root));
  await writeFile(path.join(root, "index.html"), "ok");
  await writeFile(outside, "secret");
  try {
    await symlink(outside, path.join(root, "escape.txt"));
  } catch (error) {
    if (error?.code === "EPERM" || error?.code === "EACCES") {
      await rm(temporary, { recursive: true, force: true });
      return t.skip("symlink creation requires privileges on this platform");
    }
    throw error;
  }
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

test("serve CLI fails fast on a missing root without printing a success banner", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-serve-missing-"));
  await rm(temporary, { recursive: true, force: true }); // a path that is guaranteed not to exist
  const result = spawnSync(process.execPath, [serveScript, temporary], { encoding: "utf8" });
  assert.equal(result.status, 1, result.stderr);
  assert.ok(!result.stdout.includes("Factory server:"), result.stdout);
  const errorText = result.stderr.trim();
  assert.ok(errorText.length > 0, "a single-line error is expected");
  assert.equal(errorText.split("\n").length, 1, errorText);
});

test("programmatic listen() rejects cleanly when the root does not exist", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-serve-reject-"));
  await rm(temporary, { recursive: true, force: true });
  const service = createStaticServer({ root: temporary, port: 0 });
  await assert.rejects(service.listen(), /ENOENT/);
  await service.close();
});

test("serve CLI fails fast with a single-line error when PORT is not a valid port", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-serve-badport-"));
  try {
    const result = spawnSync(process.execPath, [serveScript, temporary], {
      encoding: "utf8",
      env: { ...process.env, PORT: "abc" },
    });
    assert.equal(result.status, 1, result.stderr);
    assert.ok(!result.stdout.includes("Factory server:"), result.stdout);
    const errorText = result.stderr.trim();
    assert.match(errorText, /port/i);
    assert.equal(errorText.split("\n").length, 1, `stderr must be a single line, got:\n${result.stderr}`);
    assert.ok(!result.stderr.includes("at "), `stderr must not contain stack frames, got:\n${result.stderr}`);
    assert.ok(!result.stderr.includes(serveScript), `stderr must not leak file paths, got:\n${result.stderr}`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("serve CLI banner reports the actually bound port when PORT=0", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-serve-port0-"));
  let child;
  try {
    await writeFile(path.join(temporary, "index.html"), "<!doctype html><title>ok</title>");
    child = spawn(process.execPath, [serveScript, temporary], {
      env: { ...process.env, PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    assert.ok(await until(() => /Factory server: http:\/\/\S+:(\d+)\//.test(stdout)), stdout);
    const port = Number(stdout.match(/Factory server: http:\/\/\S+:(\d+)\//)[1]);
    assert.ok(port > 0, `banner must show the actually bound port, got: ${stdout.trim()}`);
    assert.equal((await request(port, "/")).status, 200);
  } finally {
    if (child) {
      child.kill("SIGTERM");
      await new Promise((resolve) => child.on("exit", resolve));
    }
    await rm(temporary, { recursive: true, force: true });
  }
});
