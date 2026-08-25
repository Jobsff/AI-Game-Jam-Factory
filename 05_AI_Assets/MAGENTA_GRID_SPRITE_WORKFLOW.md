# 品红网格 Sprite 工作流

- [ ] 在 Style Bible 固定轮廓、色板、线宽、镜头和光向。
- [ ] 填 `sprite-manifest.json`：单帧宽高、行列、动作顺序、anchor。
- [ ] 生成输入明确“纯 `#FF00FF` 背景、无阴影、每格等宽等高、角色不得跨格”。
- [ ] 用 [`A05 Prompt`](../04_Prompt_Library/03_Art/sprite-sheet.md)输出行列与帧编号。
- [ ] 检查四角像素均为 `#FF00FF`，角色内部不得使用近似品红；否则重新生成。
- [ ] 按 manifest 切片，逐帧检查画布尺寸与 anchor 漂移。
- [ ] 去底后保留透明 RGBA；不得用有损格式承载透明 Sprite。
- [ ] 在游戏中播放 idle/action/hit/restart；确认最后一帧不闪回品红。
- [ ] 将来源、工具、license/条款写入 manifest；未知写“待核验”。

验收：相邻帧 anchor 位移 ≤ `{{MAX_ANCHOR_DRIFT_PX}}` px；边缘残留品红像素 ≤ `{{MAX_MAGENTA_FRINGE_PIXELS}}`；两个阈值均需现场填写。
