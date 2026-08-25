# MM3 红队报告 — validate.mjs 修复对抗检测

- 审查角色：MM3（对抗 QA，第一轮只测试不修改生产代码）
- 日期：2026-08-25
- 环境：macOS 25.5.0 arm64 / Node v24.19.0 / npm 11.17.0 / HEAD b639cf7
- 结论：**Go**——修复有效，未发现 P0/P1/P2 阻断问题；3 条 P3 观察

## 实际执行命令与退出码

| 命令 | cwd | 退出码 | 关键输出 |
|---|---|---|---|
| `node scripts/validate.mjs` | 仓库根 | 0 | `validate ok: 11 prefabs, 5 templates, 72 scripts` |
| `npm run validate` | 仓库根 | 0 | 同上 |
| `node <abs>/scripts/validate.mjs` | /tmp 空目录 | 0 | 同上（root 由脚本位置解析，不读 cwd） |
| 同上 | 带空格目录 `/tmp/factory mm3 space test RO7` | 0 | 同上 |
| 同上 | Unicode 目录 `/tmp/工厂-测试-🎯TBo` | 0 | 同上 |
| `node /tmp/x/validate.mjs`（symlink 指向真实脚本） | /tmp | 0 | 同上 |
| `node --preserve-symlinks ...`（同 symlink） | /tmp | 0 | 同上（仍解析到真实仓库） |
| 真实脚本绝对路径 | 完整诱饵仓库（含伪造 04_Prompt_Library 等） | 0 | 同上——不读诱饵内容 |
| `env -u PWD node ...` / `PWD=/nonexistent node ...` | 诱饵 cwd | 0 | 同上——不受 PWD 干扰 |
| `node ./scripts/validate.mjs`（仅复制 validate.mjs 的孤立副本仓） | 诱饵副本仓 | 1 | stderr 报告 11 个 prefab 全部 missing（预期：脚本锚定自身位置） |
| `npm test` | 仓库根 | 0 | tests 22 / pass 22 / fail 0（9.05s） |
| `npm run verify` | 仓库根 | 0 | test+validate+smoke+browser-smoke 全绿（18s） |
| `git diff --check` | 仓库根 | 0 | 无 whitespace 报告 |

附带检查：失败/成功运行前后 `ls` 对比，调用者目录与仓库内均无新文件（无误写）；成功路径 stdout/stderr 干净，不含绝对路径；无新依赖、无网络、无 os.homedir/process.env 读取；vendor/phaser.min.js SHA-256 校验未触碰；node_modules 不存在，离线约束未破坏。

## 发现汇总

| ID | 严重度 | 状态 | 是否阻断 |
|---|---|---|---|
| MM3-001 | P3 | 观察 | 否 |
| MM3-002 | P3 | 观察（流程提醒） | 否 |
| MM3-003 | P3 | 观察（不可消除） | 否 |

无 P0/P1/P2。按本轮规则（P0/P1/稳定 P2 才返修）→ **无需返修循环**。

## 发现详情

### MM3-001（P3）新测试的回归敏感性不对称
- 复现（/tmp/factory-oldval3-XXXX 验证）：将 validate.mjs 换回 `process.cwd()` 旧版后跑 3 用例 → `pass 2 / fail 1`——只有 T2（外部 mkdtemp 目录）会红；T1（仓库根）/T3（仓库子目录）在旧版 cwd 逻辑下也会通过。
- 影响：T1/T3 是 happy-path 覆盖，真正的回归防线是 T2。不影响修复正确性。
- 建议（下轮可选）：T1/T3 增加 `stderr 不含 ENOENT` 断言或引入元测试。

### MM3-002（P3，信息）修复产物未 commit
- `git status --short` 显示 package.json / scripts/ / tests/ 均 untracked（本仓库脚本体系整体未提交，非本轮引入）。
- 影响：发布前必须 commit，否则 CI checkout 到 HEAD 会缺 scripts/。本轮协议明确禁止 commit，属人类/后续流程责任。

### MM3-003（P3）失败路径绝对路径泄漏
- 场景：孤立副本仓运行 → Node `import()` 的 ERR_MODULE_NOT_FOUND 自带绝对路径。成功路径 stderr 干净。Node 自身行为，非 validate.mjs 问题，不可消除，无 PII。

## 未覆盖范围

- Linux / Windows 平台（仅 darwin 实测；`import.meta.dirname` 跨平台语义一致，理论无差异）
- Node 20/22（仅 Node 24 实测；仓库要求 ≥20，import.meta.dirname 需 ≥20.11，与既有脚本风险一致）
- GitHub Actions 真实运行（本机 verify 全绿；CI 是否预置 Chrome 影响 browser-smoke，与本修复无关）
