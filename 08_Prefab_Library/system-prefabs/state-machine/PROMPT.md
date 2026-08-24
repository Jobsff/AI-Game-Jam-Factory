# State-Machine 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 StateMachine 预制件，职责是：提供通用状态机，注册状态、切换状态、进入/退出回调。

3. Files Allowed（允许修改的文件）
只允许创建：
- StateMachine.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new StateMachine(scene, config)
// config 可选字段：{ initial: "READY", states: { READY: {onEnter,onExit,onUpdate}, ... } }
sm.change(next) / sm.get()
```

5. Events（事件）
- STATE_CHANGED：状态切换，携带旧状态、新状态

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不定义具体游戏状态（由 config 传入）
- 不修改游戏全局状态（用 EventBus 通信）
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- 切换状态触发 onExit(旧) 和 onEnter(新)
- 切换时触发 STATE_CHANGED 事件
- 非法状态名切换不报错、被忽略
