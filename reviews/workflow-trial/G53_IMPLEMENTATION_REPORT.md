# G53 实现报告 — validate.mjs 仓库根解析修复

- 实现角色：G53（本轮唯一生产代码写入者）
- 日期：2026-08-25
- 任务包来源：KK3_INITIAL_REVIEW.md + IMPLEMENTATION_DECISION.md

## 修改文件（2 个，未超限）

| 文件 | 修改内容 | 原因 |
|---|---|---|
| scripts/validate.mjs | 仅第 8 行：`const root = process.cwd();` → `const root = path.resolve(import.meta.dirname, "..");`（保留同行 `const errors = [];`，紧凑单行风格不变，其余 86 行零改动） | 根因消除：root 不再依赖调用者 cwd，与 smoke.mjs:13 等 4 个兄弟脚本统一 |
| tests/validate-cli.test.js | 新增 3 用例：T1 仓库根 / T2 外部空目录（含 stderr 不含 ENOENT 回归断言）/ T3 仓库子目录 | 为 K1 提供回归防线（spawnSync + mkdtemp，复用 create-game.test.js / serve.test.js 范式） |

## 修复前复现

| 命令 | cwd | 退出码 | 关键输出 |
|---|---|---|---|
| `node <abs>/scripts/validate.mjs` | mktemp -d 外部目录 | 1 | `Error: ENOENT ... scandir '<tmp>/04_Prompt_Library'` at validate.mjs:47 → filesUnder :12（unhandled rejection，stdout 为空） |
| `node scripts/validate.mjs` | 仓库根（基线） | 0 | `validate ok: 11 prefabs, 5 templates, 71 scripts` |
| `node --test tests/validate-cli.test.js`（修复前） | 仓库根 | 1 | tests 3, pass 1, **fail 2**（T2/T3 均 exit 1 + ENOENT）——先红成立 |

## 修复后结果

| 命令 | cwd | 退出码 | 关键输出 |
|---|---|---|---|
| `node --test tests/validate-cli.test.js` | 仓库根 | 0 | tests 3, pass 3, fail 0——后绿成立 |
| `node scripts/validate.mjs` / `npm run validate` | 仓库根 | 0 | `validate ok: 11 prefabs, 5 templates, 72 scripts`（71→72 系新增测试文件被 filewalk 计入，预期） |
| `node <abs>/scripts/validate.mjs` | mkdtemp 外部目录 | 0 | `validate ok: ...`，stderr 无 ENOENT，不访问调用者目录 |
| `npm test` | 仓库根 | 0 | tests 22, pass 22, fail 0（原 19 + 新 3） |
| `npm run smoke` | 仓库根 | 0 | `smoke ok: 25 offline resources` |
| `npm run browser-smoke` | 仓库根 | 0 | `browser smoke ok: 5 templates + decision tool` |
| `npm run verify` | 仓库根 | 0 | 聚合四门槛全绿 |
| `git diff --check` | 仓库根 | 0 | 无 whitespace 错误 |

## 边界遵守

- 未触碰 tracked 文件（与开工 status 快照逐条一致）；写入仅发生在未跟踪的 scripts/ 与 tests/ 内部。
- validate-game.mjs argv[2] ?? cwd、serve.mjs cwd 默认、退出码协议、`validate ok:` 前缀均未变。
- 未给 filesUnder 加 try/catch（任务包明确排除）；未引入依赖；未用超出兄弟脚本既有用法的 Node API。
- 未执行任何 Git commit/push。

## 未验证事项

- Node < 20.11（无 import.meta.dirname）未实测——smoke.mjs 等 CI 内脚本已依赖同 API，未新增环境要求；
- Windows 平台行为未实测（无环境；与兄弟脚本风险一致）。

## 剩余风险

极低。理论残留：将 validate.mjs 单文件拷出仓库执行时 root 指向拷贝位置——与全部兄弟脚本既定语义一致，属预期行为。
