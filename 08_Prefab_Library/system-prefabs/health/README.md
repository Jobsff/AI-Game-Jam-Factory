# HealthSystem

维护有上下界的实例生命值并报告耗尽。

## 最小集成

```js
import HealthSystem, { HEALTH_EVENTS } from "./HealthSystem.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new HealthSystem(config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
