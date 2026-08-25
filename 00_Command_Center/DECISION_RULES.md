# 选题决策规则

现场入口：[`60_MINUTE_DECISION_SOP.md`](60_MINUTE_DECISION_SOP.md)｜工具：[`decision.html`](../03_AI_Decision_System/decision.html)｜权重：[`SCORE_MODEL.md`](SCORE_MODEL.md)

## 固定顺序

- [ ] 原样记录主题（词／句／画面描述）。
- [ ] 分别回答字面、情绪、机制、反常识四个角度。
- [ ] 用 5 秒分类回答“玩家主要在做什么”。
- [ ] 只保留 3 个候选；分别写一句话玩法、核心美术数与六指标分数。
- [ ] 先执行硬淘汰，再自动排序，最后由制作负责人拍板唯一方案。

## 5 秒动作分类

| 类别 | 玩家动作 | 母件 |
|---|---|---|
| A | 创造东西 | `template_collect_create` |
| B | 保护东西 | `template_defense` |
| C | 做选择 | `template_choice` |
| D | 操作挑战 | `template_action` |
| E | 发现秘密 | `template_find` |

关键词映射只作提示，以 [`theme-map.json`](../03_AI_Decision_System/data/theme-map.json) 为机器可读真源；主题必须通过机制表现，禁止仅换皮。

## 硬淘汰（先于总分）

1. 48 小时完成概率 `< 3/5`。
2. 30 秒核心玩法清晰度 `< 4/5`。
3. 核心美术 `> 10` 张且尚未按 [`ART_FALLBACK.md`](ART_FALLBACK.md) 降级。

## 自动排序与拍板

未淘汰项按总分降序；同分依次比较完成概率、玩法清晰度、记忆点、方案名。没有可行项时必须缩减候选再评分，不得越过硬规则。

- [ ] 孩子回答：最想玩？最想看？最不像别人？
- [ ] 制作负责人回答：30 秒记住什么？只剩 8 小时能否交付？为何必须由这个团队做？
- [ ] 60:00 前锁定唯一方案；逾时默认选择排名最高的未淘汰项。
