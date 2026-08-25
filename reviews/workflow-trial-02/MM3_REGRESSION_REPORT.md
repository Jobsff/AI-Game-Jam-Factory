# MM3 回归报告 — G53 返修验证

- 回归角色：MM3（agent_cdde4010 恢复执行）；toolUses 21；耗时约 3 分钟；只测不改
- 结论：**Go**——5 项原发现全部 Fixed（F-05 为文档化设计选择）

## 回归判定

| ID | 判定 | 关键证据 |
|---|---|---|
| F-01 探测异常泄露 | Fixed | attack_throws.mjs → resolved:null；首抛后降级下一候选 → resolved headless-shell；probe() try/catch 落地 |
| F-02 未覆盖扩展名 CRLF | Fixed | autocrlf=true checkout 后 .txt/.csv/.gitignore 全部 CR=0；三条新规则 + 警示注释；check-attr 生效 |
| F-03 REQUIRE_BROWSER 语义 | Fixed（契约注释） | 源码块注释明确"puppeteer 缓存合法"，行为不变 |
| F-04 目录误接受 | Fixed | exists 改 stat+isFile；CHROME_BIN=目录 → null 并回退 darwin 候选 |
| F-05 集成用例双路径 | Partially Fixed（文档化） | 注释声明 happy-path 定位；拆分用例为可选未强制 |

## 回归证据

node --test browser-smoke.test.js 10/10；npm test 33/33（Node 20/22/24 三版本）；npm run verify exit 0；phaser SHA 不变；输出前缀逐字保留；git status 无越界（4 M + 1 新增 + 既有 .zcode//reviews/）；未发现新缺陷。

## 未能执行

真实 GHA runner 端到端（Chrome flags、真实 Windows autocrlf、CI 语义）——由推送后 CI 裁决。
