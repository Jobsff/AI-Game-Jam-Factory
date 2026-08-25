# 预制件重建 Prompt 模板

把以下模板交给 Codex，并替换方括号内容。实现、契约和测试必须同步；不能只生成代码骨架。

## Context
Phaser 3、原生 JavaScript、ES Module、无构建工具；浏览器运行，Node 20+ 仅用于测试和工具。运行时零 npm 依赖。

## Goal
实现 `[ClassName]`，唯一职责是 `[single responsibility]`。

## Files Allowed
- `08_Prefab_Library/[layer]/[id]/[Entry].js`
- `tests/[focused-test].test.js`

## Public Interface
- 构造器接受 `config`，其中 `eventBus` 可注入并默认使用共享 EventBus。
- 命名导出 `[EVENTS_CONSTANT]`、`[ClassName]`，并默认导出 `[ClassName]`。
- 方法：`[minimal lifecycle and domain methods]`。

## Events
- `[event:name]`：`[structured payload]`

## Non-goals
- 不修改全局游戏状态，不实现相邻业务，不增加抽象层、构建链或第三方运行时依赖。

## Failure Behaviour
- 配置错误、无效调用、销毁后调用必须显式抛出具体错误。
- 可预期业务失败发送结构化失败事件；禁止静默吞错。

## Acceptance Tests
1. Node 内置 `node:test` 覆盖成功与失败路径。
2. 验证事件 payload、enable/disable/reset/destroy。
3. 验证 `destroy()` 清除全部监听和计时器，Scene 重启不会重复订阅。
4. `npm test`、`npm run validate`、`git diff --check` 通过。
