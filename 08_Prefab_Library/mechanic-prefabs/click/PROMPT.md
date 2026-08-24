# Click 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 Clickable 预制件，职责是：让任意游戏对象可被点击，点击后通过 EventBus 发出事件。

3. Files Allowed（允许修改的文件）
只允许创建：
- Clickable.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new Clickable(scene, gameObject, config)
// config 可选字段：{ cooldown: 0, onClick: null }
// 挂载后对象自动 setInteractive，点击触发 OBJECT_CLICKED 事件
```

5. Events（事件）
- OBJECT_CLICKED：点击成功时发出，参数为被点击对象引用

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不修改 Scene / 全局状态（用 EventBus 通信）
- 不用全局变量
- 代码注释用中文，命名用英文
- 单一职责：只负责"点击检测 + 发事件"，不处理点击后的业务逻辑

7. Acceptance Test（验收标准）
- 给任意 Phaser 对象挂载后，点击能触发 OBJECT_CLICKED 事件
- 设置 cooldown 后，冷却期内重复点击不触发
- 不引入外部依赖，单个文件可独立运行
