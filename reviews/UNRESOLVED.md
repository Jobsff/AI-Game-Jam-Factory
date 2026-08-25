# UNRESOLVED — 未解决问题台账

> 放弃机制的落点：跳过≠放弃，接手前先读这里，禁止重复已烧过的路径。

| ID | 问题 | 已尝试与结果 | 下一步候选思路 | 建议接手 | 日期 |
|---|---|---|---|---|---|
| U-01 | main 分支保护未绑定 quality-gates-complete（聚合门禁目前仅信息性） | 无法代理执行：需仓库 admin 权限（gh 未认证） | 人类在 Settings→Branches→Require status check 勾选 quality-gates-complete（工作流已跑过，check 名已可选） | 人类（5 分钟） | 2026-08-25 |
| U-02 | 工厂仓库根缺 GDD.md/TDD.md/GAME_MAP.md（AGENTS.md 协议要求） | 多轮报告，均因文件白名单限制未补齐 | 人类决定是否用 00_Command_Center/templates/ 补齐 | 人类裁决 | 2026-08-25 |
| U-03 | README 未列新 CI 三 job 拓扑；"Node 20 门槛"表述未更新为 20/22/24 | KK3 终审判定可接受、下轮同步 | README 门槛表补一行 + 表述更新（单文件小改，可并入下轮 G53 批次） | G53（下轮） | 2026-08-25 |
| U-04 | .zcode/ 未被 .gitignore 忽略（误入库风险，提交时靠人工排除） | KK3 F-B 发现；.gitignore 不在当轮授权 | .gitignore 加 `.zcode/` 条目（并入下轮） | G53（下轮） | 2026-08-25 |
| U-05 | Node 20 嵌套 spawnSync stderr 管道截断的机制（曾观察于 GHA macos-20 腿，约 8KB） | 独立最小复现两变体失败（20/22/24 行为一致）；上游检索无对应 issue；已用文件重定向规避，表述已收窄 | 如复发：在 GHA macos-20 runner 跑 /tmp/spawn-repro 最小复现脚本取证后提上游 issue | MM3（仅当复发） | 2026-08-25 |
| U-06 | validate.mjs 的 CR 字节门禁（.gitattributes 扩展名规则表的纵深防御） | KK3 方案 (a) 两轮延期（不在授权范围） | validate.mjs 加"文本文件含 CR 即报错"+负路径单测 | G53（下轮授权） | 2026-08-25 |
