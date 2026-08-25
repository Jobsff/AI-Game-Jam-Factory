import path from "node:path";
import process from "node:process";
import { createStaticServer } from "./serve.mjs";

const templates = ["template_collect_create", "template_defense", "template_choice", "template_action", "template_find"];
const paths = [
  "/", "/README.md", "/00_Command_Center/60_MINUTE_DECISION_SOP.md", "/04_Prompt_Library/PROMPT_INDEX.md",
  "/06_GameJam_Checklist/README.md", "/03_AI_Decision_System/decision.html",
  "/03_AI_Decision_System/data/theme-map.json", "/03_AI_Decision_System/data/templates.json",
  "/03_AI_Decision_System/data/scoring-model.json", "/vendor/phaser.min.js",
  ...templates.flatMap((name) => [`/01_Template_Games/${name}/`, `/01_Template_Games/${name}/src/main.js`, `/01_Template_Games/${name}/src/scenes/GameScene.js`]),
];
const service = createStaticServer({ root: path.resolve(import.meta.dirname, ".."), port: 0 });
try {
  const address = await service.listen(); const origin = `http://127.0.0.1:${address.port}`;
  for (const pathname of paths) { const response = await fetch(`${origin}${pathname}`); const body = await response.arrayBuffer(); if (response.status !== 200 || body.byteLength === 0) throw new Error(`${pathname}: HTTP ${response.status}, ${body.byteLength} bytes`); console.log(`200 ${pathname} ${body.byteLength} bytes`); }
  console.log(`smoke ok: ${paths.length} offline resources`);
} catch (error) { console.error(error.message); process.exitCode = 1; } finally { await service.close(); }
