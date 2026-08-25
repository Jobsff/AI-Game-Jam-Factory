# KK3 初审报告 — CLI 脚本仓库根目录解析审查

- 审查角色：KK3（只读架构审查）
- 日期：2026-08-25
- 仓库：/Users/jobsff/code/ai-game-jam-factory @ main b639cf7（工作区含未提交改动）
- 审查范围：scripts/ 全部 7 个脚本、tests/ 全部 8 个文件、package.json、README.md、AGENTS.md、.github/workflows/validate.yml

## 执行摘要

- 已复现并确认用户报告：`scripts/validate.mjs:8` 的 `const root = process.cwd();` 是仓库内唯一用调用者 cwd 当仓库根的工厂自检脚本。从非仓库目录直接 `node scripts/validate.mjs` 会以未捕获的 `ENOENT ... scandir '<cwd>/04_Prompt_Library'` 崩溃（validate.mjs:47 → :12），exit 1、输出原始堆栈——与用户报告的 `.../@wonderwhy-er/desktop-commander/dist/04_Prompt_Library` 现象完全同构。
- 其余 6 个脚本中，4 个工厂侧脚本已用 `import.meta.dirname` 定位仓库根（实测 smoke.mjs 从外部 cwd 运行 exit 0）；`serve.mjs` 与 `validate-game.mjs` 的 cwd 回退是合理语义，不应改动。
- README / package.json / CI 三者相互一致（都经由 npm 或先 cd），没有任何文档承诺"任意 cwd 可调用"——矛盾是内部的：validate.mjs 与其 4 个兄弟脚本行为不一致。且 `scripts/` 整目录尚未提交，不存在"有意设计"的历史证据。
- 本轮唯一推荐修复：validate.mjs 第 8 行改为 `path.resolve(import.meta.dirname, "..")`（一行、一文件），外加一个新增测试文件。共 2 文件。
- 附带发现：工厂仓库根缺 `GDD.md`/`TDD.md`/`GAME_MAP.md`（AGENTS.md 要求"缺失就先报告"）；本角色只读，不补齐，留人类决定。

## 三层地图

1. 体验地图（CLI 用户视角）
   - 入口：`npm test` / `npm run validate` / `npm run smoke` / `npm run browser-smoke` / `npm run verify`（package.json:5-14）、`npm run new-game`、`npm run serve`；CI 三个门槛（validate.yml:19-24）。
   - 现状：npm 与 CI 路径全部正常（npm 把 cwd 钉在 package.json 所在目录）；唯一直接 `node scripts/validate.mjs` 且 cwd 不在仓库根时，用户看到一段指向陌生目录的 ENOENT 堆栈，无法自诊。
   - 异常路径对比：validate-game.mjs 在外部 cwd 输出 `missing index.html` 等可读清单后 exit 1（良好示范）；validate.mjs 是原始崩溃（差示范）。
2. 运行地图（CLI 流程与状态）
   - 三条调用链：(a) `npm run validate` → cwd=包根 → root 正确；(b) 直接 `node scripts/validate.mjs` → cwd=调用者目录 → root 错误；(c) CI checkout 后 `npm run validate` → 同 (a)。
   - 故障点：`filesUnder(promptRoot)`（:47，promptRoot 在 :46 由 root 拼出）对不存在目录的 `readdir` 无 try/catch（对比 validate-game.mjs:15-17 有捕获），顶层未处理拒绝导致 :85 的聚合错误清单永远打印不出来。
   - 附带危害：:18 `filesUnder(root)` 会递归扫描整个 cwd 树（仅排除 .git/node_modules/.verification）。从家目录等大盘目录误跑时，会对全树每个 js/mjs spawn `node --check`——只读但慢且惊吓。修复后此危害消除。
3. 实现地图（模块与所有权）
   - 工厂仓库自检（根=工厂仓库，不分发）：validate.mjs（:8 用 cwd——异常点）、smoke.mjs:13、browser-smoke.mjs:52,99、create-game.mjs:16、cache-phaser.mjs:8（均 import.meta.dirname 派生）。
   - 随生成工程分发（根=生成工程根）：validate-game.mjs、serve.mjs、cache-phaser.mjs（由 create-game.mjs:85-86 cp 进 staging/scripts/）。
   - 通用工具语义：serve.mjs:41 导出函数默认 `root = process.cwd()`；:112 CLI 入口 `argv[2] ?? process.cwd()`，静态服务器服务 cwd 是惯例。

## 发现列表

| ID | 严重度 | 证据 | 影响 | 建议 |
|---|---|---|---|---|
| K1 | P2 | validate.mjs:8 `const root = process.cwd();`；崩溃点 :46-47 → :12；实测外部 cwd exit 1 + ENOENT 堆栈；仓库根 exit 0 | 用户已实际踩坑；错误信息不可自诊；大盘目录误跑会全树扫描；与 4 个兄弟脚本行为不一致 | 本轮唯一修复：:8 改为 `path.resolve(import.meta.dirname, "..")` |
| K2 | P3 | validate.mjs:12 filesUnder 对 readdir 无错误捕获 | 即使修好 root，不可读子目录仍会让门槛以未处理拒绝崩溃 | 不在本轮改 |
| K3 | P3 | package.json 无 `engines`；import.meta.dirname 需 Node ≥20.11（已被 5 个脚本+2 个测试使用） | Node 20.0–20.10 用户会在既有脚本上失败；非本次回归引入 | 后续加 engines 或文档声明 |
| K4 | P3 | 工厂根缺 GDD.md/TDD.md/GAME_MAP.md | AGENTS.md 协议合规问题；validate 门槛不受影响 | 报告人类决定 |

非问题确认（避免误修）：validate-game.mjs:7 的 `argv[2] ?? cwd` 语义合理且被 create-game.mjs:128-131 与 create-game.test.js:53 依赖；serve.mjs 的 cwd 默认是服务器惯例；create-game.mjs:57 的相对路径输出参数是 CLI 惯例；browser-smoke/cache-phaser/smoke 均 cwd 无关（smoke 实测外部 cwd exit 0）。

## 方案评估

选 (a) `path.resolve(import.meta.dirname, "..")`：
- 否决 (b) 向上找 package.json——scripts/ 与根的位置关系固定，validate.mjs 不分发；
- 否决 (c) `--root` 参数——新增未请求的 API 面（AGENTS.md 禁止）；
- 否决 (d) 非根拒绝——root 可确定性推导时拒绝用户是更差 UX，且与 smoke.mjs 既定语义冲突。

## 验收与测试矩阵

新增 tests/validate-cli.test.js（遵循 create-game.test.js 的 spawnSync + mkdtemp 范式）：

| 场景 | 命令 | 期望 |
|---|---|---|
| 仓库根直接调用 | spawnSync(node, ["scripts/validate.mjs"], { cwd: repoRoot }) | exit 0，stdout 含 `validate ok:` |
| 外部空目录（回归 K1） | 同上，cwd = mkdtemp 目录 | exit 0，stdout 含 `validate ok:`，stderr 不含 ENOENT |
| 仓库子目录 | cwd = repoRoot/scripts | exit 0 |
| npm 路径 | `npm run validate`，cwd = repoRoot | exit 0（CI 已覆盖，可选） |

## 什么证据会改变判断

1. 若发现仓库外工具以"cwd=目标目录"方式使用 validate.mjs 校验他树——cwd 是特性，应改推方案 (d)。目前无此证据，且其工厂硬编码规则（27 prompts 等）使该用法无意义。
2. 若 CI/团队基线固定在 Node <20.11——方案 (a) 需替换为 `path.dirname(fileURLToPath(import.meta.url))` 等价写法。
3. 若人类声明"validate.mjs 必须只在仓库根运行"——方案 (d) 优先，但需与 smoke.mjs 既定语义一并裁决。
