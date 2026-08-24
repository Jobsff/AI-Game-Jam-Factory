# Drag 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 Draggable 预制件，职责是：让任意游戏对象可拖拽，拖动过程通过 EventBus 发出事件。

3. Files Allowed（允许修改的文件）
只允许创建：
- Draggable.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new Draggable(scene, gameObject, config)
// config 可选字段：{ bounds: null, snapBack: false }
```

5. Events（事件）
- DRAG_START：开始拖动
- DRAG_MOVE：拖动中，携带当前坐标
- DRAG_END：松手，携带最终坐标

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不修改 Scene / 全局状态（用 EventBus 通信）
- 不用全局变量
- 代码注释用中文，命名用英文
- 单一职责：只负责"拖拽交互 + 发事件"，不处理拖放后的业务逻辑

7. Acceptance Test（验收标准）
- 对象可被拖动跟随指针，松手停在目标位置
- 设置 bounds 后拖不出边界
- 三个事件按顺序正确发出
