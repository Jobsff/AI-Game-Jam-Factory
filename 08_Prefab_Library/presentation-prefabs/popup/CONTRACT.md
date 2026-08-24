# Popup 预制件契约

## 职责
提供弹窗：半透明遮罩 + 居中面板，可配置标题/内容/按钮，弹出/关闭带动画。

## 输入
- 标题、内容文本、按钮列表
- 可选：是否点击遮罩关闭

## 输出事件（通过 EventBus）
- `POPUP_OPENED` / `POPUP_CLOSED`

## 接口
```js
new Popup(scene, config)
// config: { title, content, buttons: [{label, onClick}], maskClose: true }
popup.open() / popup.close()
```

## 禁止事项
- ❌ 不处理弹窗按钮的业务逻辑（用 buttons 的 onClick）
- ❌ 不依赖具体游戏状态

## 验收标准
1. 弹出显示遮罩 + 面板 + 标题内容，带弹出动画
2. 点击按钮触发对应 onClick
3. 关闭时带动画并触发 POPUP_CLOSED
