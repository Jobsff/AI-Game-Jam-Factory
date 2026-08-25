# MM3 红队报告 — 第一批整改对抗检测

- 审查角色：MM3；agentId agent_cdde4010；toolUses 114；耗时约 17 分钟
- 结论：**Go（条件式）**——16 项攻击（10 指定 + 6 自主发现）内修复契约全部验证通过；发现 3 P2 + 2 P3 需返修或文档化
- 结论适用范围：HEAD 0c3e029 工作区 5 项变更 + 本轮 16 项攻击；未覆盖：真实 GHA runner 的 Chrome 行为、真实 Windows runner、分支保护绑定（无凭据）

## 关键验证通过项

- 严格/非严格退出码语义（注入验证）：REQUIRE_BROWSER=1 无浏览器 → exit 1 + REQUIRE_BROWSER 错误；非严格 → skipped exit 0
- Node 20/22/24 `node --test` 全部 30/30；`npm run verify` exit 0
- phaser 哈希三重一致（工作区 = git blob = pinned e92ddef…）；实测 0 CR 0 LF 证实 KK3 字节证据
- 聚合 job 9 种 needs.*.result 组合推演：仅双 success 才 exit 0（含 cancelled/skipped 均正确捕获）
- 输出前缀逐字不变；诊断注解不掩盖退出码；3 并发 browser-smoke 独立端口全过
- PATH 含 Unicode/空格/emoji 正确解析

## 发现汇总

| ID | 级别 | 状态 | 阻断 |
|---|---|---|---|
| F-01 resolveChromeCandidate 不捕获 existsFn 异常（探测崩溃无降级） | P2 | 已复现 | 否 |
| F-02 .gitattributes 9 类扩展名外（.txt/.csv/.gitignore）在 Windows+autocrlf 下仍被 CRLF 化（实测 CR=3 注入） | P2 | 已复现 | 否 |
| F-03 REQUIRE_BROWSER=1 时 puppeteer 缓存隐式兜底，严格语义被绕过（G53 报告未声明该限制） | P2 | 已复现 | 否 |
| F-04 existsFn 不区分文件/目录（CHROME_BIN 指向目录 → OS 级 EACCES 而非清晰错误） | P3 | 已复现 | 否 |
| F-05 集成用例依赖本机 puppeteer 缓存（接受 ok 或 skipped 双路径） | P3 | 观察 | 否 |

## 主智能体对 F-03 的裁决

采纳方案 (a)：puppeteer 缓存的 headless-shell 是真实执行了测试的浏览器，exit 0 非假绿；CI fresh runner 无缓存不受影响。要求 G53 在代码注释/报告补显式声明，不改行为。

## 返修任务（G53，一次）

1. F-01：browser-smoke.mjs 的 `await existsFn(...)` 包 try/catch，异常按"不存在"降级继续探测；新增单测"existsFn throws → 继续下一候选或 null"
2. F-02：.gitattributes 补 `*.txt`、`*.csv`、`.gitignore` 三条 eol=lf 规则；头部注释声明"新增文本扩展名须同步补规则"
3. F-03：main() 或 findCachedHeadlessShell 处加注释：REQUIRE_BROWSER=1 语义为"必须有可用浏览器（含 puppeteer 缓存）"，非"必须显式配置"
4. F-04（顺手，同一文件）：exists 改 stat + isFile() 过滤目录
5. F-05：集成用例加一行注释说明双路径接受的原因

不得改：输出前缀、CLI 守卫、validate.mjs 契约、聚合 job 结构。

## 未能执行的检查

真实 GHA 三平台 runner 行为（Chrome 版本/flags 兼容、pwsh ::error:: 渲染、真实 Windows autocrlf 端到端）、分支保护绑定（无凭据，上抛 KK3）——由推送后 CI 与人类裁决。

## 需 KK3 判断的架构问题

1. F-02 扩展名治理边界（全量覆盖 vs CR 字节门禁方案 (a)）
2. 分支保护绑定 quality-gates-complete 应列 P1（人类操作）
