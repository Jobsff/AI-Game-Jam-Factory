# Draggable

为单个游戏对象提供边界约束和可清理的拖拽生命周期。

## 最小集成

```js
import Draggable, { DRAG_EVENTS } from "./Draggable.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new Draggable(scene, gameObject, config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
