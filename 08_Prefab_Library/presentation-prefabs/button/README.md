# UIButton

创建可启停的 Phaser 文本按钮并输出点击事件。

## 最小集成

```js
import UIButton, { BUTTON_EVENTS } from "./UIButton.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new UIButton(scene, config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
