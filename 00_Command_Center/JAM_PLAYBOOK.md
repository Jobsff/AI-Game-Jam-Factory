# AI Game Jam 现场作战手册

目标：**30 秒懂玩法、3–5 分钟讲清作品、生产窗口内稳定交付的 AI 亲子共创原型。** 实际赛事时长与规则未提供时统一标“待核验”，现场用相对时间执行。

## 一条生产线

1. [ ] 进入 [`60 分钟决策 SOP`](60_MINUTE_DECISION_SOP.md)，用[离线决策器](../03_AI_Decision_System/decision.html)锁定唯一方案。
2. [ ] 按 [`TEAM_OPERATING_MODES.md`](TEAM_OPERATING_MODES.md)选择女儿在线/卡壳模式，记录真实贡献。
3. [ ] 用 [`AI_ROUNDTABLE_SOP.md`](AI_ROUNDTABLE_SOP.md)完成四专家交叉质疑。
4. [ ] 冻结 GDD/TDD/GAME_MAP 与模块契约，执行 [`TECH_FREEZE_RULES.md`](TECH_FREEZE_RULES.md)。
5. [ ] 生成工程后，Codex 每轮只做单模块、最多 3 文件；先复现再修、完成后测试。
6. [ ] 美术每 90 分钟按 [`ART_FALLBACK.md`](ART_FALLBACK.md)强制降级。
7. [ ] 按 [`48H_TIMELINE.md`](48H_TIMELINE.md)节点冻结并完成四阶段验收清单。

## 角色边界

| 角色 | 做什么 | 不做什么 |
|---|---|---|
| 孩子 | 判断想不想玩、画面情绪、反常识与取舍 | 不承担批量生产或成人方案背书 |
| 制作负责人 | 主持、拍板、架构、范围、验收 | 不把 AI/成人贡献记给孩子 |
| ChatGPT 主窗口 | 扩搜索、交叉质疑、形成验证问题 | 不替人拍板 |
| Codex 工程窗口 | 按地图与契约实现、测试、报告 | 不改人类锁死的循环/输入/状态/事件 |

## 现场红线

- [ ] 三候选后不新增第 4 个；60 分钟必须唯一拍板。
- [ ] 可玩版本出现前不做装饰性美术。
- [ ] 功能冻结后不新增玩法；交付阻断优先。
- [ ] 新依赖遵守 [`OPEN_SOURCE_POLICY.md`](OPEN_SOURCE_POLICY.md)，商业化前逐项审计。
- [ ] 每个版本都检查开始→玩法→胜负→重来，以及 restart 后事件/监听清理。
