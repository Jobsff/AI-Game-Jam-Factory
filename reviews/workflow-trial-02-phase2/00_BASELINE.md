# Trial 02（Phase 2 本体）基线（00_BASELINE）

- 时间：2026-08-26 01:51（会话交接口径：main 9b76b6b，工作区干净，CI 11 项全绿）
- HEAD：9b76b6bbbecec6e40991e8921bec3a2d1684eda7（main，porcelain 0 条）
- 内容级基线：/tmp/agjf-trial02p2-checkpoint-20260826-015100（212 文件）
  - 清单：/tmp/agjf-trial02p2-checkpoint-20260826-015100.sha256
  - 清单指纹（SHA-256）：3f396c531cb7cbaabfa3edfd59f5ea667dda1fd96c6c251a15861f34e8146762
- 本地起点验证：`npm test` 33/33 pass（2026-08-26 01:5x，无 skip）
- staging 残留检查：仓库内无 `*.factory-*` 残留目录
- 与上一轮的关系：`reviews/workflow-trial-02/` 是"第一批强制整改批"（browser-smoke/.gitattributes/聚合 job）的报告，只读不动；本轮全部报告写 `reviews/workflow-trial-02-phase2/`
- 本轮目标（人类 2026-08-26 三问卡片 #1 确认）：
  1. create-game.mjs 事务安全：要么完整生成、要么干净回滚零残留（含中途失败/被打断场景）
  2. 破坏性路径对抗：目标目录已存在、同名游戏覆盖、路径穿越（../ 注入）、非法名字等输入必须安全拒绝
  3. validate-game.mjs / serve.mjs 对应边界同步审查
- 环境注意：gh CLI 未认证 → 分支推送后给人类 compare 链接，人类点建 PR 与合并；main 分支锁生效（GH006 实测）
- 欠账状态：U-02（缺 GDD/TDD/GAME_MAP，人类裁决中）、U-03（README CI 拓扑行）、U-05（spawnSync stderr 截断，仅复发时接手）、U-06（CR 字节门禁）；U-03/U-06 是否并入本轮由主智能体在阶段 2 裁决
