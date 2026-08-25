import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createGame, TEMPLATES } from "../scripts/create-game.mjs";

const factoryRoot = path.resolve(import.meta.dirname, "..");

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
