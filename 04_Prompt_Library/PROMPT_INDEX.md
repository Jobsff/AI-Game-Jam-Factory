# Prompt 索引

用法：按时机选 ID → 打开文件 → 填完“变量区”所有 `{{FIELD}}` → 原样复制“可直接使用的 Prompt”。每份 Prompt 都固定包含变量区、不可违反约束、固定输出格式和可勾选自检。

## 设计

| ID | 时机 | 输入 | 输出 | 主要风险 | Prompt |
|---|---|---|---|---|---|
| D01 | 主题公布 0–7 分钟 | 主题/规则/限制 | 四角度与动作提示 | 把主题只当换皮 | [主题拆解](01_Design/theme-analysis.md) |
| D02 | 孩子在线 | 原话/表达偏好 | 差异化追问与记录 | 成人诱导、虚假贡献 | [儿童在线脑暴](01_Design/child-online-brainstorm.md) |
| D03 | 孩子卡壳 | 已问问题/最后反应 | 低压力再介入 | 连续逼问 | [儿童卡壳再介入](01_Design/child-stuck-reentry.md) |
| D04 | 恰好 3 候选 | 决策器上下文 | 专家交叉质疑 | 伪角色扮演、AI 拍板 | [四专家圆桌](01_Design/expert-roundtable.md) |
| D05 | 圆桌后 | 候选/证据/美术数 | 六指标与排序 | 总分覆盖硬淘汰 | [3 候选评分](01_Design/three-candidate-scoring.md) |
| D06 | 唯一拍板后 | 方案/模板/限制 | GDD/TDD 冻结 | 范围继续漂移 | [GDD/TDD 冻结](01_Design/gdd-tdd-freeze.md) |

## 编码

| ID | 时机 | 输入 | 输出 | 主要风险 | Prompt |
|---|---|---|---|---|---|
| C01 | 编码前 | GDD/TDD/仓库树 | 三层 GAME_MAP | 未读地图就写代码 | [架构地图](02_Coding/architecture.md) |
| C02 | 单模块前 | 地图/调用方/事件 | 模块契约 | 隐式依赖 | [模块契约](02_Coding/module-contract.md) |
| C03 | 契约冻结后 | 契约/目标文件/测试 | 单 Prefab + test | 一次改太多文件 | [单预制件实现](02_Coding/single-prefab-implementation.md) |
| C04 | 单测通过后 | 地图/宿主 Scene | 集成与清理验证 | restart 重复监听 | [预制件集成](02_Coding/prefab-integration.md) |
| C05 | 缺陷可复现时 | expected/actual/console | root cause 修复 | 猜修、顺手重构 | [Debug 根因修复](02_Coding/debug-fix.md) |
| C06 | 功能冻结点 | 冻结文档/diff | 越界审计 | 偷增功能 | [冻结审计](02_Coding/freeze-audit.md) |
| C07 | 提交前 | diff/测试/license | Go/No-Go 审查 | 未运行却报通过 | [提交前审查](02_Coding/pre-submit-review.md) |

## 美术

| ID | 时机 | 输入 | 输出 | 主要风险 | Prompt |
|---|---|---|---|---|---|
| A01 | 首批生图前 | 主题/情绪/设备 | Style Bible | 模仿特定艺术家/IP | [Style Bible](03_Art/style-bible.md) |
| A02 | 风格冻结后 | 角色功能/动作 | 角色资产 brief | 轮廓不清 | [角色](03_Art/character.md) |
| A03 | 场景确定后 | 镜头/留白 | 分层背景 brief | 背景抢交互对比 | [背景](03_Art/background.md) |
| A04 | HUD 冻结后 | 字段/输入/安全区 | UI Kit | 烘焙动态文案 | [UI Kit](03_Art/ui-kit.md) |
| A05 | 动作帧确定后 | 网格/帧/尺寸 | 品红网格切片表 | 跨格、尺寸漂移 | [品红网格 Sprite](03_Art/sprite-sheet.md) |
| A06 | 每批导入前 | Bible/manifest/预览 | 风格偏差清单 | 无关重做 | [一致性审查](03_Art/style-consistency-review.md) |
| A07 | 90 分钟节点 | 等级/耗时/阻断 | A/B/C 降级动作 | “快好了”续时 | [三级降级](03_Art/three-level-fallback.md) |

## 音频

| ID | 时机 | 输入 | 输出 | 主要风险 | Prompt |
|---|---|---|---|---|---|
| U01 | 核心循环可玩后 | 情绪/状态/响度 | BGM brief | 模仿曲目/掩盖 SFX | [BGM](04_Audio/bgm.md) |
| U02 | 事件冻结后 | 事件/材质/情绪 | SFX Pack brief | cue 重复/来源不明 | [SFX Pack](04_Audio/sfx.md) |
| U03 | 音频实现前 | 状态/事件/文件 | Cue Sheet CSV | 事件名不一致 | [Audio Cue Sheet](04_Audio/audio-cue-sheet.md) |

## 路演

| ID | 时机 | 输入 | 输出 | 主要风险 | Prompt |
|---|---|---|---|---|---|
| P01 | 08-30 09:00 前 | 成品/证据/限制 | 3–5 分钟镜头表 | 展示不存在功能 | [演示视频](05_Pitch/demo-video.md) |
| P02 | 成品一致后 | 主题/动作/记忆点 | 30 秒口播 | 先讲技术、夸大贡献 | [30 秒 Pitch](05_Pitch/30-second-pitch.md) |
| P03 | 提交文档时 | AI usage log | AI 使用说明 | 人机贡献混淆 | [AI 使用说明](05_Pitch/ai-usage-statement.md) |
| P04 | 路演彩排 | GDD/TDD/测试/日志 | 评委 Q&A | 虚构数据与评分 | [评委 Q&A](05_Pitch/judge-qa.md) |
