# ScoreSystem

维护实例内分数并发出结构化变化事件。

## 最小集成

```js
import ScoreSystem, { SCORE_EVENTS } from "./ScoreSystem.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new ScoreSystem(config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
