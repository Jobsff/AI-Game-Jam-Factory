# UNRESOLVED — 未解决问题台账

> 放弃机制的落点：跳过≠放弃，接手前先读这里，禁止重复已烧过的路径。

| ID | 问题 | 已尝试与结果 | 下一步候选思路 | 建议接手 | 日期 |
|---|---|---|---|---|---|
| U-01 | （已解决，见下方"已解决"节） | | | | |
| U-02 | 工厂仓库根缺 GDD.md/TDD.md/GAME_MAP.md（AGENTS.md 协议要求） | 多轮报告，均因文件白名单限制未补齐 | 人类决定是否用 00_Command_Center/templates/ 补齐 | 人类裁决 | 2026-08-25 |
| U-03 | （已解决，见下方"已解决"节） | | | | |
| U-04 | （已解决，见下方"已解决"节） | | | | |
| U-05 | Node 20 嵌套 spawnSync stderr 管道截断的机制（曾观察于 GHA macos-20 腿，约 8KB） | 独立最小复现两变体失败（20/22/24 行为一致）；上游检索无对应 issue；已用文件重定向规避，表述已收窄 | 如复发：在 GHA macos-20 runner 跑 /tmp/spawn-repro 最小复现脚本取证后提上游 issue | MM3（仅当复发） | 2026-08-25 |
| U-06 | validate.mjs 的 CR 字节门禁（.gitattributes 扩展名规则表的纵深防御） | KK3 方案 (a) 两轮延期（不在授权范围）；Trial 02 裁决再次延期（与生成器事务安全不同模块，保持 diff 焦点） | validate.mjs 加"文本文件含 CR 即报错"+负路径单测（维护线小批次，2 文件） | G53（维护线） | 2026-08-26 |
| U-07 | create-game.mjs 复制 AGENTS.md 进生成工程，但不复制 AGENTS.md 可能引用的其他 00_Command_Center 文档：AGENTS.md 若含指向工厂文档的 markdown 链接，生成工程自验证即"死链"失败（2026-08-26 02:50 版 AGENTS.md 曾触发，npm test 4 项红；03:12 版改为纯文本引用后自愈） | MM3 红队 F0 记录了完整证据链；KK3 提出"生成后扫描产物内链接并校验目标存在"的 assert 思路 | 三选一：①create-game 复制时重写/剥离工厂内部链接；②validate-game 对 AGENTS.md 内部链接放宽；③维持约定"AGENTS.md 不得以 markdown 链接引用未复制文档"+validate.mjs 加仓库侧检查 | KK3 定方案 / G53 实现（维护线） | 2026-08-26 |

## 已解决

| ID | 问题 | 解决方式 | 证据 | 关闭日期 |
|---|---|---|---|---|
| U-01 | main 分支保护未绑定 quality-gates-complete | 人类在 GitHub 网页开启分支保护（要求 PR + 必需检查 quality-gates-complete + 管理员不豁免；强推/删除默认禁止） | 主智能体空提交直推 main 被 GitHub 拒绝：`GH006 ... Changes must be made through a pull request. Required status check "quality-gates-complete" is expected.` | 2026-08-26 |
| U-03 | README 未列新 CI 三 job 拓扑；"Node 20 门槛"表述未更新为 20/22/24 | Trial 02 批次 3（G53）：README 第 3 行改"Node 20/22/24 CI 矩阵门槛"；验证命令节尾补一句三 job 拓扑（quality-gates 九腿矩阵 + browser-smoke 独立 job + quality-gates-complete 聚合门禁） | Trial 02 Phase 2 diff（README.md 两处）；`npm run validate` exit 0 | 2026-08-26 |
| U-04 | .zcode/ 未被 .gitignore 忽略 | 本提案在 .gitignore 增加 `.zcode/` 条目 | 本 PR 的 diff | 2026-08-26 |
