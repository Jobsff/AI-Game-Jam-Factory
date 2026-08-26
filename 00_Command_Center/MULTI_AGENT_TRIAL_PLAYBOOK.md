# 多智能体能力实测 Playbook

> 本文件只用于评估 KK3 / G53 / MM3。真实生产按 [`MULTI_AGENT_WORKFLOW.md`](MULTI_AGENT_WORKFLOW.md) 执行，不得把完整实测流程套到每个开发任务。

## 实测原则

1. 建立干净 checkpoint；记录 HEAD、diff、未跟踪文件与内容快照。
2. 任务包只给症状和目标，不提前喂根因；保存输入、输出、命令和最终 diff。
3. KK3 只读初审；主智能体锁定唯一目标；G53 写入；MM3 限时验证；最多一次返修。
4. KK3 最终复核必须发生在最后一次写入之后；复核后禁止再写。
5. 每个角色都有时间预算和退出条件；达到上限即停，不以“还能继续找”自动续跑。

## 记录

每轮保存 `RUN_MANIFEST.json`：

```json
{
  "agent": "KK3|G53|MM3",
  "role": "review|implementation|qa|regression",
  "model": "...",
  "startedAt": "ISO8601",
  "finishedAt": "ISO8601",
  "inputHash": "sha256",
  "outputHash": "sha256",
  "modifiedFiles": [],
  "toolUses": 0,
  "status": "completed|stopped|failed"
}
```

## 评分

| 指标 | KK3 | G53 | MM3 |
|---|---:|---:|---:|
| 正确性 | 30 | 30 | 30 |
| 证据质量 | 20 | 15 | 20 |
| 范围纪律 | 20 | 20 | 15 |
| 独立能力 | 20 | 10 | 25 |
| 效率与稳定性 | 10 | 25 | 10 |

同时记录：有效发现、误报、漏报、无关改动、首次通过率、返修次数、耗时。

## 实测路线

| 轮次 | 任务 | 状态 |
|---|---|---|
| Trial 01 | CLI 根目录解析 | 已完成；仅证明流程跑通 |
| Trial 02 | 工程生成器事务安全 | 已完成；代码与报告在 trial/02 分支（推送后 11 项 CI 检查全绿），PR 待合并 |
| Trial 03 | Phaser 模板重开、竞态与泄漏 | 待执行 |

## 放弃机制

- 同一根因最多两次实现尝试；完整修复循环最多三轮。
- 达到上限后写入 `reviews/UNRESOLVED.md`，记录证据、失败路径和下一接手角色。
- 实测发现不得自动进入产品排期；由制作人按当前交付模式裁决。
