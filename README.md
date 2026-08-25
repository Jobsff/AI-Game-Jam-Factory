# AI Game Jam Factory

离线优先的现场作战系统：60 分钟唯一方案决策、5 个 Phaser 玩法母件、Prefab/Core、Codex 三层地图与模块契约、Prompt/资产生产线、四阶段验收与 Node 20 CI 门槛。

## 5 分钟 Quick Start

```bash
cd /path/to/AI-Game-Jam-Factory
npm test
npm run validate
npm run serve
# 浏览器打开 http://localhost:4173/
```

1. [ ] 打开 [`decision.html`](03_AI_Decision_System/decision.html)，确认可离线保存与导出。
2. [ ] 进入 [`60 分钟决策 SOP`](00_Command_Center/60_MINUTE_DECISION_SOP.md)，主题公布后只保留 3 候选并锁定唯一方案。
3. [ ] 生成新工程，把 GDD/TDD/GAME_MAP 与首个模块契约放入工程。
4. [ ] Codex 按根 [`AGENTS.md`](AGENTS.md)每轮只改一个模块、最多 3 文件。
5. [ ] 每个里程碑跑项目测试与四阶段清单；08-30 11:00 前完成视频。

## 现场 60 分钟入口

- 主流程：[`00_Command_Center/60_MINUTE_DECISION_SOP.md`](00_Command_Center/60_MINUTE_DECISION_SOP.md)
- 离线工具：[`03_AI_Decision_System/decision.html`](03_AI_Decision_System/decision.html)
- 儿童原话：[`CHILD_CREATIVE_SCRIPT.md`](00_Command_Center/CHILD_CREATIVE_SCRIPT.md)
- AI 圆桌：[`AI_ROUNDTABLE_SOP.md`](00_Command_Center/AI_ROUNDTABLE_SOP.md)
- Prompt 总索引：[`PROMPT_INDEX.md`](04_Prompt_Library/PROMPT_INDEX.md)

## 生成新工程

```bash
npm run new-game -- \
  --template template_find \
  --name "My Game" \
  --slug my-game \
  --output /absolute/path/to/my-game
```

可选模板：`template_collect_create`、`template_defense`、`template_choice`、`template_action`、`template_find`。生成过程是事务式的：先在临时 sibling 目录组装并运行 `scripts/validate-game.mjs`，验证通过后再 rename 到目标路径；拒绝危险/已存在目标。

## 验证命令

| 命令 | 作用 |
|---|---|
| `npm test` | Node 单测；包括 Core/Prefab/创建器与决策器权重、硬淘汰、排序 |
| `npm run validate` | 文档内部链接、manifest、Prompt 固定字段、清单、模板结构、JS/JSON |
| `npm run smoke` | 静态服务器关键离线资源 smoke |
| `npm run browser-smoke` | 自动发现 Chrome/Puppeteer headless-shell，加载 5 模板并确认 canvas/console |
| `npm run verify` | 顺序运行以上全部门槛 |
| `git diff --check` | 检查 whitespace error |

`scripts/serve.mjs` 会阻止符号链接逃逸服务根目录；`scripts/validate-game.mjs` 验证生成工程；`scripts/browser-smoke.mjs` 会自动查找 Puppeteer 缓存的 headless-shell。浏览器 smoke 没有浏览器时会报告 skipped；CI/现场最终验收必须提供 Chrome 并通过，不能用 skipped 替代。`scripts/validate.mjs` 以脚本自身位置定位仓库根，任意工作目录下可直接执行。仓库多处使用 `import.meta.dirname`，本地与 CI 均需 Node ≥ 20.11（`package.json` 的 `engines` 已声明该下限）。

## 目录导航

| 目录/文件 | 已完成内容 |
|---|---|
| [`00_Command_Center/`](00_Command_Center/) | 决策、团队模式、AI 圆桌、技术冻结、美术降级、开源政策、48h 节点 |
| [`01_Template_Games/`](01_Template_Games/) | 5 个离线 Phaser 玩法母件 |
| [`02_Game_Core/`](02_Game_Core/) | EventBus/GameState/Input/Audio/Lifecycle/UI/effects |
| [`03_AI_Decision_System/`](03_AI_Decision_System/) | 单文件决策器 + theme/template/scoring JSON + 纯函数 |
| [`04_Prompt_Library/PROMPT_INDEX.md`](04_Prompt_Library/PROMPT_INDEX.md) | 27 份设计/编码/美术/音频/路演 Prompt |
| [`05_AI_Assets/`](05_AI_Assets/) | Style Bible、非模仿预设、Sprite/UI/SFX、品红网格与程序美术 |
| [`06_GameJam_Checklist/`](06_GameJam_Checklist/) | before-start/development/submission/presentation 四阶段勾选验收 |
| [`07_Examples/`](07_Examples/) | 5 个结构配方与已提供获奖案例的待核验迁移规律 |
| [`08_Prefab_Library/`](08_Prefab_Library/) | 11 个 Prefab、契约、Prompt 与 manifest |
| [`AGENTS.md`](AGENTS.md) | Codex 三层地图/模块契约/Debug 协议 |
| [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) | 自研内容与 Phaser runtime 边界 |

## 第二阶段稳定接口（保留）

5 个模板保留 `armRestart` / `restartPending`，避免重复 restart；`globalThis.__FACTORY_GAME__` 供 browser smoke/现场调试；BootScene 用两次 `fillTriangle` 生成占位星形。这些是测试与生命周期契约，不应在玩法改造时删除。

## 商业化许可证警示

比赛可用不等于可商业化。官方模板仅研究后重写；优先 MIT/BSD/Apache，GPL/AGPL/CC-NC 与未知 license 先排除或逐项审计。商业化前必须审计代码、Phaser、字体、图像、音频、模型、生成工具条款与训练/输入来源；详见 [`OPEN_SOURCE_POLICY.md`](00_Command_Center/OPEN_SOURCE_POLICY.md) 和 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。不要擅自给整个仓库添加开源 LICENSE。
