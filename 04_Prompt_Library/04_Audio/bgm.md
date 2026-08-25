# U01｜BGM

- 使用时机：核心循环可玩后
- 目标输出：可生成/委托的音乐 brief

## 变量区（复制后填写）

```yaml
PROMPT_ID: U01
THEME: "{{THEME}}"
GAME_NAME: "{{GAME_NAME}}"
INPUTS: "{{情绪曲线}}｜{{循环时长}}｜{{场景状态}}｜{{目标响度}}"
CONTEXT: "{{CONTEXT}}"
TIME_LIMIT: "{{TIME_LIMIT}}"
EVIDENCE_PATHS: "{{EVIDENCE_PATHS}}"
```

## 不可违反约束

- 不模仿具体曲目/艺人。
- 避免掩盖关键 SFX。
- license 待核验需标注。
- 只依据变量区与明确证据；事实不确定处写“待核验”，并给核验动作。
- 不复制第三方代码、文案或素材。

## 可直接使用的 Prompt

```text
你负责「BGM」。读取变量区全部字段，以 可生成/委托的音乐 brief 为目标。
先复述边界与缺失输入，再完成任务；缺失信息不得静默猜测。
必须遵守：不模仿具体曲目/艺人；避免掩盖关键 SFX；license 待核验需标注。
固定输出格式：输出 BPM/调式/结构/乐器/无缝循环点/negative constraints/验收。
最后追加【自检清单】，逐项使用 - [ ] / - [x]，并标出所有“待核验”。
```

## 固定输出格式

输出 BPM/调式/结构/乐器/无缝循环点/negative constraints/验收。不得追加与本任务无关的扩展方案。
