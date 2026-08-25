# Merger 契约

## 职责
按可配置且顺序无关的规则匹配两个条目并生成结构化结果。

## 非职责
不销毁输入对象，不创建 UI，不修改全局状态。

## 公共 API
- `new Merger(config)`；`config.eventBus` 可注入，缺省使用共享 EventBus。
- `merge(itemA, itemB)`
- `enable()`
- `disable()`
- `reset()`
- `destroy()`

## 事件 payload
- `merge:succeeded`：`{ ok:true, keys, items, rule, result }`
- `merge:failed`：`{ ok:false, reason, keys, items, result:null }`

## 失败行为
非法配置或调用已销毁实例会抛出显式 `TypeError`、`RangeError` 或 `Error`；禁用状态不会产生成功事件。业务性失败会按上述失败事件返回结构化 payload。

## 依赖
EventBus。除 Phaser 表现/输入适配外，不依赖第三方 npm 包。

## 验收标准
1. 命名导出事件常量、`Merger`，并默认导出 `Merger`。
2. 所有跨模块变化只经 EventBus 输出，实例不修改全局游戏状态。
3. 生命周期方法行为可重复验证，`destroy()` 清除该实例创建的监听或计时器。
4. 浏览器 ES Module 与 Node 20+ 可解析；非视觉逻辑可用轻量 mock 测试。
