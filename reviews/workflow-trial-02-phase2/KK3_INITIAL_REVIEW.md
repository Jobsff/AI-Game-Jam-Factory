# KK3 架构初审报告 — Trial 02 阶段 1：工程生成器事务安全与破坏性路径对抗

> 主智能体按原文收录（KK3 agentId agent_b583e560，toolUses 27，约 19 分钟，全程只读，实验产物在 /tmp/k3exp/）。
> 任务包原文指纹与原始输出见 /tmp/agjf-trial02p2-evidence/（RUN_MANIFEST.json 登记）。

## 【执行摘要】

结论先行：**三个脚本的整体防线设计高于预期（staging+rename、自验证回滚、词法+realpath 双重路径防线均已存在），但"事务性"承诺在进程中断与并发场景下确定性地被打破。**

- 已用实验复现 **2 个 P1**：(1) SIGINT/SIGKILL 中断后 staging 残留目录永久遗留且后续运行不清扫；(2) 并发双跑指向**既有空目录**时，后到者的 `rm(destination)` 会**静默删除先到者已完成的完整工程**，双方均报告成功（`scripts/create-game.mjs:136`）。
- 已复现 **1 个症状 C 的 P1**：`serve.mjs` 面对不存在的 root 会先打印成功横幅、随后以 unhandledRejection 崩溃（`scripts/serve.mjs:46`）。
- 另有 4 个 P2（父目录链回滚残留、无陈旧 staging 清扫、工厂根防线纯词法可被 symlink 父目录绕过、PORT=0 打印假地址）与 4 个 P3。
- 既有测试 4/4 通过（基线已跑），但全部只覆盖 happy path 与静态拒绝，未覆盖中断、失败回滚、并发、serve 异常 root。
- 层级判定（AGENTS.md 口径）：本问题群主要位于**运行地图（状态/事件）**层——文件系统状态机（staging→validate→rename）的生命周期与清理责任；次要位于**实现地图**（scripts 模块契约缺失）；不涉及体验地图（Scene/UI）。另注：`scripts/` 模块无 `MODULE_CONTRACT.md`，按 AGENTS.md 开工顺序应先报告此项缺失。

## 【任务与约束理解】

- 目标：盘点 `create-game.mjs` / `validate-game.mjs` / `serve.mjs` 在三类症状下的既有防线与缺口，只读仓库、实验限 /tmp、不碰 git。
- 已遵守：仓库零写入（`git status` 前后一致，仅任务开始前已存在的 `reviews/workflow-trial-02-phase2/` 未跟踪目录）；全部实验产物在 `/tmp/k3exp/`；无 git 写操作。
- 关键一致性前提：README.md:32-36 明确文档化 `--output /absolute/path/to/my-game`，即**绝对路径/仓库外路径是设计内行为**；因此"含 `../` 或绝对路径"本身不构成违规，防线义务是"非空不覆盖、不写进工厂、不留残留"。

## 【独立性声明】

任务包只给了症状（A/B/C），未给根因假设，因此不存在"验证根因提示"类条目；逐条标注如下：

| 发现 | 来源标注 |
|---|---|
| G1 中断残留（SIGINT/SIGKILL） | **验证任务包症状 A**：任务包描述"进程被杀可能留残留"，我补了文件级根因（无 signal handler、`:138-141` 的 catch 覆盖不到信号）与活体复现 |
| G4 并发 rm 静默替换完整工程 | **独立发现**（根因 `:136` 无再校验的 `rm recursive force` + 无锁）。任务包仅在实验建议里提到"竞态尝试"四个字，未指出该根因与"既有空目录"前提 |
| G5 serve 不存在 root 崩溃 | **独立发现**（根因 `:46` realpath Promise 在 listen 成功前无 handler）。任务包症状 C 只说"需要同步审查"，未指出崩溃 |
| G3 父目录链回滚残留 | **独立发现**（`:65` mkdir 在 try 之外），超出了症状 A 字面（症状 A 说"输出位置或其旁边"，父链残留属于第三类位置） |
| G2 无陈旧 staging 清扫、G6 PORT=0 假地址、G7 解析器宽松、G8 防线词法化、G9 裸错误消息 | **独立发现** |
| 症状 B 主体（非空覆盖、非法 slug/name、穿越路径） | **验证任务包症状 B**：既有防线大多有效，`../` 落仓库外被接受属 README 文档化设计 |
| 未能独立验证项 | G8 的活体复现被任务约束禁止（symlink 指向真实工厂根会写入仓库工作区），仅有代码证据 |

若无任务包提示能否自己找到：能找到 G1/G3/G4/G5/G8（生命周期与防线对比审查的自然产物，尤其 serve.mjs:70 已有 realpath 先例，对比 create-game.mjs:58 即暴露 G8）；症状框架的价值在于确定了实验优先级，所有根因定位均来自代码行级证据与 /tmp 复现。

## 【已读取的证据】

- 全读：`scripts/create-game.mjs`（150 行）、`scripts/validate-game.mjs`（109 行）、`scripts/serve.mjs`（120 行）、`tests/create-game.test.js`、`tests/serve.test.js`、`package.json`、`.gitignore`、`README.md` 相关段落、`AGENTS.md`
- 抽查：`01_Template_Games/template_collect_create/index.html` 与 `src/data/gameConfig.js`（title 格式）、模板目录体积
- 基线：`TMPDIR=/tmp/k3exp/tmp node --test tests/create-game.test.js tests/serve.test.js` → **4 pass / 0 fail**
- 环境：Node v24.19.0，macOS arm64，HEAD = `9b76b6bbbecec6e40991e8921bec3a2d1684eda7`

## 【三层地图】

**1. 体验地图（Scene/UI）**：无游戏 Scene/UI 涉及。CLI 体验路径：用户跑 `npm run new-game` → 成功打印 `created ...` / 失败应干净退出；`npm run serve` → 打印可访问 URL。当前缺口：失败/中断后的文件系统状态与"已删除用户文件仍报成功"的并发场景违背该体验承诺。

**2. 运行地图（状态/事件）**：核心状态机为 `校验参数 → 创建父目录 → staging 写入 → 子进程自验证 → (删空目录) → rename 生效`。清理责任集中在 `:138-141` catch，**仅覆盖同步/异步异常，不覆盖信号与崩溃**；无启动时陈旧状态恢复；无跨进程互斥。serve 的生命周期：`createStaticServer`（同步校验 host/port，异步 realpath）→ `listen` → 每请求"词法防线→stat→realpath 防线→流式返回"。

**3. 实现地图（模块/资产）**：`scripts/create-game.mjs` 是唯一写入者，依赖 `01_Template_Games/*`、`02_Game_Core`、`08_Prefab_Library`、`vendor`、`00_Command_Center/templates`；产物内嵌 `serve.mjs`/`validate-game.mjs` 副本（**本报告所有 serve/validate 发现会随生成传播到每个产出工程**）。测试位于 `tests/create-game.test.js`、`tests/serve.test.js`。`scripts/` 无 `MODULE_CONTRACT.md`（缺失，按 AGENTS.md 需报告）。

## 【主要发现】

| ID | 严重度 | 证据 | 影响 | 建议 |
|---|---|---|---|---|
| G1 | P1 | `create-game.mjs:138-141`（catch 不覆盖信号）；复现：启动后 0.35s `kill -INT` → exit 130，`/tmp/k3exp/sigint/` 残留 `.game.factory-2243313a-…`（19 项完整拷贝）；`kill -KILL` → exit 137，同样残留 | 破坏**事务性**（零残留）。Ctrl+C 是常见操作，中断必然残留 | 注册 SIGINT/SIGTERM 处理器做 best-effort `rm(staging)` 后以正确码退出；SIGKILL 无法捕获，须靠 G2 的清扫兜底 |
| G2 | P2 | 复现：SIGKILL 残留后成功跑下一次生成，`.game.factory-a2826a89-…` 依然存在（实验输出见上） | 破坏**事务性**：残留永久累积，且为隐藏目录用户难发现 | 每次运行前/后清扫 `dirname(destination)` 下匹配 `.{basename}.factory-{uuid}` 形态的目录；staging 内首写 sentinel 文件防止误删同名用户目录 |
| G3 | P2 | `create-game.mjs:65`（父链 mkdir 在 try 之外）；复现：NODE_OPTIONS sabotage 强制验证失败 → exit 1，staging 已删但 `/tmp/k3exp/roll/deep/deeper` 三层新建父目录残留 | 破坏**事务性**（零残留）：失败回滚只清理 staging，不清理新建的祖先目录 | 记录运行前已存在的最近祖先，失败时仅回删本次新建的空祖先链；或将父目录创建并入 staging 创建步骤统一回滚 |
| G4 | P1 | `create-game.mjs:136` `rm(destination,{recursive,force})` 无再校验 + 全程无锁；复现：预建空目录，双跑错峰 0.85s → **P1/P2 均 exit 0 均打印 created，最终内容只剩 SECOND**，P1 的完整工程被 P2 静默删除 | 同时破坏**事务性**与**破坏性输入拒绝**（误删）：完整可用工程被静默销毁且双方都以为成功；同根因还覆盖"单跑期间空目录被放入文件即被删"的 TOCTOU | 把 `:136` 的 `rm recursive force` 换成仅对空目录生效的 `rmdir`（非空即 ENOTEMPTY 失败，天然阻断误删）；rename 失败包装为可读错误；如需完全串行化再加 `destination.lock`（O_EXCL） |
| G5 | P1 | `serve.mjs:46`（realpath Promise 延迟到首个请求才 await）+ `:111-118`；复现：`node serve.mjs /tmp/k3exp/does-not-exist` → 先打印 `Factory server: http://127.0.0.1:4173/`，随后 unhandledRejection ENOENT 崩溃，exit 1 | 症状 C：畸形 root 输入→**误报成功后崩溃**；同代码随生成工程分发 | 启动时 fail-fast：`listen()` 前先 await realpath(root)，不存在则干净报错退出（无横幅、无栈） |
| G6 | P2 | `serve.mjs:114,117`；复现：`PORT=`（空串）→ `Number("")=0` → 绑定随机端口但横幅打印 `http://127.0.0.1:0/`，用户照抄必失败 | 症状 C 边界：输出误导 | 横幅改用 `listen()` 返回的 `server.address()` 实际 host/port |
| G7 | P3 | `create-game.mjs:18-29,148`；复现：奇数参数→裸栈崩溃但 exit 1；重复 `--name` 后者静默覆盖（config 里为 "Second Name"）；拼错 `--slugg` 静默忽略 exit 0 | 参数畸形时拒绝行为不一致（有的裸栈、有的静默放行） | 解析器收紧：flag 白名单、拒绝重复、未知 flag 报错；parse 错误走统一 catch 打印单行消息 |
| G8 | P2 | `create-game.mjs:57-60` 纯词法 `path.resolve`+`startsWith`；对照 `serve.mjs:70` 已有 realpath 防线 | **破坏性输入拒绝**可被 symlink 父目录绕过：`--output /tmp/link→工厂内/某目录` 词法上不在工厂内，实际写入仓库工作区（活体复现被约束禁止，代码证据充分） | 对 destination 的最近已存在祖先做 realpath 后再与 realpath(factoryRoot) 比较 |
| G9 | P3 | 并发实验输家日志原文：`ENOTEMPTY: directory not empty, rename ...` | 错误消息裸系统码，用户无法理解是"并发冲突" | rename/rmdir 失败统一包装为可操作建议型消息 |
| G10 | P3 | `create-game.mjs:143,111`：`cleanName` 仅 trim，直接进入 `console.log` 与 README 标题 | 终端 ANSI 控制字符注入级别（观察项） | console 输出处过滤控制字符；README 可原样 |
| G11 | P3 | `validate-game.mjs:10-26,64-71`：任意 root 无界递归（`/` 会扫整盘，跳过 .git/node_modules）；symlink 文件被 `node --check`/readFile 跟随读取 | 观察项：越界读取/扫描放大，均只读、低危 | 可选：文件数/深度上限；symlink 文件 realpath 越界则告警跳过 |
| G12 | P3 | `create-game.mjs:46-47`：`replaceTitle` 正则假设 title 单行同引号风格；当前 5 个模板均满足，变化时由 `:128-134` 自验证兜底 | 观察项 | 维持观察即可 |

P0 空缺的说明：按"必然发生的数据破坏/崩溃"定义，G5 是确定性崩溃但无数据损失、G4 是数据破坏但需并发前提，均落在 P1；未发现无条件触发的 P0。

## 【需求、文档、代码和测试的一致性】

- README.md:32-36 文档化绝对路径 output ↔ 代码 `:57-60` 只拦工厂内部：**一致**。任务包症状 B 中"`../`/绝对路径穿越"应以"防线意图（非空不覆盖、不入工厂）"为判据，而非字面条目。
- AGENTS.md Debug 协议要求"检查重复事件、未清理 listener/timer、Scene restart 残留"↔ G1/G2 恰是同构问题（生成器自身的残留无人检查）：**文档精神未被生成器自身遵守**。
- 测试现状：`tests/create-game.test.js:56` 只断言成功路径无 staging 残留；`:62-81` 只覆盖非空目录与工厂内两种拒绝。中断、失败回滚、并发、symlink 祖先、serve 异常 root 全部无测试 → **文档/代码/测试三方对"事务性"均无显式契约**。
- serve/validate 边界行为整体与代码意图一致且质量良好（已验证：400/403/404/405、md 逃逸检测、symlink 环不挂死 0.036s 返回、任意 root 退出码正确）。

## 【其他专家最容易忽略的风险】

1. **findings 的放大器**：`serve.mjs`/`validate-game.mjs` 是被**复制进每个生成工程**的（`create-game.mjs:85-86`），G5/G6 修在工厂里还要考虑已分发工程的存量。
2. **G4 的测试陷阱**：为 G8 写"symlink 指向工厂根应被拒绝"的测试时，**修复前运行该测试会真实写入仓库工作区**——必须先修后测，或测试内用临时 fake factoryRoot。
3. **清扫机制（G2）自身就是破坏性操作**：模式匹配过宽会误删用户目录，sentinel 文件 + 严格 uuid 形态是硬约束。
4. `spawnSync` 自验证无超时（`:128`），validate 子进程挂起将永久阻塞事件循环（当前未观察到挂起路径，列观察）。

## 【待核验事项】

| 事项 | 核验方法 | 改变判断的证据 |
|---|---|---|
| G8 symlink 绕过的活体复现 | 修复后用临时 fake factoryRoot 单测验证拒绝（禁止指向真实仓库） | 若 realpath 后比较仍放行则防线有第二缺口 |
| G4 在不同文件系统/APFS 竞争窗口的稳定性 | 修复前用错峰参数扫描 0.7–1.0s 复跑 20 次统计复现率 | 若复现率为 0 则降为 P2 |
| Windows 平台行为（rename 语义、路径分隔、symlink 权限） | 本环境为 darwin，无法核验；需 Windows CI | 若 Windows 上 rename 覆盖语义不同，G4 形态会变 |
| `:128` spawnSync 无超时是否可被实际挂起触发 | 构造挂起的 validate 子进程实验 | 若可挂起则升为 P2 |

## 【推荐实施顺序】

每轮 ≤3 文件（AGENTS.md），集成前先更新 GAME_MAP.md：

1. **Round 1（P1 止血，`scripts/create-game.mjs` + `tests/create-game.test.js`）**：G4（`rmdir` 替换 `rm recursive force` + rename 错误包装）→ G1（SIGINT/SIGTERM 清理处理器）→ G2（sentinel 保护的陈旧 staging 清扫）。
2. **Round 2（同两文件续）**：G3（新建祖先链回滚）→ G8（realpath 化工厂根防线）。
3. **Round 3（症状 C，`scripts/serve.mjs` + `tests/serve.test.js`）**：G5（启动前 await realpath fail-fast）→ G6（横幅用实际 address）→ G7 解析器收紧可并入 Round 1 或独立小轮。
4. G9–G12 作为 P3 批次，随上述轮次顺带或记录观察项。

## 【验收与测试建议】

先红后绿用例（当前应全红，修复后转绿），括号内为对应缺口：

1. 生成至 50% 时 SIGINT → 父目录无任何 `.factory-*` 残留、退出码 130（G1）
2. 预置含 sentinel 的假陈旧 staging + 一个同名形态但无 sentinel 的用户目录 → 成功运行后前者被清扫、后者原样（G2，防误删）
3. 强制自验证失败（NODE_OPTIONS sabotage 法）→ exit 1、staging 消失、**新建祖先链也消失**、既有祖先保留（G3）
4. 既有空目录 + 双进程错峰并发 → 恰好一方成功、另一方非零退出且报可读错误，**成功者内容完整存在**（G4+G9）
5. 单跑期间向空 destination 注入文件 → 运行必须失败且注入文件原样（G4 TOCTOU 变体）
6. `serve` 于不存在 root → 无成功横幅、单行错误、exit 1、无 unhandledRejection（G5）
7. `PORT=0` → 横幅端口等于实际绑定端口；`PORT=abc`/`70000` → 单行错误无裸栈（G6/G7）
8. 未知 flag / 重复 flag / 奇数参数 → 非零退出 + 单行错误（G7）
9. symlink 祖先指向工厂根的 output → 拒绝（G8，须在 fake root 沙箱内测）
10. 回归：现有 4 个测试保持绿；`--output` 为已存在文件时仍安全拒绝（现状已绿，保留）

## 【交接给 G53】

- 已确认目标：生成器满足"完整生成或零残留回滚"与"破坏性输入安全拒绝"；serve/validate 边界行为不崩溃、不误报。
- 允许修改范围：Round 1/2 仅 `scripts/create-game.mjs` + `tests/create-game.test.js`；Round 3 仅 `scripts/serve.mjs` + `tests/serve.test.js`。
- 不得改变：CLI 四个 flag 的名称与语义（README.md:32-36 已文档化）；`TEMPLATES` 白名单；slug 正则；生成产物的文件清单与 `factory.config.json` schema；非空目录拒绝行为；staging 命名中 `.factory-` 与 uuid 的识别形态（清扫机制依赖它，改名需同步清扫器）。
- 顺序：按【推荐实施顺序】；每轮先红后绿，测试先行。
- 已知风险：见"其他专家最容易忽略的风险"第 2、3 条；validate-game.mjs 本轮不建议动（G11 仅观察项）。
- 补充说明：为 `scripts/` 模块补 `MODULE_CONTRACT.md` 的决策留给人类（涉及文档治理，超出本 Trial 代码范围）。

## 【交接给 MM3】

- 最值得攻击的假设：(1) "rmdir 换 rm 后并发就安全"——请攻击 rmdir 与 rename 之间的窗口及三进程交错；(2) "sentinel 清扫不会误删"——构造形态相似目录、损坏 sentinel、跨用户目录；(3) "signal handler 清理一定来得及"——对 0~1s 做 kill 时机扫描（含复制中、验证中、rename 前一刻）。
- 高风险状态：staging 半拷贝态、destination 既有空目录、父链部分新建态；重点验证每种中断时点的残留清单。
- 预期行为基准：本报告【验收与测试建议】1–10。
- 竞态/兼容：macOS APFS 已复现 G4；Windows rename/锁定语义差异待动态验证；`NODE_OPTIONS` 注入可作为 MM3 的故障注入工具（本次已验证可行）。
- serve 需动态验证：HOST=0.0.0.0 暴露面、修复后 realpath 失败路径无 unhandledRejection、修复中不得回归 symlink 逃逸 403（现有测试 `tests/serve.test.js:47-72`）。

## 【运行元数据】

- 复核基线：HEAD = `9b76b6bbbecec6e40991e8921bec3a2d1684eda7`（main），审查期间工作区状态与开工时一致（仅任务前已存在的 `reviews/workflow-trial-02-phase2/` 未跟踪目录）；本审查为阶段 1 只读初审，非 diff 复核，无"复核截止点后变更"问题。
- 读取关键文件：11 个（3 脚本 + 2 测试 + package.json/.gitignore/README/AGENTS.md + 2 个模板文件抽查）。
- 只读/实验命令：11 个批次（含基线测试 4/4 通过；全部实验产物位于 `/tmp/k3exp/`，未清理以备复核对证）。
- 是否触碰仓库文件或 git 状态：**否**。
- 耗时约 25 分钟；未覆盖范围：Windows 平台行为、`scripts/validate.mjs` 与 `browser-smoke.mjs`（任务范围外）、生成工程的浏览器运行时（browser-smoke 属后续阶段）、G8 的活体复现（被只读约束禁止）。
