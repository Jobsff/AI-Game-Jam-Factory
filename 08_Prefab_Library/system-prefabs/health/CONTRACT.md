# HealthSystem 契约

## 职责
维护有上下界的实例生命值并报告耗尽。

## 非职责
不显示血条，不处理死亡或复活流程。

## 公共 API
- `new HealthSystem(config)`；`config.eventBus` 可注入，缺省使用共享 EventBus。
- `damage(amount)`
- `heal(amount)`
- `get()`
- `enable()`
- `disable()`
- `reset()`
- `destroy()`

## 事件 payload
- `health:changed`：`{ value, max, previous, delta }`
- `health:depleted`：`{ value, max, previous, delta }`
- `health:reset`：`{ value, max, previous, delta }`

## 失败行为
非法配置或调用已销毁实例会抛出显式 `TypeError`、`RangeError` 或 `Error`；禁用状态不会产生成功事件。业务性失败会按上述失败事件返回结构化 payload。

## 依赖
EventBus。除 Phaser 表现/输入适配外，不依赖第三方 npm 包。

## 验收标准
1. 命名导出事件常量、`HealthSystem`，并默认导出 `HealthSystem`。
2. 所有跨模块变化只经 EventBus 输出，实例不修改全局游戏状态。
3. 生命周期方法行为可重复验证，`destroy()` 清除该实例创建的监听或计时器。
4. 浏览器 ES Module 与 Node 20+ 可解析；非视觉逻辑可用轻量 mock 测试。
