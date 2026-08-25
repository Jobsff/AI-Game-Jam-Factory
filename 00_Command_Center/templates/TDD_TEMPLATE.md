# TDD｜{{GAME_NAME}}

> 版本：{{VERSION}}｜冻结时间：{{FREEZE_TIME}}｜技术负责人：{{OWNER}}

## 技术边界

- 引擎：Phaser 3（本地 vendor 优先，固定 CDN 仅作回退）
- 语言：原生 JavaScript ES Module
- 构建：无构建工具
- 目标：H5 / 桌面与移动浏览器
- 基准画布：720×1280，`FIT + CENTER_BOTH`

## Scene 与模块

| Scene／模块 | 单一职责 | 输入 | 输出／事件 | 清理责任 |
|---|---|---|---|---|
| {{SCENE_OR_MODULE}} | {{RESPONSIBILITY}} | {{INPUT}} | {{OUTPUT_EVENTS}} | {{CLEANUP_OWNER}} |

## 状态机

| 状态 | 进入条件 | 允许动作 | 离开条件 | 下一状态 |
|---|---|---|---|---|
| {{STATE}} | {{ENTER_CONDITION}} | {{ALLOWED_ACTIONS}} | {{EXIT_CONDITION}} | {{NEXT_STATE}} |

## 事件契约

| 事件 | payload schema | 发出者 | 订阅者 | 解绑时机 |
|---|---|---|---|---|
| {{EVENT}} | {{PAYLOAD_SCHEMA}} | {{EMITTER}} | {{SUBSCRIBERS}} | {{UNSUBSCRIBE_TIME}} |

## 数据与资产

- 配置真源：{{CONFIG_SOURCE}}
- 资产 manifest：{{ASSET_MANIFEST}}
- 音频 cue sheet：{{AUDIO_CUE_SHEET}}
- 第三方与许可证记录：{{THIRD_PARTY_RECORD}}

## 验证矩阵

| 门槛 | 命令／步骤 | 通过标准 |
|---|---|---|
| 单元测试 | `{{UNIT_TEST_COMMAND}}` | {{UNIT_PASS}} |
| 结构验证 | `{{VALIDATE_COMMAND}}` | {{VALIDATE_PASS}} |
| 浏览器验证 | `{{BROWSER_TEST}}` | {{BROWSER_PASS}} |
| 重启回归 | {{RESTART_TEST}} | 无重复 listener/timer/tween/input |
| 第二设备 | {{SECOND_DEVICE}} | 冷启动并完成完整闭环 |

## 冻结清单

- [ ] 核心循环、输入所有者、状态、事件名与 payload 已由人类锁定。
- [ ] 每个 listener/timer/tween/input 回调有明确销毁者。
- [ ] Codex 单轮最多修改 3 个文件，测试文件计入。
- [ ] 不使用隐式全局状态；调试钩子不承载游戏逻辑。
- [ ] 未验证技术假设标“待核验”并有最小验证动作。
