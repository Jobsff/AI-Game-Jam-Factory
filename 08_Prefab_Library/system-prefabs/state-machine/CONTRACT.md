# StateMachine 契约

## 职责
运行调用方声明的有限状态及进入、退出、更新钩子。

## 非职责
不定义游戏状态，不吞掉未知状态错误。

## 公共 API
- `new StateMachine(config)`；`config.eventBus` 可注入，缺省使用共享 EventBus。
- `change(next, data)`
- `update(delta, data)`
- `get()`
- `enable()`
- `disable()`
- `reset()`
- `destroy()`

## 事件 payload
- `state-machine:changed`：`{ previous, current, data }`
- `state-machine:reset`：`{ previous, current }`

## 失败行为
非法配置或调用已销毁实例会抛出显式 `TypeError`、`RangeError` 或 `Error`；禁用状态不会产生成功事件。业务性失败会按上述失败事件返回结构化 payload。

## 依赖
EventBus。除 Phaser 表现/输入适配外，不依赖第三方 npm 包。

## 验收标准
1. 命名导出事件常量、`StateMachine`，并默认导出 `StateMachine`。
2. 所有跨模块变化只经 EventBus 输出，实例不修改全局游戏状态。
3. 生命周期方法行为可重复验证，`destroy()` 清除该实例创建的监听或计时器。
4. 浏览器 ES Module 与 Node 20+ 可解析；非视觉逻辑可用轻量 mock 测试。
