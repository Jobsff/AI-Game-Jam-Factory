# GAME_MAP｜{{GAME_NAME}}

> 版本：{{VERSION}}｜冻结时间：{{FREEZE_TIME}}｜负责人：{{OWNER}}

## 体验地图

| Scene/UI | 玩家看到什么 | 输入 | 完成条件 |
|---|---|---|---|
| {{SCENE}} | {{VISIBLE_RESULT}} | {{INPUT}} | {{DONE}} |

## 运行地图

| 状态 | 允许进入自 | 允许前往 | 触发事件 | 清理责任 |
|---|---|---|---|---|
| {{STATE}} | {{FROM}} | {{TO}} | {{EVENT}} | {{CLEANUP_OWNER}} |

## 实现地图

| 模块/Prefab | 文件 | 契约 | 依赖 | 所有者 |
|---|---|---|---|---|
| {{MODULE}} | {{FILE}} | {{CONTRACT_PATH}} | {{DEPENDENCY}} | {{OWNER}} |

## 冻结清单

- [ ] 核心循环已由人类确认。
- [ ] 输入、状态、事件名称与 payload 已锁定。
- [ ] 每个 listener/timer/tween 都有清理所有者。
- [ ] 未验证事项已标“待核验”。
