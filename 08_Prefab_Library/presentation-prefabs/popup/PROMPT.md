# Popup 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 Popup 预制件，职责是：提供弹窗（遮罩+居中面板+标题内容+按钮），弹出/关闭带动画。

3. Files Allowed（允许修改的文件）
只允许创建：
- Popup.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new Popup(scene, config)
// config 可选字段：{ title: "", content: "", buttons: [], maskClose: true }
popup.open() / popup.close()
```

5. Events（事件）
- POPUP_OPENED：弹出完成
- POPUP_CLOSED：关闭完成

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不处理弹窗按钮的业务逻辑（用 buttons 的 onClick）
- 不依赖具体游戏状态
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- 弹出显示遮罩+面板+标题内容，带弹出动画
- 点击按钮触发对应 onClick
- 关闭时带动画并触发 POPUP_CLOSED
