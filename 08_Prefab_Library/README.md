# 预制件库

这是 Phaser 3 + 原生 JavaScript ES Module 的首批已验证积木。预制件只维护自身实例状态；跨模块变化统一通过可注入 EventBus 输出。运行时零 npm 依赖，无构建步骤。

## 分层与清单

- `mechanic-prefabs/`：click、drag、merge、timer、spawn
- `system-prefabs/`：score、health、state-machine
- `presentation-prefabs/`：button、popup、dialog
- `prefab.manifest.json`：机器可读入口、依赖、事件与验证状态
- `../02_Game_Core/`：EventBus、GameState、InputManager、AssetLoader、LifecycleBag、AudioManager、TweenHelper

每个预制件目录固定包含实现 `.js`、`README.md`、`CONTRACT.md`、`PROMPT.md`。契约是行为真源，Prompt 可直接交给 Codex 重建对应模块。

## 最小组合

```js
import EventBus from "../02_Game_Core/core/EventBus.js";
import ScoreSystem, { SCORE_EVENTS } from "./system-prefabs/score/ScoreSystem.js";
import Merger, { MERGE_EVENTS } from "./mechanic-prefabs/merge/Merge.js";

const score = new ScoreSystem({ eventBus: EventBus });
const merger = new Merger({
  eventBus: EventBus,
  rules: new Map([["seed+water", "sprout"]])
});
const unsubscribe = EventBus.on(MERGE_EVENTS.SUCCEEDED, () => score.add(10));
EventBus.on(SCORE_EVENTS.CHANGED, ({ value }) => console.log(value));

merger.merge("water", "seed");

// Scene shutdown
unsubscribe();
merger.destroy();
score.destroy();
```

Node 使用 `package.json#imports` 的 `#factory/*` 与 `#prefabs/*`。浏览器模板应配置同名 import map 并指向 `./02_Game_Core/`、`./08_Prefab_Library/`；当前源码也保留浏览器可直接解析的相对导入。

## 验证

```sh
npm test
npm run validate
git diff --check
```
