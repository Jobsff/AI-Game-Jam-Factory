# CountdownTimer

提供秒级倒计时、暂停、恢复、循环和清理。

## 最小集成

```js
import CountdownTimer, { TIMER_EVENTS } from "./CountdownTimer.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new CountdownTimer(config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
