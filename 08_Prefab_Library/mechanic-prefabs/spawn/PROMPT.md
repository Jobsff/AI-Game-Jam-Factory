# Spawn 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 Spawner 预制件，职责是：按节奏/规则生成对象，通过 EventBus 发事件。

3. Files Allowed（允许修改的文件）
只允许创建：
- Spawner.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new Spawner(scene, config)
// config 可选字段：{ factory: fn, interval: 1000, max: Infinity, bounds: null }
spawner.start() / spawner.stop() / spawner.spawnOne()
```

5. Events（事件）
- SPAWN：每次生成时发出，携带新对象

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不定义"生成什么对象"的具体业务（由 factory 函数传入）
- 不修改游戏全局状态（用 EventBus 通信）
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- 按 interval 定时生成对象并触发 SPAWN 事件
- 支持手动 spawnOne 和 stop
- 生成位置在 bounds 范围内（若配置）
