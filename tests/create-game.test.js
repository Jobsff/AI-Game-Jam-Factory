import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import test from "node:test";
import { createGame, TEMPLATES } from "../scripts/create-game.mjs";

const factoryRoot = path.resolve(import.meta.dirname, "..");
const createGameScript = path.join(factoryRoot, "scripts", "create-game.mjs");

function spawnCreateGame({ name, slug, output }, env = process.env) {
  return spawn(process.execPath, [
    createGameScript, "--template", TEMPLATES[0], "--name", name, "--slug", slug, "--output", output,
  ], { env });
}

function collectOutput(child) {
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  return new Promise((resolve) => child.on("exit", (code, signal) => resolve({ status: code, signal, stdout, stderr })));
}

async function until(predicate, timeoutMs = 60_000, intervalMs = 15) {
  const deadline = Date.now() + timeoutMs;
  while (!(await predicate())) {
    if (Date.now() > deadline) return false;
    await sleep(intervalMs);
  }
  return true;
}

async function stagingCount(directory, basename) {
  try {
    return (await readdir(directory)).filter((name) => name.startsWith(`.${basename}.factory-`)).length;
  } catch {
    return 0;
  }
}

test("create-game generates every template as a self-contained validated project", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-game-"));
  try {
    for (const [index, template] of TEMPLATES.entries()) {
      const output = path.join(temporary, template);
      const name = index === 0 ? "Stars & <Dreams>" : `Generated ${index + 1}`;
      const slug = `generated-${index + 1}`;
      await createGame({ template, name, slug, output });

      const indexHtml = await readFile(path.join(output, "index.html"), "utf8");
      assert.match(indexHtml, /\.\/vendor\/phaser\.min\.js/);
      assert.match(indexHtml, /"#factory\/":"\.\/02_Game_Core\/"/);
      assert.match(indexHtml, /"#prefabs\/":"\.\/08_Prefab_Library\/"/);
      assert.doesNotMatch(indexHtml, /\.\.\/\.\.\//);
      if (index === 0) assert.match(indexHtml, /<title>Stars &amp; &lt;Dreams&gt;<\/title>/);

      const gameConfig = await readFile(path.join(output, "src/data/gameConfig.js"), "utf8");
      assert.match(gameConfig, new RegExp(`title: ${JSON.stringify(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
      const metadata = JSON.parse(await readFile(path.join(output, "factory.config.json"), "utf8"));
      assert.deepEqual(metadata, { schemaVersion: 1, name, slug, template });

      for (const item of [
        "src/scenes/GameScene.js",
        "02_Game_Core/core/EventBus.js",
        "08_Prefab_Library/prefab.manifest.json",
        "vendor/phaser.min.js",
        "scripts/serve.mjs",
        "scripts/validate-game.mjs",
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
        "package.json",
      ]) assert.ok((await readFile(path.join(output, item))).byteLength > 0, item);

      const validation = spawnSync(process.execPath, ["scripts/validate-game.mjs"], { cwd: output, encoding: "utf8" });
      assert.equal(validation.status, 0, validation.stderr || validation.stdout);
    }
    assert.equal((await readdir(temporary)).some((name) => name.includes(".factory-")), false, "staging directory leaked");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("create-game refuses unsafe or destructive destinations", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-guard-"));
  try {
    const nonEmpty = path.join(temporary, "existing");
    await mkdir(nonEmpty);
    await writeFile(path.join(nonEmpty, "keep.txt"), "keep");
    await assert.rejects(
      createGame({ template: TEMPLATES[0], name: "Overwrite", slug: "overwrite", output: nonEmpty }),
      /拒绝覆盖非空目录/,
    );
    assert.equal(await readFile(path.join(nonEmpty, "keep.txt"), "utf8"), "keep");

    await assert.rejects(
      createGame({ template: TEMPLATES[0], name: "Inside", slug: "inside", output: path.join(factoryRoot, "generated", "inside") }),
      /工厂仓库之外/,
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("concurrent runs on the same pre-existing empty destination keep exactly one winner", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-race-"));
  try {
    const destination = path.join(temporary, "race");
    await mkdir(destination); // pre-existing empty directory: the destructive-concurrency scenario
    const first = spawnCreateGame({ name: "First", slug: "race-first", output: destination });
    const firstDone = collectOutput(first);
    assert.ok(await until(() => stagingCount(temporary, "race").then((count) => count >= 1)), "first run never started staging");
    const second = spawnCreateGame({ name: "Second", slug: "race-second", output: destination });
    const secondDone = collectOutput(second);
    const results = await Promise.all([firstDone, secondDone]);

    const winners = results.filter((result) => result.status === 0);
    const losers = results.filter((result) => result.status !== 0);
    assert.equal(winners.length, 1, JSON.stringify(results.map(({ status, stdout, stderr }) => ({ status, stdout, stderr }))));
    assert.equal(losers.length, 1);

    // Loser: non-zero exit with a single-line readable error. Both interleavings are valid:
    // it may lose the rename race (directory occupied) or see the winner's project (refuse overwrite).
    const loserError = losers[0].stderr.trim();
    assert.ok(loserError.length > 0, "loser must explain the failure");
    assert.match(loserError, /拒绝覆盖非空目录|已保留其内容/);
    assert.equal(loserError.split("\n").length, 1, loserError);

    // Winner: complete project that survives, and matches the process that reported success.
    assert.ok(existsSync(path.join(destination, "index.html")), "winner's project must survive");
    const metadata = JSON.parse(await readFile(path.join(destination, "factory.config.json"), "utf8"));
    assert.ok(["First", "Second"].includes(metadata.name));
    assert.match(winners[0].stdout, /created /);

    assert.equal(await stagingCount(temporary, "race"), 0, "loser must not leak staging");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("a file injected into the empty destination during generation is preserved (TOCTOU)", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-toctou-"));
  try {
    const destination = path.join(temporary, "toctou");
    await mkdir(destination);
    // Injection hook: the self-validation child (cwd = staging) drops a file into the empty
    // destination right before the parent's rmdir/rename takes effect.
    const hook = path.join(temporary, "inject.cjs");
    await writeFile(hook, `
      const fs = require("node:fs");
      const path = require("node:path");
      if (process.argv[1] && process.argv[1].endsWith(path.join("scripts", "validate-game.mjs"))) {
        fs.writeFileSync(path.join(path.resolve(process.cwd(), ".."), "toctou", "injected.txt"), "keep");
      }
    `);
    const result = spawnSync(process.execPath, [
      createGameScript, "--template", TEMPLATES[0], "--name", "Injected", "--slug", "injected", "--output", destination,
    ], { env: { ...process.env, NODE_OPTIONS: `--require ${hook}` }, encoding: "utf8" });

    assert.notEqual(result.status, 0, result.stdout);
    const errorText = result.stderr.trim();
    assert.match(errorText, /已保留其内容/);
    assert.equal(errorText.split("\n").length, 1, errorText);
    assert.equal(await readFile(path.join(destination, "injected.txt"), "utf8"), "keep", "injected file must survive");
    assert.equal(await stagingCount(temporary, "toctou"), 0);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("SIGINT during generation cleans staging and exits 130", async (t) => {
  if (process.platform === "win32") {
    return t.skip("POSIX-only coverage boundary: signals are not reliably deliverable on Windows");
  }
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-sigint-"));
  try {
    const destination = path.join(temporary, "sigint");
    const child = spawnCreateGame({ name: "Interrupted", slug: "interrupted", output: destination });
    const done = collectOutput(child);
    assert.ok(await until(() => stagingCount(temporary, "sigint").then((count) => count >= 1)), "generation never started staging");
    child.kill("SIGINT");
    const exit = await Promise.race([done, sleep(60_000).then(() => null)]);
    assert.ok(exit, "process did not exit after SIGINT");
    assert.equal(exit.status, 130, `status=${exit.status} signal=${exit.signal}`);
    assert.equal(await stagingCount(temporary, "sigint"), 0, "interrupted staging must not leak");
    assert.equal(existsSync(destination), false, "destination must not be created by an interrupted run");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("SIGINT landing between staging mkdir completion and registration still cleans staging", async (t) => {
  if (process.platform === "win32") {
    return t.skip("POSIX-only coverage boundary: signals are not reliably deliverable on Windows");
  }
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-sigint-reg-"));
  try {
    const destination = path.join(temporary, "sigint-reg");
    // Registration-window hook: the staging mkdir succeeds on disk, then the await continuation is
    // "preempted forever" (never-resolving promise, event loop kept alive by the interval) while
    // SIGINT arrives. The signal handler must not observe an unregistered staging directory.
    const hook = path.join(temporary, "preempt.cjs");
    await writeFile(hook, `
      const fsp = require("node:fs/promises");
      const orig = fsp.mkdir.bind(fsp);
      fsp.mkdir = async function (target, options) {
        const result = await orig(target, options);
        if (String(target).includes(".factory-")) {
          const keepAlive = setInterval(() => {}, 5); // 在飞 handle：事件循环活着，信号可送达
          process.kill(process.pid, "SIGINT");
          await new Promise(() => {}); // 模拟 await 续体被抢占后永驻
          void keepAlive;
        }
        return result;
      };
    `);
    const child = spawnCreateGame({ name: "Preempted", slug: "preempted", output: destination }, {
      ...process.env, NODE_OPTIONS: `--require ${hook}`,
    });
    const done = collectOutput(child);
    const exit = await Promise.race([done, sleep(60_000).then(() => null)]);
    assert.ok(exit, "process did not exit after SIGINT");
    assert.equal(exit.status, 130, `status=${exit.status} signal=${exit.signal}`);
    assert.equal(await stagingCount(temporary, "sigint-reg"), 0, "staging visible on disk before registration must still be cleaned");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("late thread-pool write landing after signal cleanup is swept by bounded retry", async (t) => {
  if (process.platform === "win32") {
    return t.skip("POSIX-only coverage boundary: signals are not reliably deliverable on Windows");
  }
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-sigint-late-"));
  try {
    const destination = path.join(temporary, "sigint-late");
    // Late-write hook: the first rmSync targeting staging completes, then an already-dispatched
    // thread-pool write "lands" (the stray file re-creates the directory) before returning.
    // The handler's bounded re-check must remove the residue instead of exiting on top of it.
    const hook = path.join(temporary, "latewrite.cjs");
    await writeFile(hook, `
      const fs = require("node:fs");
      const path = require("node:path");
      const orig = fs.rmSync.bind(fs);
      let injected = false;
      fs.rmSync = function (target, options) {
        const result = orig(target, options);
        if (!injected && String(target).includes(".factory-")) {
          injected = true; // 仅首次注入
          fs.mkdirSync(String(target), { recursive: true });
          fs.writeFileSync(path.join(String(target), "stray-late-write.txt"), "late");
          // 同步写标记：测试据此区分"注入没跑"（钩子在本平台失效）与"清理失败"（残留真实存在）
          fs.writeFileSync(path.join(path.dirname(String(target)), "INJECTED.marker"), "late-write hook fired");
        }
        return result;
      };
    `);
    const child = spawnCreateGame({ name: "Late", slug: "late", output: destination }, {
      ...process.env, NODE_OPTIONS: `--require ${hook}`,
    });
    const done = collectOutput(child);
    assert.ok(await until(() => stagingCount(temporary, "sigint-late").then((count) => count >= 1)), "generation never started staging");
    child.kill("SIGINT");
    const exit = await Promise.race([done, sleep(60_000).then(() => null)]);
    assert.ok(exit, "process did not exit after SIGINT");
    assert.equal(exit.status, 130, `status=${exit.status} signal=${exit.signal}`);
    assert.ok(existsSync(path.join(temporary, "INJECTED.marker")), "injection never ran — hook ineffective on this platform");
    let residueDetail = "";
    const residue = await stagingCount(temporary, "sigint-late");
    if (residue > 0) {
      const leftovers = [];
      for (const name of await readdir(temporary)) {
        if (!name.includes(".factory-")) continue;
        let inner = ["<unreadable>"];
        try { inner = await readdir(path.join(temporary, name)); } catch {}
        leftovers.push({ dir: name, entries: inner, stray: inner.includes("stray-late-write.txt"), sentinel: inner.includes(".factory-staging.json") });
      }
      residueDetail = ` residue entries: ${JSON.stringify(leftovers)} childStderr: ${JSON.stringify((exit.stderr ?? "").slice(-500))}`;
    }
    assert.equal(residue, 0, `stray write landing after cleanup must be re-swept, not leaked${residueDetail}`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("stale staging sweep removes only sentinel-marked leftovers of dead processes", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-sweep-"));
  try {
    const destination = path.join(temporary, "sweep");
    const dead = spawnSync(process.execPath, ["-e", ""]);
    assert.equal(dead.status, 0);
    assert.ok(Number.isInteger(dead.pid) && dead.pid > 0, "need a pid that is no longer alive");

    const stale = path.join(temporary, `.sweep.factory-${randomUUID()}`);
    await mkdir(stale);
    await writeFile(path.join(stale, ".factory-staging.json"), `${JSON.stringify({ pid: dead.pid })}\n`);
    const keeperNoSentinel = path.join(temporary, `.sweep.factory-${randomUUID()}`);
    await mkdir(keeperNoSentinel);
    await writeFile(path.join(keeperNoSentinel, "user.txt"), "keep");
    const keeperBadUuid = path.join(temporary, ".sweep.factory-not-a-uuid");
    await mkdir(keeperBadUuid);
    await writeFile(path.join(keeperBadUuid, "user.txt"), "keep");

    await createGame({ template: TEMPLATES[0], name: "Sweep", slug: "sweep", output: destination });

    assert.equal(existsSync(stale), false, "sentinel-marked stale staging of a dead pid should be reclaimed");
    assert.equal(await readFile(path.join(keeperNoSentinel, "user.txt"), "utf8"), "keep", "same shape without sentinel must survive");
    assert.equal(await readFile(path.join(keeperBadUuid, "user.txt"), "utf8"), "keep", "name not matching the strict uuid pattern must survive");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("failed generation rolls back the ancestor directories it created", async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-rollback-"));
  try {
    const destination = path.join(temporary, "deep", "deeper", "game");
    // Sabotage hook: forces the self-validation child to fail without touching behavior.
    const hook = path.join(temporary, "sabotage.cjs");
    await writeFile(hook, `
      if (process.argv[1] && process.argv[1].includes("validate-game.mjs")) {
        process.exitCode = 1;
      }
    `);
    const result = spawnSync(process.execPath, [
      createGameScript, "--template", TEMPLATES[0], "--name", "Rollback", "--slug", "rollback", "--output", destination,
    ], { env: { ...process.env, NODE_OPTIONS: `--require ${hook}` }, encoding: "utf8" });

    assert.equal(result.status, 1, result.stderr);
    assert.equal(existsSync(path.join(temporary, "deep")), false, "created ancestor chain should be rolled back");
    assert.equal((await readdir(temporary)).some((name) => name.includes(".factory-")), false, "no staging residue");
    assert.ok(existsSync(temporary), "pre-existing nearest ancestor must survive");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("outputs whose ancestor physically resolves into the factory root are rejected", async (t) => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), "factory-create-symlink-"));
  try {
    const link = path.join(temporary, "factory-link");
    try {
      await symlink(factoryRoot, link);
    } catch (error) {
      if (error?.code === "EPERM" || error?.code === "EACCES") {
        return t.skip("symlink creation requires privileges on this platform");
      }
      throw error;
    }
    const target = path.join(link, "physically-inside");
    // Pure-function seam: the physical guard must exist and reject, without triggering any write.
    const { assertOutputOutsideFactory } = await import("../scripts/create-game.mjs");
    assert.equal(typeof assertOutputOutsideFactory, "function", "physical guard export is missing");
    await assert.rejects(assertOutputOutsideFactory(target), /工厂仓库之外/);
    // Integration: createGame must reject the same path without writing anything into the factory.
    await assert.rejects(
      createGame({ template: TEMPLATES[0], name: "Inside Link", slug: "inside-link", output: target }),
      /工厂仓库之外/,
    );
    assert.equal(existsSync(path.join(factoryRoot, "physically-inside")), false);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
