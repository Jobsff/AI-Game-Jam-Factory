# Health 预制件契约

## 职责
管理生命值：扣血/回血/清零/读取，扣到 0 发事件。

## 输入
- 最大生命值、初始生命值

## 输出事件（通过 EventBus）
- `HEALTH_CHANGED`：血量变化（携带当前/最大）
- `HEALTH_ZERO`：血量归零（死亡/失败）

## 接口
```js
new HealthSystem(scene, config)
// config: { max: 100, initial: 100 }
health.damage(n) / health.heal(n) / health.reset() / health.get()
```

## 禁止事项
- ❌ 不负责显示血条（显示由 UI 层监听事件做）
- ❌ 不决定"死亡后发生什么"（只发事件）

## 验收标准
1. damage/heal 正确更新血量并触发 HEALTH_CHANGED
2. 血量到 0 触发 HEALTH_ZERO
3. 血量不会超过 max，不会低于 0
