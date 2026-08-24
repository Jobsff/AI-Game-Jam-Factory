# State-Machine 预制件契约

## 职责
提供通用状态机：注册状态、切换状态、状态进入/退出回调。

## 输入
- 状态定义表（状态名 → { onEnter, onExit, onUpdate }）

## 输出事件（通过 EventBus）
- `STATE_CHANGED`：状态切换（携带旧状态、新状态）

## 接口
```js
new StateMachine(scene, config)
// config: { initial: "READY", states: { READY: {...}, PLAYING: {...} } }
sm.change(next) / sm.get()
```

## 禁止事项
- ❌ 不定义具体游戏状态（由 config 传入）
- ❌ 不修改游戏全局状态

## 验收标准
1. 切换状态触发 onExit(旧) 和 onEnter(新)
2. 切换时触发 STATE_CHANGED 事件
3. 非法状态名切换不报错、被忽略
