# 用 Codex 重建 Merger

## Context
Phaser 3、原生 JavaScript、ES Module、无构建工具；浏览器运行，Node 20+ 使用 `node:test`。

## Goal
按可配置且顺序无关的规则匹配两个条目并生成结构化结果。

## Files Allowed
- `08_Prefab_Library/mechanic-prefabs/merge/Merge.js`
- `tests/` 中仅与 `merge` 直接相关的测试文件

## Public Interface
`new Merger(config)`，公开方法：merge(itemA, itemB), enable(), disable(), reset(), destroy()。必须命名导出事件常量、主类并默认导出主类。

## Events
- `merge:succeeded`：`{ ok:true, keys, items, rule, result }`
- `merge:failed`：`{ ok:false, reason, keys, items, result:null }`

## Non-goals
不销毁输入对象，不创建 UI，不修改全局状态。 禁止引入框架、构建链、全局可变状态或运行时 npm 依赖。

## Failure Behaviour
无效配置、无效数值或销毁后调用必须显式抛错；不得静默失败。可预期的业务失败必须返回并发送结构化 payload。

## Acceptance Tests
1. 使用 Node 内置 `node:test` 覆盖成功、失败、禁用、重置和销毁路径。
2. 验证事件名及 payload 字段，验证 `config.eventBus` 注入和共享 EventBus 默认值。
3. 验证 `destroy()` 后不存在遗留监听或计时器。
4. `npm test`、`npm run validate`、`git diff --check` 全部通过。
