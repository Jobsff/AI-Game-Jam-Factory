# AI Game Jam Factory 作战仓库 🎮

> 赛前"第 0 小时"准备工程。比赛当天真正竞争的不是 48 小时，而是谁拥有更好的起跑线。
> 目标：主题公布 → 决策器选玩法 → Phaser 模板启动 → Codex 按模块生产 → AI 生成统一资产 → 女儿创意验收 → 48h 交付。

## 一句话用法

```
现场只需：复制模板 → 填主题 → 选玩法 → 开 Codex → 生成资产 → 打包
```

## 目录导航

| 目录 | 作用 | 现场用？ |
|------|------|----------|
| `00_Command_Center/` | 作战手册、48h 时间表、决策规则、评分模型 | ✅ 必读 |
| `01_Template_Games/` | 5 个 Phaser 玩法模板空工程 | ✅ 直接复制 |
| `02_Game_Core/` | 共享核心（EventBus/GameState/InputManager/UI/特效） | ✅ 模板依赖 |
| `03_AI_Decision_System/` | 选题决策器（HTML 打分器） | ✅ 现场第一步 |
| `04_Prompt_Library/` | 全套 Prompt（设计/代码/美术/音效/路演） | ✅ 随时调用 |
| `05_AI_Assets/` | 美术风格/音效模板 | ⭕ 赛前备 |
| `06_GameJam_Checklist/` | 赛前/开发/提交/路演检查清单 | ✅ 对照执行 |
| `07_Examples/` | 获奖案例分析、Demo 参考 | ⭕ 赛前看 |

## 5 个玩法模板速查

| # | 模板 | 核心循环 | 适合主题 |
|---|------|----------|----------|
| 1 | collect_create（收集创造）| 收集碎片 → 组合 → 新结果 | 治愈/重生/记忆/创造 |
| 2 | defense（保护守护）| 做选择 → 保护目标 | 守护/希望/家园/爱 |
| 3 | choice（选择分支）| 每次选择改变世界 | 命运/时间/成长 |
| 4 | action（反应躲避）| 精准操作坚持更久 | 速度/危机/逃离 |
| 5 | find（寻找解谜）| 观察发现隐藏信息 | 秘密/真相/博物馆 |

## 快速开始

1. 打开 `03_AI_Decision_System/decision.html`，输入主题 → 得到推荐模板
2. 复制对应模板目录到新工程
3. 按 `04_Prompt_Library/02_Coding/architecture.md` 让 Codex 建项目地图
4. 按 `00_Command_Center/48H_TIMELINE.md` 卡时间

## 建设进度

- [x] 目录结构 + 模板1 完整骨架
- [ ] 模板 2-5 骨架
- [ ] 决策器 HTML
- [ ] Prompt 库全文
- [ ] 命令中心四文档

> 维护：斐哥 · 生成：WorkBuddy + ChatGPT Pro（2026-08-25）
