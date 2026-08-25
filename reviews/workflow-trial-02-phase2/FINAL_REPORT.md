# 最终报告 — Trial 02 Phase 2：工程生成器事务安全与破坏性路径对抗

- 日期：2026-08-26（01:51–03:55 本地）
- 仓库：/Users/jobsff/code/ai-game-jam-factory @ main 9b76b6b
- 阶段 0 安全证据：/tmp/agjf-trial02p2-checkpoint-20260826-015100（212 文件，清单指纹 3f396c53…）
- 报告目录：reviews/workflow-trial-02-phase2/（本轮全部 9 份文件）

【执行结论】
**Go（建议合并）** —— KK3 终审 Go、MM3 回归 Go、全门槛 43/43 + `npm run verify` exit 0。CI 九腿矩阵（尤其 Windows 腿对 T2/T5 的首次实测）是合并前最后一道权威验证。

## 一、目标与结果（对照三问卡片 #1 确认的范围）

| 目标 | 结果 |
|---|---|
| 事务性：要么完整生成、要么干净回滚零残留 | ✅ G1 信号中断（SIGINT 130/SIGTERM 143 同步清 staging）、G2 陈旧 staging 清扫（sentinel+严格 UUID+PID 探活，宁可漏清不误删）、G3 新建祖先链回滚、G4 并发/TOCTOU 误删（rmdir 化，恰好一个赢家） |
| 破坏性输入安全拒绝 | ✅ G8 symlink 绕过工厂根防线封堵（词法+realpath 双防线）；既有防线（非空覆盖拒绝、slug 校验、工厂内拒绝）经 MM3 攻击确认有效 |
| serve/validate 边界诚实 | ✅ G5 不存在 root 不再"先报成功后崩"（单行错误 exit 1，编程式干净 reject）、G6 横幅报真实端口、F1 非法 PORT/HOST 单行报错无栈；validate-game.mjs 经审查不改（G11 低危观察） |
| 欠账 | U-03 ✅ 销账（README 两处）；U-06 按裁决延期（记录于台账）；新增 U-07（AGENTS.md ↔ 生成器复制清单耦合，见下） |

## 二、流程执行（8 阶段 + 1 次外部事件）

1. 阶段 0 基线：checkpoint 212 文件 + sha256 清单；起点 npm test 33/33。
2. 阶段 1 KK3 初审（防锚定任务包）：12 项发现（G1–G12），3 个 P1 全部活体复现。
3. 阶段 2 裁决：唯一目标群 = G1/G2/G3/G4+G9/G8（create-game）+ G5/G6（serve）；3 批次 5 文件白名单；U-03 并入批次 3；U-06 延期；G7/G10/G11/G12 延期观察。
4. 阶段 3 G53 实现：三批次全部先红后绿（红 6 fail / 绿 8/8；serve 红 3 fail / 绿 5/5），42/42，verify exit 0。
5. 阶段 4 MM3 红队：7 组攻击 60+ 复现，G53 修复全部守住（并发 8 轮×4 进程、18 种 sentinel 边界、信号时机扫描、8 种 symlink 活体、serve 全攻击面）。
6. **F0 外部事件（本轮最大意外）**：MM3 运行期间（02:50–03:12），仓库所有者的另一会话并发重写 12 个治理文档 + 新增 MULTI_AGENT_WORKFLOW.md，其中 AGENTS.md 的 markdown 链接导致生成工程自验证死链、npm test 4 项红。主智能体查证责任归属（时间线+只读声明），上抛三问卡片未获答复后按"绝不回滚所有者文件"原则处置：03:12 对方自行把链接改为纯文本引用，自愈；裁判复核 42/42 + verify 绿。**此事件揭示结构性耦合，记入台账 U-07。**
7. 阶段 5 返修：F1（serve 非法 PORT 泄漏多行栈，稳定 P2）→ G53 单 hunk 修复 + MM3 回归 Go（五路复攻全单行、接口冻结成立、43/43 + verify 0）。
8. 阶段 6 KK3 终审：Go；白名单 6/6 零夹带、接口冻结 8/8、独立重跑全过、diff 截止点 13 文件 SHA-256 留档；新发现 3 个 P3（KK3-F1 manifest 缺条目[已补录]、KK3-F2 occupied 措辞、KK3-F3 G8 TOCTOU 威胁模型注记——均移交维护线）。
9. 阶段 7-8：本报告 + RUN_MANIFEST 补录（6 runs）+ 草稿分支（只 stage 白名单路径，外部文档改动留在工作区不动）。

## 三、修改文件（全部，≤3/批约束满足）

| 文件 | 内容 |
|---|---|
| scripts/create-game.mjs | +137 行：sentinel/sweep/祖先回滚/rmdir 化/realpath 防线/信号处理器/新增导出 assertOutputOutsideFactory |
| scripts/serve.mjs | +40/−15：canonicalBase 惰性化、listen 先 realpath、横幅真实端口、CLI 构造期 try/catch |
| tests/create-game.test.js | +206 行：T1–T6（并发不变式/TOCTOU/SIGINT/清扫防误删/祖先链/symlink 防线） |
| tests/serve.test.js | +75 行：T8–T10 + F1 用例（缺失 root/编程 reject/PORT=0/非法 PORT 单行） |
| README.md | 2 hunk：U-03（Node 20/22/24 矩阵表述 + CI 三 job 拓扑句） |
| reviews/UNRESOLVED.md | U-03 销账、U-06 延期注记、U-07 新增 |
| reviews/workflow-trial-02-phase2/ | 9 份报告 + RUN_MANIFEST（6 runs） |

测试：33 → 43（+10，全绿，0 skipped）。

## 四、计分卡

### 过程指标

| 指标 | 值 |
|---|---|
| 有效发现数 | 19（KK3 15 = 初审 12 + 终审 3；MM3 4 = F0/F1/F2/F3）；本轮修复 10 项 |
| 误报数 | 0 |
| 漏报数 | 2（F1 由 MM3 补获而非 KK3 初审；KK3-F3 的 G8 TOCTOU 窗口初/红两轮均未捕获，终审独立发现） |
| 修改文件数 | 5（生产/测试/文档）+ 1 台账 + 9 报告 |
| 无关改动数 | 0 |
| 首次通过率 | G53 三批次首次全绿（42/42 + verify 0）；返修 1 次（F1） |
| 返修次数 | 1 |
| 工具失败次数 | 0（6 次子智能体调用全部成功返回） |
| 总耗时 | 约 2 小时 05 分（01:51–03:55，含 F0 事件处置约 13 分钟） |

### 角色评分（Playbook 第五节口径）

| 指标 | KK3 | G53 | MM3 |
|---|---:|---:|---:|
| 正确发现/实现（30） | 28（G8 未活体复现-1，F1 漏报-1） | 28（F1 属其改动邻域-2） | 29 |
| 证据完整性（20/15/20） | 19 | 15 | 19（自报耗时与实际不符-1） |
| 范围纪律（20/20/15） | 20 | 20 | 15 |
| 独立发现能力（15/10/20） | 13 | 8 | 17（漏 KK3-F3-3） |
| 测试质量（5/20/10） | 4 | 18（红阶段两处测试自身 bug 已如实报告） | 9 |
| 耗时和工具稳定性（10/5/5） | 9 | 5 | 5 |
| **合计（满分 100）** | **93** | **94** | **94** |

角色结论：三分工全部胜任本轮任务；KK3 初审→G53 实现→MM3 红队的链路各自补位有效（MM3 补获 F1、KK3 终审补获 F3）。

## 五、未解决风险与移交

- U-02（缺 GDD/TDD/GAME_MAP）：人类裁决中，不变。
- U-05（spawnSync stderr 截断）：仅复发时接手，不变。
- U-06（CR 字节门禁）：延期至维护线（G53，2 文件）。
- **U-07（新）**：create-game 复制 AGENTS.md 但不复制其可能引用的 00_Command_Center 文档；AGENTS.md 若含 markdown 链接 → 生成工程自验证死链（本轮 F0 实证）。三选一候选：①复制时重写/剥离工厂内部链接；②validate-game 对 AGENTS.md 放宽；③约定 AGENTS.md 不用 markdown 链接引用未复制文档 + validate.mjs 仓库侧检查。**Trial 03 前建议裁决**（连续生成 5 工程会直接踩到）。
- 维护线小批候选：G7+F3（parseArguments 收紧 + 拒绝 `--` 开头值）、KK3-F2（occupied 消息按 error.code 分支）、KK3-F3（G8 威胁模型注记）、F2 文档化（staging 回收以 basename 一致为前提）。
- 平台待核验：Windows/Linux/Node 20.11/22 行为由本 PR 的 CI 九腿矩阵首次实测（T2/T5 的 --require 钩子、并发测试跨平台稳定性）；任一腿红 → 按放弃机制处理（CI 周期上限 3 次）。

## 六、流程改进建议（给人类）

1. **审阅期工作区只读约定**（F0 教训）：Trial 运行期间若有其他会话要改仓库，建议先打招呼或等阶段间隙；本轮靠 mtime 取证 + checkpoint 才完成责任切割。MM3/KK3 均建议立此约，是否立由你定。
2. RUN_MANIFEST 建议每阶段实时补录（本轮靠 KK3 终审抓出滞后）。
3. 三问卡片无答复时的默认路径（本轮：不动所有者文件 + 只读查证 + 等自愈）建议追认为协议条款。

## 七、Git 状态与下一步

- 草稿分支：trial/02-generator-transaction-safety（只 stage 白名单 7 路径；**外部 12+1 文档改动留在工作区，未纳入提交**，等你自行处置）。
- 推送后请用 compare 链接建 PR（gh 未认证，主智能体无法代建）；合并前盯 CI 九腿 + browser + aggregate 全绿。
- Trial 03 入口条件见下节。

## 八、Trial 03 入口条件（5 个 Phaser 模板连续重开与资源泄漏压测）

1. 本 PR 合并且 CI 全绿（11 项检查，Windows 腿为新增测试的首次跨平台实测）。
2. U-07 裁决完成（Trial 03 将连续生成 5 个工程，AGENTS.md 耦合直接影响可行性）。
3. 维护线积压（U-06/G7/KK3-F2/F3）可先行也可并行，不阻断 Trial 03。
4. 浏览器操作一律走 ego-browser skill；遇 "user is controlling" 立即硬停（本轮纪律延续）。
5. 建议沿用：阶段 0 checkpoint、防锚定任务包、每批次 ≤3 文件、放弃机制上限（代码修复 ≤2、CI 周期 ≤3）、派发标记 marker。
6. Trial 03 核心验收草案（供下轮任务包用）：5 模板浏览器连续重开 N 轮无状态残留、事件监听/timer/tween 清理验证、内存/GC 趋势记录、生成→serve→validate 全链闭环。

---

# 附录：CI 修复周期（终审后追加，2026-08-26 04:0x–04:2x）

> Playbook 硬规则执行记录：终审 Go 后推送 a311375 → CI 周期 1 的 ubuntu-22 腿失败 → 按放弃机制（CI 周期 1/3）根因分析 + G53 修复 + KK3 增量复核 → 本附录与修复同批提交。

## CI 周期 1 结果（a311375）

10/11 绿（Windows 三腿全绿——新增测试跨平台成立）；`quality-gates (ubuntu-latest, 22)` 失败：`not ok 15 - SIGINT during generation cleans staging and exits 130`，残留断言 `1 !== 0`（exit 130 断言通过）→ 聚合 job 红。

## 根因（裁判确定性复现，/tmp/agjf-sigstress/prereg4.cjs，3/3）

**注册窗口**：`await mkdir(staging)` 系统调用完成（目录已落盘、测试 15ms 轮询可观测）到 `activeStaging = staging` 赋值之间，await 微任务续体被共享 runner 调度抢占（可拉长 >15ms）时 SIGINT 到达 → 处理器读到 null → 不清理直接 exit 130 → 残留。本地快盘 25 轮自然压不中；确定性钩子复现（mkdir 完成后 keepAlive+自发 SIGINT+永驻）3/3 与 CI 失败签名完全一致（exit 130 + residue 1）。
**次要窗口（防御性）**：处理器 rmSync 遍历完成后、exit 前已派发线程池写落地（CI 慢盘大文件）。
排查路径：假设 A（rmSync 后阻塞 120ms 观察迟写）实验证伪 → 换角度定位注册窗口 → 确定性复现。

## 修复（G53 agent_2d12bf1b，白名单 2 文件，先红后绿）

- `scripts/create-game.mjs`（+12 行）：①`activeStaging = staging` 赋值前移到 `await mkdir` 之前（rmSync force 对不存在路径无副作用，窗口彻底关闭）；②信号处理器 rmSync 后加 8×25ms 有界重试（Atomics.wait 同步等待，兜住迟写；仅信号路径，正常路径零变化）。
- `tests/create-game.test.js`（+79 行）：T-A 注册窗口钩子测试、T-B 迟写窗口钩子测试，均确定性结构（强制构造交错，不碰运气），win32 skip；修复前 2 fail（红，签名与 CI 一致）→ 修复后绿。
- K3-1 注释修正（KK3 预授权）：重试耗尽残骸无 sentinel、清扫器不回收的如实表述。

## KK3 增量复核（agent_83f2d8ac）：Go

增量与目标严格一致（+91/−2 无夹带）、注册窗口彻底关闭、Atomics.wait 主线程用法正确、钩子误伤排查（validate-game.mjs 无 rmSync/mkdir）通过、独立复跑 10/10 + 45/45、复现脚本 2/2 镜像验证。新发现 P3×2：K3-1（已修正）、K3-2（注册前移后 mkdir 落地前的微秒级残余窗口，接受：概率极低且为空目录）。增量截止点哈希：create-game.mjs 1beaa073…（K3-1 注释修正后以 git diff 为准）、create-game.test.js 27ba12ce…。

## 本地全门槛（修复后）

`npm test` 45/45 / 0 skipped；`npm run verify` exit 0；prereg4 复现 3/3 残留归零；stress 10/10 无泄漏；仓库无 `*.factory-*`。

## 计分卡增量

- 返修次数 1 → 2（F1 + CI 竞态；均为单次通过）
- 总耗时 约 2h05m → 约 2h45m（含 CI 周期 1 排查与修复）
- 有效发现数 19 → 21（+CI 竞态窗口、+K3-2 微秒残余窗口）
- 角色评分调整：G53 28→29（CI 修复单次闭环）；KK3 28→29（增量复核独立发现 K3-1/K3-2）；MM3 不变（未参与本轮，按 Playbook 阶段 5 只在 P0/P1/稳定 P2 时回归，CI 修复走 KK3 增量复核路径）
- CI 周期消耗：1/3（周期 2 为本修复的验证）

## CI 周期 2（c3832bb）：ubuntu-20 腿 T-B 一次失败（1/N 时序洞）

10/11 绿；`quality-gates (ubuntu-latest, 20)` 在 T-B（迟写重试测试）残留断言失败一次（exit 130 断言通过）。排查：CI 日志需 admin 权限不可得 → 本地多角度实证：ESM 补丁机制金丝雀（Node 20/24 均有效，排除"钩子在 Node 20 失效"）、Node 20 本地全量测试全绿、CPU 饥饿（load 10+）下 Node 20 循环全绿——无法本地复现。结构性复查发现真实"最后一隙"：重试循环最后一次 rmSync 与 process.exit 之间（或 existsSync 判 false 与 exit 之间）落地的写无兜底，正是共享 runner 微秒级抢占能命中的形态。

## CI 周期 3（a842bed）：封最后一隙 + 自诊断 → **11/11 全绿**

G53（agent_380d0957）最小加固：①重试预算 8×25ms→20×50ms；②循环后无条件补一次 rmSync（封最后一隙）；③仍残留时 stderr 单行警告；④T-B 注入标记断言（区分"钩子没跑/清理失败"）+ 残留断言消息内嵌残留目录 JSON 与子进程 stderr 尾部（下次若再红，CI 注释自带机制证据）。KK3 快速增量复核 Go（4 项 P3：R1 警告行 CI 可见性[已按预授权修复]、R2 marker 写失败歧义[接受]、R3 纳秒级固有末隙[已声明]、R4 POSIX 文件名换行[无需处理]）。Node 20/24 双版本 npm test 45/45、verify exit 0、警告路径实验验证（130 退出 ~1.2s 有界、单行警告、最终 rmSync 确已执行）。**周期 3 推送后 11/11 全绿（含 Windows 三腿与聚合门禁）。**

## 终局计分卡（最终）

| 指标 | 值 |
|---|---|
| 有效发现数 | 22（KK3 初审 12 + 终审 3 + 增量 2；MM3 4；裁判 CI 排查 1[注册窗口]）|
| 误报数 | 0 |
| 漏报数 | 2（F1 由 MM3 补获；G8 TOCTOU 注记由 KK3 终审补获）|
| 修改文件数 | 5 生产/测试/文档 + 1 台账 + 9 报告 |
| 返修次数 | 2（F1 + CI 竞态，均一次闭环）|
| CI 周期消耗 | 3/3（周期 1 注册窗口修复、周期 2 暴露最后一隙、周期 3 全绿）|
| 工具失败次数 | 0（10 次子智能体调用全部成功）|
| 总耗时 | 约 3 小时 20 分（01:51–05:1x，含两次 CI 排查修复与 F0 事件处置）|

角色终评：KK3 93 / G53 95（+1：两轮 CI 修复均单次闭环且自捕自修一个测试 bug）/ MM3 94（不参与 CI 线）。
