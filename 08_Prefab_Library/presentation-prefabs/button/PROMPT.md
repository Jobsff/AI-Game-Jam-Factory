# Button 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 UIButton 预制件，职责是：提供可复用按钮（文本+背景+点击回调+按下反馈动画）。

3. Files Allowed（允许修改的文件）
只允许创建：
- UIButton.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new UIButton(scene, x, y, label, config)
// config 可选字段：{ width: 240, height: 80, bgColor: 0x3d5afe, textStyle: {}, onClick: null }
button.setText(text) / button.disable() / button.enable()
```

5. Events（事件）
- BUTTON_CLICKED：点击时发出，携带按钮引用

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不处理点击后的业务逻辑（用 onClick 回调）
- 不依赖具体游戏状态
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- 按钮正确显示文本和背景，点击触发 onClick 和 BUTTON_CLICKED
- 按下有缩放反馈动画
- 支持 disable/enable
