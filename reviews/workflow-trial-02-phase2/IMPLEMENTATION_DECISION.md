# 主智能体裁决 — Trial 02 Phase 2（工程生成器事务安全）

依据：主管 Trial 02 指令 + 三问卡片 #1 确认 + KK3 初审（G1–G12）。
时间：2026-08-26 01:5x（KK3 初审完成后）。

## 唯一目标（本轮只做这一件事群）

让 `scripts/create-game.mjs` 满足两条硬性质，并让 `scripts/serve.mjs` 的启动边界诚实：

1. **事务性**：要么完整生成，要么干净回滚零残留 —— 覆盖 KK3 G1（信号中断残留）、G2（陈旧 staging 清扫）、G3（新建祖先链回滚）、G4（并发/TOCTOU 误删，含 G9 可读错误）。
2. **破坏性输入拒绝不破防**：覆盖 G8（symlink 祖先绕过工厂根防线）。症状 B 其余子项（非空覆盖、非法 slug/name）经 KK3 实测防线有效，本轮保持现状不重写。
3. **serve 启动诚实**：G5（不存在 root 不得先报成功再崩）、G6（横幅端口用实际绑定值）。

`scripts/validate-game.mjs` 本轮**不改**：KK3 判定其行为与意图一致（G11 仅低危观察项）。

## 欠账并入裁决（主管授权主智能体定）

- **U-03 并入**（批次 3）：README.md 补 CI 三 job 拓扑 + Node 20/22/24 表述，单文件小改，收掉一笔欠账。
- **U-06 不并入**：CR 字节门禁属 `scripts/validate.mjs`（工厂自检模块），与本轮目标（生成器事务安全）不同模块；并入会把本轮 diff 从 5 文件膨胀到 7 文件、稀释审查焦点。留在台账，指给 Trial 02 收尾后的维护线批次。

## 延期（记入观察项，不在本轮修）

- G7（参数解析器收紧）、G10（终端控制字符）、G11（validate-game 递归无界）、G12（replaceTitle 正则假设）：全部 P3，无破坏性后果。
- KK3 报告的 `scripts/` 缺 `MODULE_CONTRACT.md`：与 U-02（缺 GDD/TDD/GAME_MAP）同类，属人类文档治理决策，本轮仅记录（沿 KK3 结论留人类）。

## G53 允许修改文件（三批，各 ≤3，累计 5 文件）

| 批次 | 文件 | 覆盖缺口 |
|---|---|---|
| 1 | `scripts/create-game.mjs`、`tests/create-game.test.js` | G4+G9、G1、G2、G3、G8 |
| 2 | `scripts/serve.mjs`、`tests/serve.test.js` | G5、G6 |
| 3 | `README.md` | U-03（仅 CI 拓扑段落，不碰其他段落） |

## 禁止修改

`scripts/validate-game.mjs`、`scripts/validate.mjs`、`scripts/smoke.mjs`、`scripts/browser-smoke.mjs`、`scripts/cache-phaser.mjs`、五个玩法模板、`02_Game_Core/`、`08_Prefab_Library/`、`vendor/`、`package.json`、`.github/`、`tests/` 其余文件、`reviews/workflow-trial/`、`reviews/workflow-trial-02/`（前两轮证据链只读）。

## 保持不变（接口冻结）

- CLI 四 flag 名称与语义（`--template/--name/--slug/--output`，README.md:32-36 已文档化）；绝对路径/仓库外 output 是设计内行为，不得收紧为"必须相对路径"。
- `TEMPLATES` 白名单；slug 正则；name/slug 现有校验消息语义；非空目录拒绝行为。
- staging 命名形态 `.{basename}.factory-{uuid}`（清扫器依赖，如需变动须同步清扫器并保持向后识别）。
- 生成产物文件清单与 `factory.config.json`/`package.json` 内容 schema；生成成功输出行 `created ...` 格式。
- `serve.mjs` 导出 `createStaticServer({root,host,port})` 签名；MIME 表；安全响应头；symlink 逃逸 403 行为（现有测试 tests/serve.test.js:47 必须保持绿）。
- 零 npm 依赖；Node ≥20.11 可运行（不得用更新 Node 独有 API）。

## 验收标准（每条都要有命令 + exit code 证据）

批次 1（create-game，全部先红后绿）：
1. **G4 并发**：预置空 destination，双进程错峰并发 → 恰好一方 exit 0 且产物完整，另一方非零退出 + **单行可读错误**（不得是裸 ENOTEMPTY 栈）；输家 staging 清理干净。
2. **G4 TOCTOU 变体**：单跑期间向空 destination 注入文件 → 运行失败、注入文件原样保留。
3. **G1 中断**：CLI 子进程生成中 SIGINT → 退出码 130（SIGTERM 对应 143，若一并实现）、目录树无 `.factory-*` 残留、destination 不存在或原样。
4. **G2 清扫**：预置带 sentinel 的假陈旧 staging → 下次成功运行后被清扫；同形态但无 sentinel 的用户目录原样保留（防误删是硬约束）。
5. **G3 祖先链**：强制自验证失败（NODE_OPTIONS 注入法可行）→ staging 与本次新建的祖先链全消失，既有祖先目录保留。
6. **G8 symlink**：symlink 祖先实际解析进工厂根的 output → 拒绝。**红阶段不得向仓库写入任何文件**：允许为可测性新增纯函数导出（如防线判定函数），但 `createGame` 对外签名与 CLI 行为不变。
7. 既有 4 测保持绿；`npm test` 全绿；`npm run verify` exit 0。

批次 2（serve，先红后绿）：
8. **G5**：不存在 root 的 CLI → 无成功横幅、单行错误、exit 1、无 unhandledRejection；程序化路径 `createStaticServer({...不存在的 root}).listen()` 以 rejected promise 干净失败（不崩进程）。
9. **G6**：`PORT=0` → 横幅打印实际绑定端口。
10. 既有 2 测（含 symlink 逃逸 403）保持绿。

批次 3（README）：
11. CI 段落列出 matrix + browser-smoke + quality-gates-complete 三 job 拓扑，Node 门槛表述为 20/22/24；不改其他段落。

## 测试矩阵（对应 KK3 验收建议 1–10 的采用/调整）

采用 KK3 用例 1、2、3、4、5、6、7(PORT=0 部分)、9、10；用例 8（G7 参数收紧）延期；新增 serve 程序化 listen() reject 用例（G5 程序化路径）。并发类用例须在测试内用轮询/文件信号稳定同步，不得靠固定 sleep 赌时序。

## 其他给 G53 的硬约束

- 每批 ≤3 文件，批次 1/2 内先写红测试并运行确认 fail，再改实现转绿（TDD，证据留 log）。
- 修复必须最小：不顺手重构、不改无关行为、不加未请求特性（AGENTS.md）。
- 不得 commit/push（主智能体统一走草稿分支）。
- 所有实验/测试产物放 /tmp 或系统临时目录，仓库内不得出现生成物或 staging 残留（`git status --porcelain` 除白名单文件与 reviews/workflow-trial-02-phase2/ 外必须为空）。
