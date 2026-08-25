import { access, cp, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const TEMPLATES = Object.freeze([
  "template_collect_create",
  "template_defense",
  "template_choice",
  "template_action",
  "template_find",
]);

const factoryRoot = path.resolve(import.meta.dirname, "..");

function parseArguments(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    const value = values[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(`参数必须成对提供：${key ?? "<empty>"}`);
    }
    result[key.slice(2)] = value;
  }
  return result;
}

async function exists(candidate) {
  return access(candidate).then(() => true, () => false);
}

async function isNonEmpty(directory) {
  try { return (await readdir(directory)).length > 0; }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function replaceTitle(source, name) {
  const replacement = `title: ${JSON.stringify(name)}`;
  if (!/title:\s*"[^"]*"/.test(source)) throw new Error("模板 gameConfig.js 缺少 title 字段");
  return source.replace(/title:\s*"[^"]*"/, replacement);
}

export async function createGame({ template, name, slug, output }) {
  if (!TEMPLATES.includes(template)) throw new Error(`未知模板：${template}`);
  const cleanName = name?.trim();
  if (!cleanName) throw new Error("--name 不能为空");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? "")) throw new Error("--slug 必须是小写 kebab-case");
  if (!output) throw new Error("缺少 --output");

  const destination = path.resolve(output);
  if (destination === factoryRoot || destination.startsWith(`${factoryRoot}${path.sep}`)) {
    throw new Error("--output 必须位于工厂仓库之外，避免递归复制和误提交生成物");
  }
  if (await isNonEmpty(destination)) throw new Error(`拒绝覆盖非空目录：${destination}`);

  const templateRoot = path.join(factoryRoot, "01_Template_Games", template);
  await access(templateRoot);
  await mkdir(path.dirname(destination), { recursive: true });
  const staging = path.join(path.dirname(destination), `.${path.basename(destination)}.factory-${randomUUID()}`);
  const destinationExisted = await exists(destination);

  try {
    await mkdir(staging, { recursive: true });
    await Promise.all([
      cp(templateRoot, staging, { recursive: true }),
      cp(path.join(factoryRoot, "02_Game_Core"), path.join(staging, "02_Game_Core"), { recursive: true }),
      cp(path.join(factoryRoot, "08_Prefab_Library"), path.join(staging, "08_Prefab_Library"), { recursive: true }),
      cp(path.join(factoryRoot, "vendor"), path.join(staging, "vendor"), { recursive: true }),
      cp(path.join(factoryRoot, "AGENTS.md"), path.join(staging, "AGENTS.md")),
      cp(path.join(factoryRoot, "THIRD_PARTY_NOTICES.md"), path.join(staging, "THIRD_PARTY_NOTICES.md")),
      cp(path.join(factoryRoot, "00_Command_Center", "templates"), path.join(staging, "00_Command_Center", "templates"), { recursive: true }),
      cp(path.join(factoryRoot, "00_Command_Center", "OPEN_SOURCE_POLICY.md"), path.join(staging, "00_Command_Center", "OPEN_SOURCE_POLICY.md")),
      cp(path.join(factoryRoot, "06_GameJam_Checklist"), path.join(staging, "06_GameJam_Checklist"), { recursive: true }),
      mkdir(path.join(staging, "scripts"), { recursive: true }),
      mkdir(path.join(staging, "docs"), { recursive: true }),
    ]);

    await Promise.all(["serve.mjs", "cache-phaser.mjs", "validate-game.mjs"].map((file) =>
      cp(path.join(factoryRoot, "scripts", file), path.join(staging, "scripts", file))));

    const controlTemplates = path.join(factoryRoot, "00_Command_Center", "templates");
    await Promise.all([
      cp(path.join(controlTemplates, "GDD_TEMPLATE.md"), path.join(staging, "GDD.md")),
      cp(path.join(controlTemplates, "TDD_TEMPLATE.md"), path.join(staging, "TDD.md")),
      cp(path.join(controlTemplates, "GAME_MAP_TEMPLATE.md"), path.join(staging, "GAME_MAP.md")),
      cp(path.join(controlTemplates, "MODULE_CONTRACT_TEMPLATE.md"), path.join(staging, "docs", "MODULE_CONTRACT.md")),
      cp(path.join(controlTemplates, "DEBUG_REPORT_TEMPLATE.md"), path.join(staging, "docs", "DEBUG_REPORT.md")),
      cp(path.join(controlTemplates, "AI_USAGE_LOG_TEMPLATE.md"), path.join(staging, "docs", "AI_USAGE_LOG.md")),
      cp(path.join(controlTemplates, "CHILD_CONTRIBUTION_LOG_TEMPLATE.md"), path.join(staging, "docs", "CHILD_CONTRIBUTION_LOG.md")),
    ]);

    const indexPath = path.join(staging, "index.html");
    const index = (await readFile(indexPath, "utf8"))
      .replaceAll("../../02_Game_Core/", "./02_Game_Core/")
      .replaceAll("../../08_Prefab_Library/", "./08_Prefab_Library/")
      .replaceAll("../../vendor/phaser.min.js", "./vendor/phaser.min.js")
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(cleanName)}</title>`);
    await writeFile(indexPath, index);

    const configPath = path.join(staging, "src", "data", "gameConfig.js");
    await writeFile(configPath, replaceTitle(await readFile(configPath, "utf8"), cleanName));

    const templateReadme = await readFile(path.join(staging, "README.md"), "utf8");
    await writeFile(path.join(staging, "README.md"), `# ${cleanName}\n\n由 \`${template}\` 生成。先填写 \`GDD.md\`、\`TDD.md\`、\`GAME_MAP.md\` 与 \`docs/MODULE_CONTRACT.md\`，Codex 必须遵守根目录 \`AGENTS.md\`。AI 使用和儿童贡献分别记录在 \`docs/AI_USAGE_LOG.md\` 与 \`docs/CHILD_CONTRIBUTION_LOG.md\`。\n\n## 本地运行\n\n\`npm run serve\`，然后访问 \`http://localhost:4173/\`。\n\n## 验证\n\n\`npm run validate\`\n\n---\n\n${templateReadme}`);
    await writeFile(path.join(staging, "factory.config.json"), `${JSON.stringify({ schemaVersion: 1, name: cleanName, slug, template }, null, 2)}\n`);
    await writeFile(path.join(staging, "package.json"), `${JSON.stringify({
      name: slug,
      private: true,
      type: "module",
      scripts: {
        serve: "node scripts/serve.mjs",
        validate: "node scripts/validate-game.mjs",
        "cache-phaser": "node scripts/cache-phaser.mjs",
      },
      imports: {
        "#factory/*": "./02_Game_Core/*",
        "#prefabs/*": "./08_Prefab_Library/*",
      },
    }, null, 2)}\n`);

    const validation = spawnSync(process.execPath, ["scripts/validate-game.mjs"], {
      cwd: staging,
      encoding: "utf8",
    });
    if (validation.status !== 0) {
      throw new Error(`生成工程验证失败：\n${validation.stderr || validation.stdout || `exit ${validation.status}`}`);
    }

    if (destinationExisted) await rm(destination, { recursive: true, force: true });
    await rename(staging, destination);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }

  console.log(`created ${cleanName} (${slug}) from ${template}: ${destination}`);
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArguments(process.argv.slice(2));
  createGame(args).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
