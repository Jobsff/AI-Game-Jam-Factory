import { readFile, readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, ".."); const errors = [];
const prefabs = [["mechanic-prefabs","click","Clickable.js"],["mechanic-prefabs","drag","Draggable.js"],["mechanic-prefabs","merge","Merge.js"],["mechanic-prefabs","timer","CountdownTimer.js"],["mechanic-prefabs","spawn","Spawner.js"],["system-prefabs","score","ScoreSystem.js"],["system-prefabs","health","HealthSystem.js"],["system-prefabs","state-machine","StateMachine.js"],["presentation-prefabs","button","UIButton.js"],["presentation-prefabs","popup","Popup.js"],["presentation-prefabs","dialog","DialogBox.js"]];
const templates = ["template_collect_create","template_defense","template_choice","template_action","template_find"];
const required = ["index.html","README.md","src/main.js","src/config.js","src/events.js","src/data/gameConfig.js","src/scenes/BootScene.js","src/scenes/GameScene.js","src/scenes/UIScene.js"];
async function filesUnder(directory) { const result=[]; let entries; try { entries=await readdir(directory,{withFileTypes:true}); } catch(error) { errors.push(`unreadable directory: ${path.relative(root,directory)}: ${error.message}`); return result; } for (const entry of entries) { if ([".git","node_modules",".verification"].includes(entry.name)) continue; const file=path.join(directory,entry.name); if(entry.isDirectory()) result.push(...await filesUnder(file)); else result.push(file); } return result; }
async function source(file) { try { return await readFile(file,"utf8"); } catch { errors.push(`missing: ${path.relative(root,file)}`); return ""; } }

for (const [layer,id,entry] of prefabs) { const directory=path.join(root,"08_Prefab_Library",layer,id); for(const file of [entry,"README.md","CONTRACT.md","PROMPT.md"]) await source(path.join(directory,file)); try { const module=await import(pathToFileURL(path.join(directory,entry))); const eventExports=Object.keys(module).filter((name)=>name.endsWith("_EVENTS")); const classExports=Object.entries(module).filter(([name,value])=>name!=="default"&&!name.endsWith("_EVENTS")&&typeof value==="function"); if(typeof module.default!=="function") errors.push(`missing default class export: ${layer}/${id}/${entry}`); if(eventExports.length!==1) errors.push(`expected one event constants export: ${layer}/${id}/${entry}`); if(classExports.length!==1||classExports[0][1]!==module.default) errors.push(`named/default main class mismatch: ${layer}/${id}/${entry}`); } catch(error) { errors.push(`module import failed: ${layer}/${id}/${entry}: ${error.message}`); } }
try { const manifest=JSON.parse(await readFile(path.join(root,"08_Prefab_Library/prefab.manifest.json"),"utf8")); if(manifest.prefabs?.length!==prefabs.length) errors.push(`manifest must contain ${prefabs.length} prefabs`); for(const prefab of manifest.prefabs??[]) { if(prefab.status!=="verified") errors.push(`manifest status is not verified: ${prefab.id}`); const entry=path.resolve(root,"08_Prefab_Library",prefab.entry); if(!entry.startsWith(path.join(root,"08_Prefab_Library")+path.sep)) errors.push(`manifest entry escapes library: ${prefab.entry}`); else await stat(entry).catch(()=>errors.push(`manifest entry missing: ${prefab.entry}`)); } } catch(error) { errors.push(`manifest validation failed: ${error.message}`); }
for (const template of templates) { const directory=path.join(root,"01_Template_Games",template); for(const file of required) await source(path.join(directory,file)); const html=await source(path.join(directory,"index.html")); const game=await source(path.join(directory,"src/scenes/GameScene.js")); const ui=await source(path.join(directory,"src/scenes/UIScene.js")); const boot=await source(path.join(directory,"src/scenes/BootScene.js")); const config=await source(path.join(directory,"src/config.js")); if(!html.includes('"#factory/":"../../02_Game_Core/"')||!html.includes('"#prefabs/":"../../08_Prefab_Library/"')) errors.push(`${template}: invalid import map`); for(const marker of ["../../vendor/phaser.min.js","phaser@3.90.0","touch-action:none","load-error"]) if(!html.includes(marker)) errors.push(`${template}: index missing ${marker}`); for(const marker of ["width: 720","height: 1280","Phaser.Scale.FIT","Phaser.Scale.CENTER_BOTH"]) if(!config.includes(marker)) errors.push(`${template}: config missing ${marker}`); if(!boot.includes("generateTexture")) errors.push(`${template}: BootScene must generate textures`); if(!game.includes("#prefabs/")) errors.push(`${template}: GameScene must use prefabs`); if(!game.includes("Phaser.Scenes.Events.SHUTDOWN")||!game.includes("shutdown()")||!game.includes(".destroy()")) errors.push(`${template}: GameScene cleanup incomplete`); if(!ui.includes("Phaser.Scenes.Events.SHUTDOWN")||!ui.includes("offHud()")||!ui.includes("offResult()")) errors.push(`${template}: UIScene cleanup incomplete`); const states=template==="template_choice"?["CHOOSING","RESOLVING","ENDING"]:["READY","PLAYING","WIN","FAIL"]; for(const state of states) if(!game.includes(state)) errors.push(`${template}: missing state ${state}`); }
const files=await filesUnder(root);
for(const file of files.filter((file)=>/\.(?:js|mjs)$/.test(file))) { const checked=spawnSync(process.execPath,["--check",file],{encoding:"utf8"}); if(checked.status!==0) errors.push(`syntax error: ${path.relative(root,file)}\n${checked.stderr.trim()}`); }
for(const file of files.filter((file)=>file.endsWith(".json"))) { try { JSON.parse(await readFile(file,"utf8")); } catch(error) { errors.push(`invalid JSON: ${path.relative(root,file)}: ${error.message}`); } }
try {
  const phaser = await readFile(path.join(root, "vendor/phaser.min.js"));
  const hash = createHash("sha256").update(phaser).digest("hex");
  if (hash !== "e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7") errors.push(`vendor/phaser.min.js SHA-256 mismatch: ${hash}`);
} catch (error) { errors.push(`Phaser hash validation failed: ${error.message}`); }

// Phase 3 delivery gates: internal links, decision data parity, prompt contracts and checklists.
async function validateLink(sourceFile, rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "").split("#")[0].split("?")[0];
  if (!target || /^(?:[a-z]+:|\/\/)/i.test(target) || target.includes("{{")) return;
  let decoded;
  try { decoded = decodeURIComponent(target); } catch { errors.push(`invalid link encoding: ${path.relative(root, sourceFile)} -> ${rawTarget}`); return; }
  const resolved = path.resolve(path.dirname(sourceFile), decoded);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) { errors.push(`internal link escapes repository: ${path.relative(root, sourceFile)} -> ${rawTarget}`); return; }
  await stat(resolved).catch(() => errors.push(`broken internal link: ${path.relative(root, sourceFile)} -> ${rawTarget}`));
}
for (const file of files.filter((candidate) => candidate.endsWith(".md"))) {
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) await validateLink(file, match[1]);
}
for (const file of [path.join(root, "index.html"), path.join(root, "03_AI_Decision_System/decision.html")]) {
  const text = await source(file);
  for (const match of text.matchAll(/\bhref=["']([^"']+)["']/g)) await validateLink(file, match[1]);
}

const promptRoot = path.join(root, "04_Prompt_Library");
const promptFiles = (await filesUnder(promptRoot)).filter((file) => file.endsWith(".md") && path.basename(file) !== "PROMPT_INDEX.md");
if (promptFiles.length !== 27) errors.push(`prompt library must contain 27 prompts, found ${promptFiles.length}`);
for (const file of promptFiles) {
  const text = await source(file);
  for (const marker of ["## 变量区（复制后填写）", "## 不可违反约束", "## 可直接使用的 Prompt", "## 固定输出格式", "PROMPT_ID:", "{{THEME}}", "{{CONTEXT}}", "【自检清单】"])
    if (!text.includes(marker)) errors.push(`prompt fixed field missing: ${path.relative(root, file)} -> ${marker}`);
}
const promptIndex = await source(path.join(promptRoot, "PROMPT_INDEX.md"));
for (const file of promptFiles) if (!promptIndex.includes(path.relative(promptRoot, file).split(path.sep).join("/"))) errors.push(`prompt not indexed: ${path.relative(promptRoot, file)}`);

const checklistFiles = ["before-start.md", "development.md", "submission.md", "presentation.md"];
for (const name of checklistFiles) {
  const text = await source(path.join(root, "06_GameJam_Checklist", name));
  if (!text.includes("- [ ]")) errors.push(`checklist has no actionable checkbox: ${name}`);
}

for (const [elementId, jsonName] of [["theme-map-data", "theme-map.json"], ["templates-data", "templates.json"], ["scoring-model-data", "scoring-model.json"]]) {
  const html = await source(path.join(root, "03_AI_Decision_System/decision.html"));
  const match = html.match(new RegExp(`<script id=["']${elementId}["'] type=["']application/json["']>([^<]+)<\\/script>`));
  if (!match) { errors.push(`decision embedded data missing: ${elementId}`); continue; }
  try {
    const embedded = JSON.parse(match[1]);
    const external = JSON.parse(await source(path.join(root, "03_AI_Decision_System/data", jsonName)));
    if (JSON.stringify(embedded) !== JSON.stringify(external)) errors.push(`decision embedded data differs from data/${jsonName}`);
  } catch (error) { errors.push(`decision data invalid: ${elementId}: ${error.message}`); }
}
try {
  const spriteManifest = JSON.parse(await source(path.join(root, "05_AI_Assets/sprite-manifest.json")));
  if (!Array.isArray(spriteManifest.assets) || !spriteManifest.assets.length) errors.push("sprite manifest must contain an assets array");
} catch {}
for (const requiredFile of [
  "AGENTS.md", "THIRD_PARTY_NOTICES.md", ".github/workflows/validate.yml",
  "00_Command_Center/60_MINUTE_DECISION_SOP.md", "00_Command_Center/templates/GDD_TEMPLATE.md",
  "00_Command_Center/templates/TDD_TEMPLATE.md", "00_Command_Center/templates/GAME_MAP_TEMPLATE.md",
  "05_AI_Assets/STYLE_BIBLE_TEMPLATE.md", "05_AI_Assets/SFX_CUE_SHEET.csv",
  "07_Examples/theme-to-prefab-recipes.md",
]) await source(path.join(root, requiredFile));
for(const file of files.filter((file)=>/\.(?:js|mjs)$/.test(file))) { const text=await readFile(file,"utf8"); if(!file.includes(`${path.sep}scripts${path.sep}`)&&!file.includes(`${path.sep}tests${path.sep}`)) for(const match of text.matchAll(/(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g)) { const specifier=match[1]; if(!specifier.startsWith(".")&&!specifier.startsWith("#factory/")&&!specifier.startsWith("#prefabs/")) errors.push(`runtime npm import forbidden: ${path.relative(root,file)} -> ${specifier}`); } }
if(errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`validate ok: ${prefabs.length} prefabs, ${templates.length} templates, ${files.filter((file)=>/\.(?:js|mjs)$/.test(file)).length} scripts`);
