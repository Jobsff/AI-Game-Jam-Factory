# KK3 初审报告 — 第一批整改项只读审查（Trial 02 前置）

- 审查角色：KK3（只读）；agentId agent_cf49e335；toolUses 36；耗时约 19 分钟
- 复核基线：HEAD 0c3e029，工作区干净；main protected: false（API 实证）

## 独立性声明（四项症状）

| 症状 | 判定 |
|---|---|
| 1 browser-smoke 退出码行为 | 验证任务包假设 + 独立发现加深（skip 分支在 Linux/Windows 是死代码；win32 无绝对路径候选，接入 CI 必红） |
| 2 .gitattributes * -text | **独立发现否决了 a601faf 提交信息的因果**：phaser.min.js 全文 0 个 LF、0 个 CR，CRLF 转换恒为无操作；CI 在 a601faf 后仍连红 5 次，真因是 PROMPT_INDEX 路径分隔符（0c3e029 才修） |
| 3 CI 是否构成门禁 | 验证：protected: false，9 条矩阵腿为独立 check，无聚合 job，main 可直推红（已实证 6 连红） |
| 4 Node 20 spawnSync 截断 8192 | 部分验证：CI A/B 支持"macos-20 腿特有"（22/24 通过），上游无对应 issue；"8192"数值与"嵌套"机制未能独立验证 |

## 主要发现

| ID | 严重度 | 证据 | 影响 | 修复方向 |
|---|---|---|---|---|
| F1 | P1 | browser-smoke.mjs:44-46 裸命令名无条件接受；:47-50 skip 分支仅 darwin 可达；:38-40 win32 无绝对路径候选 | 接 CI 后 Linux/Windows 无浏览器→ENOENT 假红；Windows 有 Chrome 也必红；macOS 无 Chrome→exit 0 假绿 | 裸名先 PATH 查找；win32 补绝对路径候选；REQUIRE_BROWSER=1 严格门控；先修此再入 CI |
| F2 | P2 | tr -cd '\n' / '\r' < phaser.min.js = 0/0；a601faf 后 5 连红 | 提交信息记录了不可能发生的根因；按错误记忆排查会误诊 | reviews/ 记录真因链；.gitattributes 注释改为"防御性字节精确" |
| F3 | P2 | .gitattributes:3 `* -text`；全库 0 个含 CR 跟踪文件 | 未来 Windows 提交 CRLF 原样入库，无护栏 | 二选一：(a) 保持 -text + validate 加 CR 字节门禁；(b) 精确规则 text=auto eol=lf + vendor/** -text |
| F4 | P3 | 6919255 message 与 validate-cli 注释；上游检索无果；本地 N24 不复现 | 一次 CI 观察被写成 Node 官方级缺陷 | 收窄表述（平台/版本限定）或补独立复现 |
| F5 | P2 | /branches/main protected:false；单 job 无聚合 | 零门禁 | 聚合 job（needs + if:always()，任一腿非 success 即失败）+ 分支保护只 require 聚合 check |
| F6 | P3 | validate.yml:31 注解 path 挂到 .github | PR 视图定位错乱 | 注解显式 file=/line= 或退化单条摘要 |
| F7 | P3 | validate-cli decoy 用例 chmod 语义 Windows 恒 skip | 6919255 对 Windows 腿从未被验证 | 注释声明 POSIX-only 覆盖边界 |

## 待核验

- 8192 截断的机制与平台范围（需 GHA macos-20 runner 实测独立复现）
- GHA 三平台 runner Chrome 预装实况与 PATH 名（需诊断 job）
- main 分支保护的管理员意愿（需人类/仓库设置页）
- a601faf 腿级失败明细（API 超时未取得）

## 验收标准（关键项）

- F1：无浏览器模拟单测（三平台逻辑一致）+ REQUIRE_BROWSER=1 无浏览器必非零退出 + 有浏览器全过
- F5：workflow 含聚合 job 且 needs/if 正确；分支保护 require 聚合 check（人工）
- F3：策略写入 .gitattributes；若选 CR 门禁须配负路径单测
- 总回归：npm test/validate/smoke 九腿全绿；validate.mjs 对外契约不变

（完整原文见会话记录；本文件为落盘归档版）
