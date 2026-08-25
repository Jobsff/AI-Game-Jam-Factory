# 多智能体实测 Playbook（KK3 / G53 / MM3）

> 本文件是三轮实测（Trial 01–03）的固定流程规范与计分卡，吸收 Trial 01（2026-08-25，CLI Root Resolution Smoke Test，PASS WITH PROCESS NOTES）的流程反馈。

## 一、固定流程顺序（不得变序）

```text
阶段 0  主智能体安全接管 + 内容级基线快照
阶段 1  KK3 初审（只读，任务包只给症状不给疑似根因）
阶段 2  主智能体裁决（唯一目标、文件白名单、验收标准、测试矩阵）
阶段 3  G53 实现（先复现→先红测试→最小修改→后绿→全门槛）
阶段 4  MM3 红队（第一轮只测不改；攻击清单只是下限）
阶段 5  （仅当 P0/P1/稳定 P2）G53 一次返修 → MM3 回归
阶段 6  KK3 最终一致性复核  ← 必须发生在最后一次写入之后
阶段 7  禁止再写入
阶段 8  主智能体终验 + FINAL_REPORT.md + RUN_MANIFEST.json
```

硬规则：

1. **KK3 最终复核之后不得再有任何写入**（包括文档单句）。若必须改，改完后对最终 diff 重新复核，并在报告中写明各次复核的 diff 截止点。
2. MM3 的阴性结论必须限定范围：「在〈X 的既定攻击范围〉内未发现 P0/P1/P2」，不得写成全仓结论。
3. 每轮维护线（小修）不必开完整圆桌，由主智能体裁决后交 G53 单独执行；能力实测线才走全流程。

## 二、阶段 0 基线要求（每轮实测前）

工作区有大量未提交/未跟踪文件时，`git diff` 无法保护 untracked 内容，必须先做内容级基线：

优先方案（人类执行）：创建本地 checkpoint 分支并提交，**不推远端**。

代理可执行的替代方案：

```bash
rsync -a --exclude .git --exclude node_modules \
  <repo>/ /tmp/<repo>-checkpoint/
cd /tmp/<repo>-checkpoint && find . -type f -print0 | LC_ALL=C sort -z \
  | xargs -0 shasum -a 256 > /tmp/<repo>-checkpoint.sha256
```

之后每轮 Agent 修改才能准确归因。G53 修改任何 untracked 文件前，还须单独保存该文件修改前内容副本。

## 三、子智能体调用证据（RUN_MANIFEST.json）

每轮在 `reviews/workflow-trial-<N>/RUN_MANIFEST.json` 记录：

```json
{
  "runs": [{
    "agent": "KK3|G53|MM3",
    "role": "initial-review|implementation|red-team|final-review|rework",
    "agentId": "agent_<uuid>",
    "model": "…",
    "startedAt": "ISO8601",
    "finishedAt": "ISO8601",
    "inputHash": "任务包 SHA-256",
    "inputTask": "…",
    "output": "…",
    "modifiedFiles": [],
    "toolUses": 0,
    "durationMs": 0,
    "status": "completed"
  }]
}
```

同时保存：原始任务包文本、子智能体原始输出、实际命令日志、最终 diff。不得在报告中记录 API key / Token / 私钥。

## 四、任务包撰写规则（防锚定）

1. **KK3 初审任务包**：只给症状与复现现象，**不给疑似根因、不给修复方向**；要求 KK3 输出【独立性声明】（独立发现 / 验证任务包假设 / 未能独立验证）。
2. **MM3 红队任务包**：攻击清单标注为"最低覆盖要求"；要求 MM3 先自行从代码推导攻击面，报告中区分"指定攻击 / 自行发现攻击"。
3. **G53 任务包**：必须含允许文件白名单、禁止清单、保持不变接口、验收标准、测试矩阵；先红后绿。

## 五、模型评估计分卡（每轮每角色打分）

| 指标 | KK3 | G53 | MM3 | 满分 |
|---|---:|---:|---:|---:|
| 正确发现/实现 | 30 | 30 | 30 | 30 |
| 证据完整性 | 20 | 15 | 20 | 20 |
| 范围纪律 | 20 | 20 | 15 | 20 |
| 独立发现能力 | 15 | 10 | 20 | 20 |
| 测试质量 | 5 | 20 | 10 | 20 |
| 耗时和工具稳定性 | 10 | 5 | 5 | 10 |

同时记录：有效发现数、误报数、漏报数、修改文件数、无关改动数、首次通过率、返修次数、工具失败次数、总耗时。

连续三轮后固定角色分工；某角色某指标连续偏低时收紧其系统提示词或调整调用方式。

## 六、实测路线图

| 轮次 | 任务 | 状态 |
|---|---|---|
| Trial 01 | CLI 根目录解析冒烟（process.cwd()） | ✅ PASS WITH PROCESS NOTES |
| Trial 02 | 工程生成器事务安全与破坏性路径对抗（create-game / validate-game / serve） | 待执行 |
| Trial 03 | 5 个 Phaser 模板连续重开、状态竞态与资源泄漏压力测试 | 待执行 |

Trial 01 结论的正确命名：**协作机制已跑通；目标 Bug 高置信修复；复杂工程能力仍需 Trial 02/03 验证。**

## 七、维护线积压（不走圆桌，G53 单独执行）

1. ✅ Trial 01 已完成：validate.mjs root 解析 + validate-cli.test.js + README 说明句
2. ✅ 2026-08-25 维护线批次 1 完成：package.json 增加 `engines.node >=20.11.0`、README 对齐、CI OS×Node 矩阵（未验证事项：GitHub Actions 9 组 matrix 首跑为权威验证，Windows 上 chmod 诱饵用例走 skip 分支）
3. ✅ 2026-08-25 维护线批次 2 完成：filesUnder() readdir 容错（错误进聚合协议，TDD 先红后绿）+ validate-cli.test.js 增强（T1/T3 补 ENOENT 断言 + 诱饵容错用例，23 tests 全绿）

维护线最终验证：`npm run verify` exit 0（tests 23/23 + validate + smoke + browser-smoke），`git diff --check` 干净。
