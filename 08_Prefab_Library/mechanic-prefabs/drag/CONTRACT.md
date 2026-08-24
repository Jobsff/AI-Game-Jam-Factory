# Drag 预制件契约

## 职责
为游戏对象提供拖拽交互：按住拖动，松手落下，拖动中/结束时发事件。

## 输入
- 一个 Phaser 游戏对象
- 可选配置：是否限制拖拽范围、是否松手回弹、拖动偏移

## 输出事件（通过 EventBus）
- `DRAG_START`：开始拖动
- `DRAG_MOVE`：拖动中（携带坐标）
- `DRAG_END`：松手（携带最终坐标）

## 接口
```js
new Draggable(scene, gameObject, config)
// config: { bounds?: Phaser.Geom.Rectangle, snapBack?: boolean }
```

## 禁止事项
- ❌ 不处理"拖到某处后发生什么"的业务逻辑
- ❌ 不直接改全局状态

## 验收标准
1. 对象可被拖动跟随指针，松手停在目标位置
2. 设置 bounds 后拖不出边界
3. 三个事件按顺序正确发出
