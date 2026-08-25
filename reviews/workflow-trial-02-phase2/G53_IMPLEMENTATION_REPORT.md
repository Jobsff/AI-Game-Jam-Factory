# G53 实现报告 — Trial 02 Phase 2（工程生成器事务安全）

> 主智能体按原文收录（G53 agentId agent_2ce3dc79，toolUses 62，约 22 分钟）。
> 任务包指纹 8cce0226b32d816439b4e2a10c4e57c66cb37d59b51d621a1a4933b7335a0e89（/tmp/agjf-trial02p2-evidence/g53-task.md）。
> 红绿与门槛日志：/tmp/agjf-trial02p2-evidence/g53-*.log；修改前副本：/tmp/agjf-trial02p2-evidence/pre-modify/。
> 主智能体独立复核：npm test 42/42 pass、git status 仅白名单 5 文件 + reviews/、仓库无 *.factory-* 残留（2026-08-26 02:3x）。

## 【任务理解】

修复 `scripts/create-game.mjs` 事务性缺口（G4+G9 并发误删/裸错误、G1 信号中断残留、G2 陈旧 staging 清扫、G3 祖先链回滚、G8 symlink 绕过工厂根防线）与 `scripts/serve.mjs` 启动诚实缺口（G5 不存在 root 先报成功后崩、G6 横幅假端口），加 README U-03。三批次白名单累计 5 文件，每批先红后绿，不 commit/push。

## 【已读取的项目约束】

任务包 + IMPLEMENTATION_DECISION.md + KK3_INITIAL_REVIEW.md + AGENTS.md + 全部目标/关联脚本（validate-game/smoke/browser-smoke/validate-cli 测试先例 + validate.yml）。**AGENTS.md 开工项偏离报告**：GDD.md / TDD.md / GAME_MAP.md / scripts/MODULE_CONTRACT.md 缺失，按裁决文档属人类文档治理决策（U-02 同类），本轮仅记录不补建（白名单硬约束）。

## 【本轮修改范围】（git status 核对，与计划完全一致）

| 文件 | 修改内容 |
|---|---|
| `scripts/create-game.mjs` | G4+G9：`rm(recursive,force)` 改 `rmdir`（仅空目录可替换）+ rmdir/rename 失败包装单行中文错误"目标目录在生成期间被占用或已非空，已保留其内容：{path}"；G1：CLI 入口注册 SIGINT/SIGTERM 处理器（rmSync 同步清 staging 后 130/143 退出，仅 CLI 路径安装）；G2：`sweepStaleStaging`（严格 uuid 正则 + sentinel `.factory-staging.json` 首写于大拷贝前 + PID 探活 EPERM=存活，缺/坏 sentinel 一律不删）；G3：mkdir 前记录最近已存在祖先，失败时 rmdir 自 destination 向上回删新建空链；G8：新增导出 `assertOutputOutsideFactory`（词法防线保留 + 最近已存在祖先 realpath 对比 realpath(factoryRoot)） |
| `tests/create-game.test.js` | 新增 T1–T6（并发不变式轮询同步、TOCTOU 注入、SIGINT=130 win32 skip、清扫三态防误删、祖先链回滚、symlink 防线纯函数缝隙+集成断言），既有 2 用例原样 |
| `scripts/serve.mjs` | G5：`listen()` 改 async，绑定端口前 await realpath(root)，失败以 rejected promise 干净拒绝；`canonicalBase` 惰性化消除 unhandledRejection；G6：横幅端口改用 `server.address().port` |
| `tests/serve.test.js` | 新增 T8–T10（CLI 缺失 root、编程 rejected、PORT=0 实际端口+连通性验证），既有 2 用例原样 |
| `README.md` | U-03 两处：第 3 行 Node 20/22/24 矩阵表述；验证命令节尾补 CI 三 job 拓扑一句 |

## 【保持不变的接口与行为】

createGame 签名/返回值、CLI 四 flag、staging 命名形态、产物文件清单（sentinel 在 rename 前移除，已验证产物零 sentinel）、`created ...` 输出行、拒绝覆盖非空目录行为与消息、serve 导出签名/MIME/405/403、编程 listen() 对合法 root 语义（smoke/browser-smoke 仅用编程接口，未受影响）。

## 【契约冲突】

无。

## 【实现结果】

五个缺口全部修复且先红后绿。G2 硬约束逐条满足：sentinel 在 `mkdir(staging)` 后、`Promise.all` 大拷贝前首写；清扫仅删"严格正则 + 有效 sentinel + PID 死亡或本进程"三条件同时成立的目录（lstat 排除非目录）。G8 红阶段通过动态 import 纯函数缝隙实现零仓库写入。

## 【测试证据】

| 命令 | 退出码 | 关键输出 |
|---|---|---|
| `node --test tests/create-game.test.js`（红） | 1 | pass 2 / fail 6；T1 失败详情=双方均 exit 0 且打印 created（G4 误删复现）；T2 status 0（注入文件被删）；T3 `status=null signal=SIGINT`；T4 陈旧未清；T5 祖先链残留；T6 导出缺失 |
| `node --test tests/create-game.test.js`（绿） | 0 | pass 8 / fail 0 |
| `node --test --test-name-pattern="concurrent|SIGINT|TOCTOU"` ×2 复跑 | 0 | pass 3 / fail 0 ×2（时序稳定性） |
| `node --test tests/serve.test.js`（红） | 1 | pass 2 / fail 3；T10 失败消息字面=`Factory server: http://127.0.0.1:0/`（G6 证据） |
| `node --test tests/serve.test.js`（绿） | 0 | pass 5 / fail 0 |
| `npm test` | 0 | 42 pass / 0 fail / 0 skipped |
| `npm run verify` | 0 | smoke ok: 25 resources；browser smoke ok: 5 templates + decision tool |
| `git status --porcelain` | 0 | 仅白名单 5 文件 M + 未跟踪 reviews/workflow-trial-02-phase2/ |
| `find . -name "*.factory-*"` | 0 | 0 条（仓库无残留） |
| `git diff --check` | 0 | 无 whitespace error |
| SIGTERM 手动探针 | — | code=143、residue=[]、destination 未创建（39ms 中断） |
| 产物契约抽查 | 0 | 生成工程内 `.factory-staging.json` 计数 0 |

日志：`/tmp/agjf-trial02p2-evidence/{g53-batch1-red,g53-batch1-green,g53-batch2-red,g53-batch2-green,g53-npm-test,g53-verify,g53-git-status,g53-factory-residue}.log`。

## 【偏离项】

1. 红阶段两处测试自身 bug 被修正后重跑红：① T1/T3 轮询谓词 `stagingCount(...)>=1`（Promise 与数字比较恒 false，60s 空转且未触发真实断言）；② T8/T9 `rm(temporary)` 缺 `{recursive:true}` 抛 EISDIR。修正后红失败均为目标缺口的真实断言。2. T1 输家消息断言放宽为 `拒绝覆盖非空目录|已保留其内容` 双匹配（任务包明示两种交错均合法）。3. 任务包称矩阵 job 为 "validate"，实际 workflow job id 是 `quality-gates`（workflow 名为 validate），README 按真实 id 表述。

## 【未完成或未验证事项】

- Windows/Linux 平台未实测（本机 darwin/arm64 + Node 24.19.0）；SIGINT/SIGTERM/T2/T5 依赖 POSIX 语义，win32 显式 skip 的仅 T3，T2/T5 的 `--require` 钩子用 `path.join` 分隔符兼容写法，待 CI 三平台跑过方可视为验证（待核验）。
- rmdir 与 rename 之间毫秒级窗口内注入文件的极限交错（MM3 攻击面，不变式由 rename ENOTEMPTY 兜底但未专项测试）。
- SIGKILL 半拷贝后 sentinel 已在 rename 前被移除的极小窗口（验证通过后、rename 前）会漏清——按"宁可漏清不可误删"接受。
- PID 复用极端情况（测试窗口内不可能，长周期理论存在）。

## 【剩余风险】

G6 修复后 `HOST=0.0.0.0` 时横幅 host 仍显示配置值（`http://0.0.0.0:port/`，可访问）；G7 参数解析、G10 控制字符、G11 validate-game 递归无界、G12 replaceTitle 假设均按裁决延期未动。

## 【交接给 MM3】

最值得攻击：① rmdir/rename 间窗口与三进程交错（rmdir ENOENT 分支的消息措辞"已保留其内容"在 ENOENT 时是否准确）；② 清扫器对"同形态名 + 伪造 sentinel 指向活进程/死进程"的边界；③ SIGINT 在 spawnSync 自验证期间到达（handler 延迟到 spawnSync 返回后执行，exit 仍 130 但有延迟）；④ serve 惰性 canonicalBase 缓存 rejected promise 后续请求 500 的行为；⑤ Windows 上 rename/rmdir 语义差异。

## 【运行元数据】

- 实际修改文件：5（= 白名单，git status 核对，无越界）
- untracked 修改前快照：`/tmp/agjf-trial02p2-evidence/pre-modify/`（5 文件全量副本）
- 修改文件数 5 / 无关改动数 0；红绿批次命令 6 组 + 全门槛 4 组 + 探针 4 组；全程约 25 分钟
- 未执行任何 git 写操作（无 commit/push/branch）

---

# 附：阶段 5 返修记录（F1，G53 第二次调用 agent_8391ddf6）

> toolUses 18，约 2.5 分钟。裁判亲验：`PORT=abc node scripts/serve.mjs /tmp` → exit 1、stderr 单行 `port must be an integer between 0 and 65535`、无栈无路径（2026-08-26 03:2x）。

- 依据：MM3 红队 F1（稳定 P2）——`createStaticServer` 构造期同步抛 RangeError，CLI 的 `listen().catch()` 捕获不到，多行栈泄漏。
- 修改：`scripts/serve.mjs`（CLI 入口单 hunk：try/catch 包裹构造，失败单行 `console.error(error.message)` + exitCode 1；后续 `service?.listen()`）+ `tests/serve.test.js`（+1 测试：PORT=abc spawn → exit 1 / stderr 单行 / 无 at 帧 / 含 port 消息 / 无成功横幅）。
- 接口冻结保持：`createStaticServer` 导出签名与构造期校验语义不变（编程式调用者仍同步 throw）。
- 证据：红 `g53-rework-red.log`（12 行栈被测试捕获）→ 绿 `g53-rework-green.log`（6/6）→ `npm test` 43/43（`g53-rework-npm-test.log`）→ `git status` 与预期一致（`g53-rework-git-status.log`；外部会话文档改动未触碰，两文件 mtime 仅反映本轮写入 03:20:18/03:20:41）。
- 待核验：`npm run verify` 全链本轮未重跑（改动仅 CLI 错误路径；由 MM3 回归与 CI 补）；Windows spawn 行为待 CI。
