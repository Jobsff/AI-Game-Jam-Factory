# MODULE_CONTRACT｜{{MODULE_NAME}}

- 目的：{{PURPOSE}}
- 所有者：{{OWNER}}
- 文件范围（本轮 ≤3）：{{FILES}}
- 非目标：{{NON_GOALS}}

## 输入／输出

| 类型 | 名称 | schema/范围 | 提供者/消费者 |
|---|---|---|---|
| 输入 | {{INPUT}} | {{INPUT_SCHEMA}} | {{INPUT_OWNER}} |
| 输出 | {{OUTPUT}} | {{OUTPUT_SCHEMA}} | {{OUTPUT_CONSUMER}} |

## 状态与事件

| 事件 | payload | 发出者 | 订阅者 | 解绑时机 |
|---|---|---|---|---|
| {{EVENT}} | {{PAYLOAD}} | {{EMITTER}} | {{SUBSCRIBER}} | {{CLEANUP}} |

## 验收清单

- [ ] 正常路径：{{HAPPY_PATH}}。
- [ ] 边界路径：{{EDGE_CASE}}。
- [ ] Scene restart 后无重复事件或残留 listener/timer/tween。
- [ ] 测试命令 `{{TEST_COMMAND}}` 的预期结果为 `{{EXPECTED_RESULT}}`。
