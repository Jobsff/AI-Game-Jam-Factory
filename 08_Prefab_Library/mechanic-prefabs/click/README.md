# Clickable

为任意可交互对象提供带冷却的点击检测。

## 最小集成

```js
import Clickable, { CLICK_EVENTS } from "./Clickable.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new Clickable(scene, gameObject, config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
