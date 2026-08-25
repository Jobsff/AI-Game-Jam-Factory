# DialogBox

逐字播放结构化台词并支持点击补全和翻页。

## 最小集成

```js
import DialogBox, { DIALOG_EVENTS } from "./DialogBox.js";

// 按构造契约传入 scene/gameObject/config；跨模块结果统一监听 eventBus。
const prefab = new DialogBox(scene, config);
```

构造参数和事件 payload 见 [CONTRACT.md](./CONTRACT.md)。页面或 Scene 结束时必须调用：

```js
prefab.destroy();
```
