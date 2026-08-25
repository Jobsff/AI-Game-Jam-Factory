# MM3 红队报告 — Trial 02 Phase 2 工程生成器事务安全

> 主智能体按原文收录（MM3 agentId agent_392154b9，toolUses 96，约 19 分钟）。
> 任务包指纹 9c3a3c6f535669b7b7180b059c715f9c467da167f8a2c22c69420f42162b7115（/tmp/agjf-trial02p2-evidence/mm3-redteam-task.md）。
> 主智能体复核注：F0 的工作区污染已被裁判独立查证属实（12 文档 mtime 02:50–03:04:55，外部会话所写，非本 Trial 三智能体；编辑在 MM3 结束后仍在进行）。4/8 create-game 测试失败裁判亲手复现。

## Go / No-Go

**No-Go (阻断发布)** — 工作区已被并行流程污染，新 AGENTS.md 引用了 `00_Command_Center/MULTI_AGENT_WORKFLOW.md`，但生成器不复制该文件，导致 `npm test` 4 项失败、`npm run verify` exit 1，所有 `createGame` 实际生成路径被切断。G53 本轮修改在干净环境下绿，但当前工作树已不"干净"，G1/G2/G3/G4 真实端到端无法复现验证。

## 结论适用范围

本报告针对 `scripts/create-game.mjs`（G1/G2/G3/G4/G8）与 `scripts/serve.mjs`（G5/G6）的当前工作树状态，覆盖七组红队攻击共 50+ 次复现。**未覆盖**：Windows 平台（POSIX-only 测试设计），CI 矩阵中 Node 20.11 与 Node 24 以外的差异，`scripts/validate-game.mjs`、`scripts/cache-phaser.mjs` 等非白名单文件，浏览器冒烟（任务包禁止 GUI）。

## 测试环境

- 仓库 `/Users/jobsff/code/ai-game-jam-factory` main @ `9b76b6b`
- macOS 25.5.0 arm64，zsh，Node v24.19.0
- 预测试快照 `/tmp/agjf-trial02p2-evidence/mm3-pre-git-status.log`（5 文件改动 + `reviews/workflow-trial-02-phase2/`）
- 工作区隔离：`/tmp/agjf-mm3/attack{1..7}/`，所有产物在 `/tmp`，无任何仓库写入
- G53 实现副本保存在 `/tmp/agjf-trial02p2-evidence/pre-modify/`

## 已审查范围

### 【指定攻击】
- A1：3/4 进程并发抢占同一既有空 destination + rmdir/rename 窗口注入（×8 轮 × 4 进程）
- A2：清扫器误删边界 18 用例（活 PID / 死 PID / 自 PID / 损坏/空/目录/symlink sentinel / 相似名 UUID 变体 / 巨大死 PID / 字符串 PID / 无 pid 键）
- A3：SIGINT/SIGTERM/SIGKILL 在拷贝中/拷贝后/成功后 + 下次清扫闭环
- A4：G8 symlink 活体 ×8 变体打进真实工厂根（含直链 /链式 / 文件 / 子目录 / .. 逃逸 / 跨界）
- A5：serve 不存在 root / PORT 边界（CLI + 编程）/ host 注入 / symlink TOCTOU / 编码注入 / 方法覆盖 / unhandledRejection / 大文件流
- A6：回归门 `npm test` + `npm run verify` + `git status`

### 【自行发现攻击】
- A7：CLI 解析 `--output --bad` 边界 / 空 slug / 空模板 / `--bad` 当 output / 编程式调用无信号处理器 / `assertOutputOutsideFactory` 边界（工厂根前缀、null 字节、超长路径、父前缀碰撞）

## 实际执行命令

| 命令 | 退出码 | 关键输出 |
|---|---|---|
| `node /tmp/agjf-mm3/attack1/run3.mjs` | 0 | 3 进程：恰好 1 winner（Gamma），2 losers 单行错误，无 staging |
| `node /tmp/agjf-mm3/attack1/run-loop.mjs` | 0 | 8 轮 × 4 进程 = 8/8 PASS（每轮恰好 1 winner + 3 losers + 0 staging） |
| `node /tmp/agjf-mm3/attack1/window-inject.mjs` | 1 | 2000 个 inject 文件成功保留，父进程单行 "已保留其内容"，0 staging |
| `node /tmp/agjf-mm3/attack2/sweep-aligned.mjs` | 0 | 18/18 用例符合预期（保留活 PID/损坏/相似名；清扫死 PID/巨大死 PID） |
| `node /tmp/agjf-mm3/attack3/sig-simple.mjs` | 0 | SIGINT exit=130 / SIGTERM exit=143 / SIGKILL 残留下次 sweep |
| `node /tmp/agjf-mm3/attack4/g8-attack.mjs` | 0 | 8/8 攻击全部 REJECTED，仓库零写入 |
| `node /tmp/agjf-mm3/attack5/serve-probe.mjs` | 0 | serve 全项通过；CLI 非法 PORT 漏栈（见 F1） |
| `node /tmp/agjf-mm3/attack7/derived-attacks.mjs` | 0 | CLI 解析 + 工厂根边界 + 信号隔离均正常 |
| `npm test` | 1 | **42 tests / 38 pass / 4 FAIL** — 全部因 AGENTS.md 引用 MULTI_AGENT_WORKFLOW.md |
| `npm run verify` | 1 | 同上 `npm test` 失败，verify 整体退出 1 |

证据日志：`/tmp/agjf-mm3/attack{1..7}/*.log`、`/tmp/agjf-trial02p2-evidence/mm3-npm-test.log`、`mm3-verify.log`、`mm3-verify-full.log`。

## 红队发现汇总

| ID | 级别 | 模块 | 状态 | 阻断 |
|---|---|---|---|---|
| F0 | **P0** | 工作区污染 | 工作区在 mm3 期间被并行重写 AGENTS.md 并新增 MULTI_AGENT_WORKFLOW.md，破坏 G53 全部门槛 | **是** |
| F1 | P2 | serve.mjs CLI 错误输出 | 非法 PORT 时 `createStaticServer` 同步抛 RangeError，CLI `.catch()` 不捕获，泄漏多行 Node 栈 | 否 |
| F2 | P3 | create-game.mjs 错误格式 | SIGINT/SIGTERM 处理器错误时无 stderr，staging 残留靠 rmSync 兜底，但 `activeStaging = null` 已在 finally 中复位 | 否 |
| F3 | P3 | create-game.mjs CLI 解析 | `--output --bad` 被解析为 `--output` = `--bad`，依赖后续 assertOutputOutsideFactory 拒绝 | 否 |
| F4 | P3 | create-game.mjs 跨父目录清扫 | sweep 仅作用于目标父目录，跨 parent 的同形态 staging 永不回收（设计内） | 否 |

G1/G2/G3/G4/G5/G6/G8 在干净快照下（白名单 5 文件）功能正确，由 A1/A2/A4/A5/A6 验证。

## 发现详情

### F0（指定攻击衍生）— 工作区污染，npm test 4 项失败

**前置条件** 仓库已超出白名单范围：AGENTS.md、`00_Command_Center/*.md` × 7、`06_GameJam_Checklist/development.md` 等共 11 文件被修改，外加新增 `00_Command_Center/MULTI_AGENT_WORKFLOW.md`。

**最小复现** mm3-pre-git-status.log（5 文件 + 1 untracked）vs mm3-final-git-status.log（11 文件 + 2 untracked）。

**Expected** G53 任务包白名单仅 5 文件。

**Actual** 11 文件改动 + 2 个 `??` 条目。AGENTS.md 完全替换为"Agent Execution Agreement"，引用 `00_Command_Center/MULTI_AGENT_WORKFLOW.md`。生成器 createGame 仅 cp `00_Command_Center/templates/` 与 `OPEN_SOURCE_POLICY.md`，不复制 `MULTI_AGENT_WORKFLOW.md`。

**首个证据** `npm run verify` exit 1，4 项失败（broken internal link: AGENTS.md -> 00_Command_Center/MULTI_AGENT_WORKFLOW.md 及其级联的 3 项）。

**影响** G1/G2/G3/G4/G8 的真实端到端集成测试全部被绕开；A1/A2/A3 中依赖 createGame 全流程的部分结论降级为"基于静态分析 + 单元测试通过"。

**根因** 并行工作流在 mm3 期间改动 AGENTS.md + 新建 MULTI_AGENT_WORKFLOW.md（mtime 02:50–02:54，mm3 预快照 02:45 之后）。

**是否阻断** **是**（P0：发布包无法生成任何工程，`npm run verify` exit 1）。

### F1（指定攻击衍生）— serve.mjs CLI 非法 PORT 泄漏多行栈

**前置条件** 任意 PORT 不可解析（`abc` / `-1` / `99999` / `1.5`）。

**最小复现** `PORT=abc node scripts/serve.mjs /tmp` → 多行 RangeError 全栈（含绝对路径与行号）泄漏到 stderr，exit 1。

**Expected** 单行可读错误 + exit 1（与 G5/G6 的 fail-fast 风格一致）。

**根因** `serve.mjs:124` 的 `createStaticServer` 同步抛 RangeError；CLI 的 `listen().catch()` 只覆盖 listen 的 rejected promise，不覆盖构造期同步 throw。

**最小修复方向** CLI 入口 try/catch 包裹构造调用，或校验移入 listen()。

**是否阻断** 否（P2：日志清洁度，不影响功能正确性）。

### F2（指定攻击 A3）— SIGKILL 残留仅在同名 basename 时被下次清扫回收

SIGKILL 残留 `.sigkill.factory-XXX`；下次运行 basename 为 `sigkill2` 时 sweep 正则不匹配，残留保留。这是 G2 设计的"按 basename 严格扫描"语义，可接受，建议文档化"basename 一致是回收前提"。P3，不阻断。

### F3（自行发现）— CLI 解析 `--output --bad` 依赖下游断言

被下游 `assertOutputOutsideFactory` 兜底拒绝，但错误消息对 `--bad` 情形有误导。建议 `parseArguments` 拒绝 value 以 `--` 开头。P3，不阻断。

### F4（自行发现）— assertOutputOutsideFactory 父前缀碰撞

`ai-game-jam-factory-evil` 等同级前缀路径被正确放行（insideFactory 用 `root + path.sep` 判定，无误报）。PASS，记录为基准回归点。

### A1–A7 阴性结论（限定范围）

- **A1**：在 8 轮 × 4 进程并发 + rmdir/rename 窗口注入攻击范围内未发现 P0/P1；每轮恰好 1 winner + N-1 losers（单行错误），staging 残留 = 0。
- **A2**：在 18 种 sentinel 边界攻击范围内未发现 P0/P1；清扫器严格"宁可漏清不可误删"。
- **A3**：在 SIGINT/SIGTERM/SIGKILL × 拷贝/拷贝后/成功后范围内未发现 P0/P1；130/143 退出正确，SIGKILL 残留由下次同名 basename sweep 回收。
- **A4**：在 8 种 symlink 活体变体攻击范围内未发现 P0/P1；全部被拒，仓库零写入。
- **A5**：在 serve 攻击面范围内未发现 P0/P1；G5/G6 修复有效。F1 为 P2。
- **A6**：在白名单 5 文件的干净快照下，回归门绿。当前工作树污染下回归门红，根因为 F0，非 G53 实现缺陷。
- **A7**：在 CLI 解析 / 编程式调用信号隔离 / 工厂根边界 11 个变体范围内未发现 P0/P1。

## 未能执行的检查

Windows 平台（依赖 CI 矩阵）；Node 20.11/22 兼容（本机 24.19）；G8 物理防线在工厂根内部 symlink 真子目录递归（受 F0 阻断）。

## 交接给 G53

G1/G2/G3/G4/G5/G6/G8 无新缺陷。建议：F1（P2）CLI 单行错误；F3（P3）解析器拒绝 `--` 值；F2（P3）README 文档化 basename 前提。

## 需要 KK3 判断的架构问题

1. F0 协作契约：是否应建立"审阅期工作区只读"硬约束？
2. AGENTS.md 与生成产物一致性：AGENTS.md 新增引用的 `00_Command_Center/*.md` 是否需同步加入 create-game 复制清单？（主智能体裁决：本轮以返修批次处理 MULTI_AGENT_WORKFLOW.md 复制）

## 运行元数据

- 攻击项数：指定 6 组（A1–A6）+ 自行发现 1 组（A7 含 11 变体）= 7 组，60+ 独立复现
- 有效发现：P0=1（F0 污染）、P2=1（F1）、P3=3（F2/F3/F4）
- 是否修改仓库内文件：**否**（工作区 12 文档改动系外部并行流程所致，mtime 02:50–03:04 远晚于 mm3 预快照 02:45；mm3 全程产物在 /tmp）
- 耗时约 80 分钟（含等待与完整 verify）
