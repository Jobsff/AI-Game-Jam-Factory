# Spawn 预制件契约

## 职责
实现"按节奏/规则生成对象"的刷怪/生成机制：定时或按波次生成对象，发事件。

## 输入
- 生成对象的工厂函数
- 生成规则（间隔、数量、波次、随机位置范围）

## 输出事件（通过 EventBus）
- `SPAWN`：每次生成时发出（携带新对象）

## 接口
```js
new Spawner(scene, config)
// config: { factory: fn, interval: 1000, max: Infinity, bounds: Rectangle }
spawner.start()
spawner.stop()
spawner.spawnOne()
```

## 禁止事项
- ❌ 不定义"生成什么对象"的具体业务（由 factory 传入）
- ❌ 不修改游戏全局状态

## 验收标准
1. 按 interval 定时生成对象并触发 SPAWN 事件
2. 支持手动 spawnOne 和 stop
3. 生成位置在 bounds 范围内（若配置）
