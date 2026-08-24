# Dialog 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 DialogBox 预制件，职责是：提供对话框（底部文字框+逐字显示+点击翻页），用于剧情/提示。

3. Files Allowed（允许修改的文件）
只允许创建：
- DialogBox.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new DialogBox(scene, config)
// config 可选字段：{ lines: [{speaker, text}], typeSpeed: 30, portrait: null }
dialog.play() / dialog.skip() / dialog.isPlaying()
```

5. Events（事件）
- DIALOG_COMPLETE：全部台词播放完

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不处理对话结束后的剧情逻辑（用 DIALOG_COMPLETE 事件）
- 不依赖具体游戏状态
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- 台词逐字显示，点击翻到下一句
- 全部播完触发 DIALOG_COMPLETE
- 支持 skip 跳过
