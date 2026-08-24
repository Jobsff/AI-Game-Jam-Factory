# 🧱 预制件模板库（Prefab Library）

> **核心认知**：预制件不是"代码碎片库"，而是"经过验证的游戏能力模块"。
> 目标不是让 Codex 从 100 个组件里自由组合，而是让它在**有限、稳定、有契约的积木**里搭建。
> 类比 LEGO：颗粒太小拼不出来，一体件太多没有变化——关键是**正确粒度**。

## 五层架构

```
玩法母件 Gameplay Prefab   → Layer 1（在 ../01_Template_Games/）
    ↓ 决定"游戏是什么"
交互机制件 Mechanic Prefab → Layer 2（本目录 mechanic-prefabs/）
    ↓ 决定"游戏怎么动"
游戏系统件 System Prefab    → Layer 3（本目录 system-prefabs/）
    ↓ 决定"数值怎么算"
表现组件件 Presentation     → Layer 4（本目录 presentation-prefabs/）
    ↓ 决定"长什么样"
基础服务件 Core Service     → Layer 5（在 ../02_Game_Core/）
```

| 层 | 目录 | 说明 | 示例 |
|----|------|------|------|
| L1 玩法母件 | `../01_Template_Games/` | 一次决定"游戏是什么" | collect-create / defense / choice / action / find |
| L2 机制件 | `mechanic-prefabs/` | 游戏动作（**最重要新增层**）| click / drag / merge / timer / spawn |
| L3 系统件 | `system-prefabs/` | 数值系统 | score / health / state-machine |
| L4 表现件 | `presentation-prefabs/` | UI 与反馈 | button / popup / dialog |
| L5 基础服务 | `../02_Game_Core/` | 最稳定的底层 | EventBus / GameState / InputManager / TweenHelper |

**组合示例**：主题"修复森林"不一定套完整模板，可能是 `collect + merge + health` 三个机制件拼装。

## 每个预制件 = 4 个文件（缺一不可）

```
merge/
├── Merge.js      # 代码（由 Codex 生成，本仓库不预写）
├── README.md     # 一句话说明 + 用法
├── CONTRACT.md   # 契约（最重要，管住 AI 不乱改）
└── PROMPT.md     # 给 Codex 的生成提示词
```

## 预制件粒度三原则（拆多细的判据）

一个 Prefab 必须同时满足：
1. **单独有游戏意义**（Timer 有意义；"BlueButton" 没意义）
2. **可独立测试**
3. **Codex 一句话能理解**（"创建倒计时组件" ✅；"创建支持事件驱动状态同步多层UI绑定动画生命周期管理按钮计时系统" ❌）

> ⚠️ 不要拆成 500 个小组件（BlueButton/RedButton/SmallButton...）= 死亡。

## GitHub 借鉴策略（已评估）

| 来源 | 建议 | 理由 |
|------|------|------|
| Phaser 官方 Create 模板画廊 | ⭐⭐⭐⭐⭐ **直接参考玩法逻辑，重写成自己的 Prefab** | 官方最佳实践，API 正确 |
| ag-game/phaser-toolkit | ⭐⭐⭐ 学思想不复制 | 工程化思路好，但 48h 用不上 React 式状态管理 |
| luminus-rpg (ECS) | ⭐⭐ 跳过 | RPG 场景，H5 Game Jam 用不上，引入架构成本 |
| webpack/TS boilerplate | ⭐⭐ 跳过 | 我们用 CDN + JS，不引入构建工具 |

**License 原则（商业化考虑）**：优先 MIT/BSD/Apache-2.0；谨慎 GPL；**避免 AGPL、CC-NC**（尤其游戏素材）。

## 建设优先级（赛前最高 ROI）

第一批先做这 11 个，覆盖 80% 的 48h Game Jam 场景：

- **机制件**：click（点击）、drag（拖拽）、merge（合成）、timer（倒计时）、spawn（生成）
- **系统件**：score（计分）、health（生命值）、state-machine（状态机）
- **表现件**：button（按钮）、popup（弹窗）、dialog（对话框）

> 目标不是建"Phaser 组件市场"，而是建一条**48 小时内把任何主题快速转化为可玩 Demo 的 AI 游戏生产线**。

## 分工铁律

- 人（斐哥）：设计目录 + 写 CONTRACT/PROMPT（本仓库已备好）
- Codex：按 PROMPT.md 生成 `*.js` 代码
- 验收：按 CONTRACT.md 的 Acceptance Test 逐条核对
