# A04｜UI Kit

- 使用时机：HUD 信息冻结后
- 目标输出：组件清单与状态矩阵

## 变量区（复制后填写）

```yaml
PROMPT_ID: A04
THEME: "{{THEME}}"
GAME_NAME: "{{GAME_NAME}}"
INPUTS: "{{Style Bible}}｜{{HUD字段}}｜{{输入方式}}｜{{安全区}}"
CONTEXT: "{{CONTEXT}}"
TIME_LIMIT: "{{TIME_LIMIT}}"
EVIDENCE_PATHS: "{{EVIDENCE_PATHS}}"
```

## 不可违反约束

- 可读性优先。
- 不得烘焙动态文案。
- 触控区≥44 CSS px。
- 只依据变量区与明确证据；事实不确定处写“待核验”，并给核验动作。
- 不复制第三方代码、文案或素材。

## 可直接使用的 Prompt

```text
你负责「UI Kit」。读取变量区全部字段，以 组件清单与状态矩阵 为目标。
先复述边界与缺失输入，再完成任务；缺失信息不得静默猜测。
必须遵守：可读性优先；不得烘焙动态文案；触控区≥44 CSS px。
固定输出格式：输出 token、按钮 normal/hover/pressed/disabled、面板/HUD、九宫格与验收。
最后追加【自检清单】，逐项使用 - [ ] / - [x]，并标出所有“待核验”。
```

## 固定输出格式

输出 token、按钮 normal/hover/pressed/disabled、面板/HUD、九宫格与验收。不得追加与本任务无关的扩展方案。
