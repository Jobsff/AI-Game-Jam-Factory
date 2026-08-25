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
