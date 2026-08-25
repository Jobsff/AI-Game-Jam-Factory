# Popup

创建带遮罩、内容和动作事件的 Phaser 弹窗。

## 最小集成

```js
import Popup, { POPUP_EVENTS } from "./Popup.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new Popup(scene, config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
