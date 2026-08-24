# 预制件 PROMPT.md 统一模板

> 每个预制件的 `PROMPT.md` 都按下面 7 个字段写，保证 Codex 生成质量稳定、可复用。
> 用前把【】替换成具体内容。

---

## 固定 7 字段

```
1. Context（背景）
   我们在构建一个 Phaser 3 H5 的 AI Game Jam 预制件库（Prefab Library）。
   技术约束：Phaser 3 + 原生 JavaScript + ES Module + CDN 加载，无构建工具。

2. Goal（目标）
   实现【预制件名】预制件，职责是【一句话职责】。

3. Files Allowed（允许修改的文件）
   只允许创建/修改：
   - 【预制件目录】/【预制件名】.js
   禁止修改任何其他文件。

4. Interface（接口）
   对外暴露的调用方式，例如：
   new 【Class】(scene, config)
   或导出纯函数 【func】(scene, ...)

5. Events（事件）
   通过 EventBus 发出的事件，例如：
   - 【EVENT_NAME】：触发时机

6. Constraints（约束，必须遵守）
   - 不引入任何外部依赖
   - 不修改 Scene / 全局状态（用 EventBus 通信）
   - 不用全局变量
   - 代码注释用中文，命名用英文
   - 单一职责，一个预制件只做一件事

7. Acceptance Test（验收标准）
   - 【可验证的验收点1】
   - 【可验证的验收点2】
```

---

## 使用方式（让 Codex 生成代码）

把某个预制件的 `PROMPT.md` 内容 + 这个模板，一起发给 Codex：

> "请按照下面的 PROMPT 生成代码，严格遵守 Files Allowed 和 Constraints。"

## 生成后验收（对照 CONTRACT.md）

1. 代码是否只改了允许的文件？
2. 是否符合 Constraints（无外部依赖、无全局变量、单一职责）？
3. 是否逐条满足 Acceptance Test？
4. 命名、注释是否规范（英文命名 + 中文注释）？
