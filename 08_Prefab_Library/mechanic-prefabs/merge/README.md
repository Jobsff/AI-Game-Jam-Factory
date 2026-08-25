# Merger

按可配置且顺序无关的规则匹配两个条目并生成结构化结果。

## 最小集成

```js
import Merger, { MERGE_EVENTS } from "./Merge.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new Merger(config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
