# StateMachine

运行调用方声明的有限状态及进入、退出、更新钩子。

## 最小集成

```js
import StateMachine, { STATE_MACHINE_EVENTS } from "./StateMachine.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new StateMachine(config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
