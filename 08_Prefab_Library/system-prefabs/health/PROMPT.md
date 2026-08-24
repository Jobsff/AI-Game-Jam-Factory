# Health 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 HealthSystem 预制件，职责是：管理生命值（扣血/回血/清零/读取），变化时通过 EventBus 发事件。

3. Files Allowed（允许修改的文件）
只允许创建：
- HealthSystem.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new HealthSystem(scene, config)
// config 可选字段：{ max: 100, initial: 100 }
health.damage(n) / health.heal(n) / health.reset() / health.get()
```

5. Events（事件）
- HEALTH_CHANGED：血量变化，携带当前/最大
- HEALTH_ZERO：血量归零

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不负责显示血条（显示由 UI 层监听事件做）
- 不决定"死亡后发生什么"（只发事件）
- 代码注释用中文，命名用英文

7. Acceptance Test（验收标准）
- damage/heal 正确更新血量并触发 HEALTH_CHANGED
- 血量到 0 触发 HEALTH_ZERO
- 血量不会超过 max、不会低于 0
