# Timer 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 Timer 预制件，职责是：提供倒计时能力，时间到通过 EventBus 发事件，支持暂停/继续/重置。

3. Files Allowed（允许修改的文件）
只允许创建：
- Timer.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new Timer(scene, config)
// config 可选字段：{ duration: 30, loop: false, tick: false }
timer.start() / timer.pause() / timer.resume() / timer.reset()
```

5. Events（事件）
- TIMER_TICK：每秒触发，携带剩余秒数（仅当 tick=true）
- TIMER_END：倒计时结束触发

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不负责显示倒计时文字（显示由 UI 层监听事件做）
- 不修改游戏全局状态（用 EventBus 通信）
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- 倒计时到 0 触发 TIMER_END
- 支持暂停/继续/重置
- 设置 tick 后每秒触发 TIMER_TICK
