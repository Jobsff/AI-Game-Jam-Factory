# C05｜Debug 根因修复

- 使用时机：出现可复现缺陷
- 目标输出：root cause、最小修复、回归证据

## 变量区（复制后填写）

```yaml
PROMPT_ID: C05
THEME: "{{THEME}}"
GAME_NAME: "{{GAME_NAME}}"
INPUTS: "{{复现步骤}}｜{{expected/actual}}｜{{console}}｜{{相关 diff}}"
CONTEXT: "{{CONTEXT}}"
TIME_LIMIT: "{{TIME_LIMIT}}"
EVIDENCE_PATHS: "{{EVIDENCE_PATHS}}"
```

## 不可违反约束

- 先复现再修。
- 同错两次后研究3–5解法。
- 不顺手重构。
- 只依据变量区与明确证据；事实不确定处写“待核验”，并给核验动作。
- 不复制第三方代码、文案或素材。

## 可直接使用的 Prompt

```text
你负责「Debug 根因修复」。读取变量区全部字段，以 root cause、最小修复、回归证据 为目标。
先复述边界与缺失输入，再完成任务；缺失信息不得静默猜测。
必须遵守：先复现再修；同错两次后研究3–5解法；不顺手重构。
固定输出格式：严格按 DEBUG_REPORT_TEMPLATE；列首个异常、排除项、测试命令/exit/result。
最后追加【自检清单】，逐项使用 - [ ] / - [x]，并标出所有“待核验”。
```

## 固定输出格式

严格按 DEBUG_REPORT_TEMPLATE；列首个异常、排除项、测试命令/exit/result。不得追加与本任务无关的扩展方案。
