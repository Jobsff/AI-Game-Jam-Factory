# DEBUG_REPORT｜{{BUG_ID}}

- 环境：{{ENVIRONMENT}}
- 首次发现：{{TIME}}
- 影响模块：{{MODULE}}
- 改动文件（≤3）：{{FILES}}

## 复现

1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

- Expected：{{EXPECTED}}
- Actual：{{ACTUAL}}
- 首个异常/console：{{FIRST_ERROR}}

## Root cause 与修复

- Root cause：{{ROOT_CAUSE}}
- 证据：{{EVIDENCE}}
- 最小修复：{{MINIMAL_FIX}}
- 排除方案：{{REJECTED_OPTION_AND_REASON}}

## 验证清单

- [ ] 原复现步骤现在得到 `{{RESTORED_RESULT}}`。
- [ ] 相关测试：`{{TARGET_TEST_COMMAND}}` → `{{TARGET_TEST_RESULT}}`。
- [ ] 完整测试：`{{FULL_TEST_COMMAND}}` → `{{FULL_TEST_RESULT}}`。
- [ ] restart 后无重复事件、未清理 listener/timer/tween。
