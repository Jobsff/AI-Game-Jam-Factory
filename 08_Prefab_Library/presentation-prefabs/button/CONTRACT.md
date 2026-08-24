# Button 预制件契约

## 职责
提供可复用按钮：文本 + 背景 + 点击回调 + 按下反馈动画。

## 输入
- 位置、文本、样式配置（宽高、背景色、圆角、字号）
- 点击回调

## 输出事件（通过 EventBus）
- `BUTTON_CLICKED`：点击时发出（携带按钮引用）

## 接口
```js
new UIButton(scene, x, y, label, config)
// config: { width, height, bgColor, textStyle, onClick }
button.setText(text) / button.disable() / button.enable()
```

## 禁止事项
- ❌ 不处理点击后的业务逻辑（用 onClick / 事件回调）
- ❌ 不依赖具体游戏状态

## 验收标准
1. 按钮正确显示文本和背景，点击触发 onClick 和 BUTTON_CLICKED
2. 按下有缩放反馈动画
3. 支持 disable/enable
