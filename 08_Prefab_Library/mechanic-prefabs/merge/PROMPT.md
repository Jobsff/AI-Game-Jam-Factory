# Merge 预制件生成提示词

1. Context（背景）
我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
实现 Merger 预制件，职责是：实现两个物体合并成一个新物体的合成机制，通过 EventBus 发事件。

3. Files Allowed（允许修改的文件）
只允许创建：
- Merger.js
禁止修改任何其他文件。

4. Interface（接口）
```js
new Merger(scene, config)
// config 可选字段：{ rules: new Map() }  // key -> 合成结果标识
merger.merge(itemA, itemB)  // 返回布尔值表示是否尝试合并
```

5. Events（事件）
- MERGE_SUCCESS：合并成功，携带新对象
- MERGE_FAIL：合并失败，携带原因

6. Constraints（约束，必须遵守）
- 不引入任何外部依赖
- 不直接操作 UI、不修改游戏全局状态（只发事件）
- 不创建 Scene
- 代码注释用中文，命名用英文
- 合并规则必须可配置，不写死

7. Acceptance Test（验收标准）
- 两个符合规则的对象合并后触发 MERGE_SUCCESS，产出新对象
- 不符合规则时触发 MERGE_FAIL
- 合并规则可通过 config 配置
