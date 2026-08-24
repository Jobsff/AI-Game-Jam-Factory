# Dialog 预制件契约

## 职责
提供对话框（剧情/提示用）：底部文字框 + 逐字显示 + 点击翻页，支持立绘头像。

## 输入
- 台词列表（可含说话人）
- 可选：头像、打字速度、跳过开关

## 输出事件（通过 EventBus）
- `DIALOG_COMPLETE`：全部台词播放完

## 接口
```js
new DialogBox(scene, config)
// config: { lines: [{speaker, text}], typeSpeed: 30, portrait: {...} }
dialog.play() / dialog.skip() / dialog.isPlaying()
```

## 禁止事项
- ❌ 不处理对话结束后的剧情逻辑（用 DIALOG_COMPLETE 事件）
- ❌ 不依赖具体游戏状态

## 验收标准
1. 台词逐字显示，点击翻到下一句
2. 全部播完触发 DIALOG_COMPLETE
3. 支持 skip 跳过
