# A02｜角色资产

- 使用时机：Style Bible 冻结后
- 目标输出：角色生成 prompt 与验收表

## 变量区（复制后填写）

```yaml
PROMPT_ID: A02
THEME: "{{THEME}}"
GAME_NAME: "{{GAME_NAME}}"
INPUTS: "{{角色功能}}｜{{轮廓}}｜{{动作}}｜{{尺寸}}｜{{透明背景要求}}"
CONTEXT: "{{CONTEXT}}"
TIME_LIMIT: "{{TIME_LIMIT}}"
EVIDENCE_PATHS: "{{EVIDENCE_PATHS}}"
```

## 不可违反约束

- 遵循 Style Bible。
- 不模仿 IP。
- 不添加文字/水印。
- 只依据变量区与明确证据；事实不确定处写“待核验”，并给核验动作。
- 不复制第三方代码、文案或素材。

## 可直接使用的 Prompt

```text
你负责「角色资产」。读取变量区全部字段，以 角色生成 prompt 与验收表 为目标。
先复述边界与缺失输入，再完成任务；缺失信息不得静默猜测。
必须遵守：遵循 Style Bible；不模仿 IP；不添加文字/水印。
固定输出格式：输出正视描述、轮廓锚点、色值、动作清单、negative constraints、导出规格。
最后追加【自检清单】，逐项使用 - [ ] / - [x]，并标出所有“待核验”。
```

## 固定输出格式

输出正视描述、轮廓锚点、色值、动作清单、negative constraints、导出规格。不得追加与本任务无关的扩展方案。
