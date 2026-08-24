# Score 预制件契约

## 职责
管理分数：加分/减分/清零/读取，变化时发事件。

## 输入
- 初始分数
- 可选：连击倍率、最高分记录

## 输出事件（通过 EventBus）
- `SCORE_CHANGED`：分数变化（携带当前分数、变化量）

## 接口
```js
new ScoreSystem(scene, config)
// config: { initial: 0, combo: false }
score.add(n) / score.sub(n) / score.reset() / score.get()
```

## 禁止事项
- ❌ 不负责显示分数（显示由 UI 层监听事件做）
- ❌ 不处理业务规则（加多少由调用方决定）

## 验收标准
1. add/sub 正确更新分数并触发 SCORE_CHANGED
2. reset 归零
3. 支持读取当前分数
