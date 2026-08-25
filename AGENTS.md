# Codex 现场执行协议

## 开工顺序（不得跳过）

- [ ] 先读当前工程的 `GDD.md`、`TDD.md`、`GAME_MAP.md`；缺失就先报告并用模板补齐。
- [ ] 先列出本次改动文件及理由；一次最多 3 个文件。
- [ ] 先指出所在层：体验地图（Scene/UI）／运行地图（状态/事件）／实现地图（模块/资产）。
- [ ] 先读目标模块的 `MODULE_CONTRACT.md`，确认输入、输出、事件、所有权与清理责任。

## 修改边界

- [ ] 人类锁死核心循环、输入、状态与事件；Codex 只实现被点名的单模块。
- [ ] 禁止跨模块隐式修改；发现契约冲突时停止编码并列出冲突，由人类决定。
- [ ] 禁止顺手重构、替换玩法、添加未请求系统或更改公共事件名。
- [ ] 集成前先更新 `GAME_MAP.md`，再改代码；跨模块工作拆成多轮，每轮仍不超过 3 文件。

## Debug 协议

- [ ] 用最小步骤复现并记录 expected / actual、环境、console 与首个异常。
- [ ] 先定位 root cause，再提出单一最小修复；同一错误连续两次后检索 3–5 个可能解法并选择最小者。
- [ ] 修复后运行相关单测/复现步骤，再运行项目测试；记录命令、exit status 和实际结果。
- [ ] 检查重复事件、未清理 listener/timer/tween、Scene restart 后的残留。

## 完成输出

- [ ] 列出实际改动文件（≤3）、契约变化、测试命令与结果。
- [ ] 未验证事实标记“待核验”；不得把未运行的检查写成通过。
- [ ] 不 commit、不 push；把下一模块留给下一轮。

模板入口：[`GAME_MAP_TEMPLATE.md`](00_Command_Center/templates/GAME_MAP_TEMPLATE.md) · [`MODULE_CONTRACT_TEMPLATE.md`](00_Command_Center/templates/MODULE_CONTRACT_TEMPLATE.md) · [`DEBUG_REPORT_TEMPLATE.md`](00_Command_Center/templates/DEBUG_REPORT_TEMPLATE.md)
