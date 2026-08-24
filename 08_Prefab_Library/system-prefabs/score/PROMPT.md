# Score 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 ScoreSystem 预制件，职责是：管理分数（加分/减分/清零/读取），变化时通过 EventBus 发事件。

3. Files Allowed（允许修改的文件）
只允许创建：
- ScoreSystem.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new ScoreSystem(scene, config)
// config 可选字段：{ initial: 0 }
score.add(n) / score.sub(n) / score.reset() / score.get()
```

5. Events（事件）
- SCORE_CHANGED：分数变化，携带当前分数和变化量

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不负责显示分数（显示由 UI 层监听事件做）
- 不修改游戏全局状态（用 EventBus 通信）
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- add/sub 正确更新分数并触发 SCORE_CHANGED
- reset 归零
- 支持读取当前分数
