# Spawner 契约

## 职责
按间隔或手动调用工厂函数生成条目并限制总数。

## 非职责
不定义生成对象类型，不保存到全局状态。

## 公共 API
- `new Spawner(config)`；`config.eventBus` 可注入，缺省使用共享 EventBus。
- `start()`
- `stop()`
- `spawnOne()`
- `enable()`
- `disable()`
- `reset()`
- `destroy()`

## 事件 payload
- `spawn:spawned`：`{ item, index, position }`
- `spawn:limit-reached`：`{ count, max }`

## 失败行为
非法配置或调用已销毁实例会抛出显式 `TypeError`、`RangeError` 或 `Error`；禁用状态不会产生成功事件。业务性失败会按上述失败事件返回结构化 payload。

## 依赖
EventBus, setInterval/clearInterval。除 Phaser 表现/输入适配外，不依赖第三方 npm 包。

## 验收标准
1. 命名导出事件常量、`Spawner`，并默认导出 `Spawner`。
2. 所有跨模块变化只经 EventBus 输出，实例不修改全局游戏状态。
3. 生命周期方法行为可重复验证，`destroy()` 清除该实例创建的监听或计时器。
4. 浏览器 ES Module 与 Node 20+ 可解析；非视觉逻辑可用轻量 mock 测试。
