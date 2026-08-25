# Popup 契约

## 职责
创建带遮罩、内容和动作事件的 Phaser 弹窗。

## 非职责
不执行按钮业务，不暂停 Scene，不修改游戏状态。

## 公共 API
- `new Popup(scene, config)`；`config.eventBus` 可注入，缺省使用共享 EventBus。
- `open()`
- `close()`
- `enable()`
- `disable()`
- `reset()`
- `destroy()`

## 事件 payload
- `popup:opened`：`{ id, popup }`
- `popup:closed`：`{ id, popup }`
- `popup:action`：`{ id, action, pointer, popup }`

## 失败行为
非法配置或调用已销毁实例会抛出显式 `TypeError`、`RangeError` 或 `Error`；禁用状态不会产生成功事件。业务性失败会按上述失败事件返回结构化 payload。

## 依赖
EventBus, LifecycleBag, Phaser Scene。除 Phaser 表现/输入适配外，不依赖第三方 npm 包。

## 验收标准
1. 命名导出事件常量、`Popup`，并默认导出 `Popup`。
2. 所有跨模块变化只经 EventBus 输出，实例不修改全局游戏状态。
3. 生命周期方法行为可重复验证，`destroy()` 清除该实例创建的监听或计时器。
4. 浏览器 ES Module 与 Node 20+ 可解析；非视觉逻辑可用轻量 mock 测试。
