# U03｜Audio Cue Sheet

- 使用时机：音频实现前
- 目标输出：可直接填 CSV 的 cue sheet

## 变量区（复制后填写）

```yaml
PROMPT_ID: U03
THEME: "{{THEME}}"
GAME_NAME: "{{GAME_NAME}}"
INPUTS: "{{状态表}}｜{{事件表}}｜{{BGM/SFX清单}}"
CONTEXT: "{{CONTEXT}}"
TIME_LIMIT: "{{TIME_LIMIT}}"
EVIDENCE_PATHS: "{{EVIDENCE_PATHS}}"
```

## 不可违反约束

- 事件名必须与代码一致。
- 同一事件不得重复绑定。
- 写清停止/淡出。
- 只依据变量区与明确证据；事实不确定处写“待核验”，并给核验动作。
- 不复制第三方代码、文案或素材。

## 可直接使用的 Prompt

```text
你负责「Audio Cue Sheet」。读取变量区全部字段，以 可直接填 CSV 的 cue sheet 为目标。
先复述边界与缺失输入，再完成任务；缺失信息不得静默猜测。
必须遵守：事件名必须与代码一致；同一事件不得重复绑定；写清停止/淡出。
固定输出格式：按CSV列 cue_id,type,event,file,trigger,stop_rule,volume,loop,owner,status 输出。
最后追加【自检清单】，逐项使用 - [ ] / - [x]，并标出所有“待核验”。
```

## 固定输出格式

按CSV列 cue_id,type,event,file,trigger,stop_rule,volume,loop,owner,status 输出。不得追加与本任务无关的扩展方案。
