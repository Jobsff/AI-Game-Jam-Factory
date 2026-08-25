# 用 Codex 重建 Clickable

## Context
Phaser 3、原生 JavaScript、ES Module、无构建工具；浏览器运行，Node 20+ 使用 `node:test`。

## Goal
为任意可交互对象提供带冷却的点击检测。

## Files Allowed
- `08_Prefab_Library/mechanic-prefabs/click/Clickable.js`
- `tests/` 中仅与 `click` 直接相关的测试文件

## Public Interface
`new Clickable(scene, gameObject, config)`，公开方法：enable(), disable(), reset(), destroy()。必须命名导出事件常量、主类并默认导出主类。

## Events
- `click:clicked`：`{ target, pointer, at }`

## Non-goals
不执行得分、掉落或其他业务规则。 禁止引入框架、构建链、全局可变状态或运行时 npm 依赖。

## Failure Behaviour
无效配置、无效数值或销毁后调用必须显式抛错；不得静默失败。可预期的业务失败必须返回并发送结构化 payload。

## Acceptance Tests
1. 使用 Node 内置 `node:test` 覆盖成功、失败、禁用、重置和销毁路径。
2. 验证事件名及 payload 字段，验证 `config.eventBus` 注入和共享 EventBus 默认值。
3. 验证 `destroy()` 后不存在遗留监听或计时器。
4. `npm test`、`npm run validate`、`git diff --check` 全部通过。
