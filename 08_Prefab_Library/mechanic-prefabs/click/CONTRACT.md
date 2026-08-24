# Click 预制件契约

## 职责
为游戏对象提供"点击目标"交互：对象可被点击，点击后触发事件。

## 输入
- 一个 Phaser 游戏对象（Sprite/Image/Shape/Container）
- 可选配置：点击冷却时间、点击反馈动画

## 输出事件（通过 EventBus）
- `OBJECT_CLICKED`：携带被点击对象的引用

## 接口
```js
new Clickable(scene, gameObject, config)
// config: { cooldown?: number, onClick?: function }
```

## 禁止事项
- ❌ 不直接修改游戏状态（只发事件）
- ❌ 不处理业务逻辑（点击后干什么由监听方决定）
- ❌ 不依赖具体游戏对象类型

## 验收标准
1. 给任意对象挂上后，点击能触发 `OBJECT_CLICKED` 事件
2. 设置 cooldown 后，冷却期内重复点击不触发
3. 不引入外部依赖，单个文件可独立运行
