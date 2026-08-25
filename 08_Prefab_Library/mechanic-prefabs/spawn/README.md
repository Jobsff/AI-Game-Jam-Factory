# Spawner

按间隔或手动调用工厂函数生成条目并限制总数。

## 最小集成

```js
import Spawner, { SPAWN_EVENTS } from "./Spawner.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new Spawner(config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
