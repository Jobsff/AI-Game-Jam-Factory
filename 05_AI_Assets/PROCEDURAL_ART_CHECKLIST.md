# 无 AI 接口时的程序美术清单

## 先保反馈

- [ ] 玩家、目标、危险物使用三种明显不同的形状与对比色。
- [ ] hover/pressed/hit/success/fail 至少用颜色、缩放、位移中的两种反馈区分。
- [ ] 重要对象使用描边或 halo，不依赖复杂纹理。
- [ ] 动态文案由代码绘制，不烘焙进图片。

## Phaser Graphics 最小资产

- [ ] 用 `circle/rect/triangle/line` 生成占位纹理并缓存复用。
- [ ] 背景只用 2–3 个色块、渐进层或稀疏粒子，不遮挡交互。
- [ ] 用 tween 表达 spawn/hit/merge/result；统一时长 token。
- [ ] UI 使用 `UI_TOKENS_TEMPLATE.json` 的色板、间距、圆角与 44 CSS px 触控下限。
- [ ] 粒子数量和 alpha 有上限；低性能设备可关闭非核心效果。

## 验收与记录

- [ ] 720×1280 与目标设备均可辨识；色盲风险不只靠颜色表达。
- [ ] restart 后 Graphics/tween/timer/listener 均被清理。
- [ ] 在 Sprite Manifest 将程序资产来源写为 `in-repository procedural`。
- [ ] 在 AI usage log 写明此段未使用 AI 生成接口。
