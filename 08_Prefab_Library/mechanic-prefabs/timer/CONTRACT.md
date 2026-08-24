# Timer 预制件契约

## 职责
提供倒计时/计时挑战能力：倒计时结束发事件，支持暂停/继续/重置。

## 输入
- 时长（秒）
- 可选：是否循环、时间到回调

## 输出事件（通过 EventBus）
- `TIMER_TICK`：每秒（可选，携带剩余秒数）
- `TIMER_END`：倒计时结束

## 接口
```js
new Timer(scene, config)
// config: { duration: 30, loop: false, tick: false }
timer.start()
timer.pause()
timer.resume()
timer.reset()
```

## 禁止事项
- ❌ 不负责显示倒计时文字（显示由 UI 层监听事件做）
- ❌ 不修改游戏全局状态

## 验收标准
1. 倒计时到 0 触发 TIMER_END
2. 支持暂停/继续/重置
3. 设置 tick 后每秒触发 TIMER_TICK
