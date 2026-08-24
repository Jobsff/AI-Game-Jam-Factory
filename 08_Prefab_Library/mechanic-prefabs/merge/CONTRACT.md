# Merge 预制件契约

## 职责
实现"两个物体合并成一个新物体"的合成机制：接收合成请求，判断能否合并，产出结果。

## 输入
- 两个待合并对象（或对象 ID）
- 可选的合并规则表（哪些能合成、合成结果是什么）

## 输出事件（通过 EventBus）
- `MERGE_SUCCESS`：合并成功（携带新对象）
- `MERGE_FAIL`：合并失败（携带原因）

## 接口
```js
new Merger(scene, config)
// config: { rules: Map<key, resultKey> }
merger.merge(itemA, itemB)
```

## 禁止事项
- ❌ 不直接操作 UI
- ❌ 不修改游戏全局状态（只发事件）
- ❌ 不创建 Scene

## 验收标准
1. 两个符合规则的对象合并后触发 MERGE_SUCCESS，产出新对象
2. 不符合规则时触发 MERGE_FAIL
3. 合并规则可配置，不写死在代码里
