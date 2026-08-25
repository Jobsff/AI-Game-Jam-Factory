# 主智能体拍板 — 本轮唯一修复目标

- 日期：2026-08-25
- 依据：KK3 初审报告（KK3_INITIAL_REVIEW.md）
- 文件上限：≤5（实际批准 2 个）

## 采用的发现

- **K1（P2）**：`scripts/validate.mjs:8` 使用 `const root = process.cwd()`。从仓库外 cwd 直接执行 `node scripts/validate.mjs` 时，脚本在调用者目录寻找 `04_Prompt_Library` 等工厂资产并以未捕获 ENOENT 崩溃（exit 1、原始堆栈），与用户实测的 desktop-commander dist 现象同构。KK3 已动态复现。满足：可复现、有用户影响、改动范围小（一行）、可自动测试、不改变公共业务行为（退出码协议与 stdout 前缀不变）。

## 拒绝或延期的发现

- **K2（P3）** filesUnder 缺 readdir 错误捕获 → 延期（独立问题，避免范围膨胀）。
- **K3（P3）** package.json 缺 engines / Node ≥20.11 声明 → 延期（既有风险，非本轮引入；注意本轮修复不得使用超出既有脚本已用范围的 API）。
- **K4（P3）** 工厂根缺 GDD.md / TDD.md / GAME_MAP.md → 已按 AGENTS.md 协议报告给人类裁决；本轮为 CLI 工具修复，不补齐。
- 其余 6 个脚本的 cwd 语义（serve.mjs / validate-game.mjs 等）确认为合理设计，不动。

## 本轮唯一修复目标

`scripts/validate.mjs` 的仓库根解析与调用者 cwd 解耦：第 8 行
`const root = process.cwd();` → `const root = path.resolve(import.meta.dirname, "..");`
（`path` 已在第 4 行导入；与 smoke.mjs:13 同构。）

修复后行为定义（三种场景一致）：
- 仓库根执行 `node scripts/validate.mjs` → exit 0，`validate ok:`；
- 仓库外任意 cwd 直接 `node /abs/path/scripts/validate.mjs` → 自动定位工厂仓库根，exit 0，`validate ok:`，不得再访问调用者目录；
- `npm run validate` / CI → 行为与之前完全一致。

## 允许修改文件（2 个）

1. `scripts/validate.mjs`（仅第 8 行 root 定义）
2. `tests/validate-cli.test.js`（新增）

## 禁止修改文件

- scripts/ 其余 6 个文件（validate-game.mjs、serve.mjs、smoke.mjs、browser-smoke.mjs、create-game.mjs、cache-phaser.mjs）
- package.json、README.md、.github/workflows/validate.yml
- 01_Template_Games/、08_Prefab_Library/、02_Game_Core/ 全部内容
- vendor/、tests/ 既有 8 个文件

## 保持不变的接口

- validate.mjs 退出码协议：错误清单 → exit 1；`validate ok: ...` → exit 0；stdout 前缀 `validate ok:` 不变；
- validate-game.mjs 的 `argv[2] ?? cwd` 语义（create-game.mjs 事务流程依赖）；
- serve.mjs 导出函数与 CLI 的 cwd 默认；
- Prefab 公共 API、五个玩法模板。

## 验收标准

1. 新测试先红后绿：修复前，"外部 cwd"用例必须以 ENOENT 失败；修复后全绿。
2. 测试矩阵：仓库根直接调用 / 外部 mkdtemp 目录 / 仓库子目录（scripts/）均 exit 0 且 stdout 含 `validate ok:`；外部 cwd 场景 stderr 不含 ENOENT。
3. `node --test`（npm test）全绿；`npm run validate` 从仓库根 exit 0。
4. `npm run verify` 最终通过（test + validate + smoke + browser-smoke）。
5. `git diff --check` 干净；无其他文件被改动（reviews/ 报告除外）。

## 测试矩阵

| # | 命令 | cwd | 期望 |
|---|---|---|---|
| T1 | `node scripts/validate.mjs` | 仓库根 | exit 0，`validate ok:` |
| T2 | `node <abs>/scripts/validate.mjs` | /tmp 下 mkdtemp 空目录 | exit 0，`validate ok:`，无 ENOENT |
| T3 | `node scripts/validate.mjs` | 仓库根/scripts | exit 0，`validate ok:` |
| T4 | `npm run validate` | 仓库根 | exit 0（CI 同路径） |
| T5 | `npm run verify` | 仓库根 | 全部门槛通过 |
