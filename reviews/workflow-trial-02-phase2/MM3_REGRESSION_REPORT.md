# MM3 回归报告 — 阶段 5 返修验证（F1）

> 主智能体按原文收录（MM3 agentId agent_9e709635，toolUses 39，约 4 分钟）。裁判亲验一致：`PORT=abc node scripts/serve.mjs /tmp` → exit 1 / stderr 单行 / 无栈无路径。

## 【Go / No-Go】

**Go** — F1 返修已修复；接口冻结声明全部成立；全门槛 43/43 + verify exit 0；工作区相对本轮起始快照零新增改动。

## 【结论适用范围】

- 审查对象：`scripts/serve.mjs` CLI 入口 try/catch 修复 + `tests/serve.test.js` 新增 1 用例；G53 接口冻结声明。
- 攻击范围：F1 五种 PORT/HOST 边界（CLI spawn）、程序式 createStaticServer 边界与 happy-path、G5/G6、symlink 逃逸、405/403/404/HEAD/MIME、全门槛、工作区完整性。
- 未覆盖：Windows/Linux 平台（CI 矩阵补）、Node 20.11/22 LTS 差异（engines 已声明 ≥20.11）、非白名单文件、GUI 浏览器（禁用，headless browser-smoke 已过）。

## F1 复攻判定：Fixed

| 输入 | exit | stderr 行数 | 含 at 帧 | 含路径 | 含横幅 | 单行内容 |
|---|---|---|---|---|---|---|
| `PORT=abc` | 1 | 1 | 0 | 0 | 0 | `port must be an integer between 0 and 65535` |
| `PORT=-1` | 1 | 1 | 0 | 0 | 0 | 同上 |
| `PORT=99999` | 1 | 1 | 0 | 0 | 0 | 同上 |
| `PORT=1.5` | 1 | 1 | 0 | 0 | 0 | 同上 |
| `HOST=`（空） | 1 | 1 | 0 | 0 | 0 | `host must be a non-empty string` |

证据：/tmp/agjf-mm3-regression/ports/{stdout,stderr}_*.txt。修复采用 `console.error(error.message)` + `process.exitCode=1`，`service?.listen()` 短路。

## 接口语义回归：成立

程序式探针实测：`port=99999/-1/1.5/"abc"` 均同步 throw RangeError；`host=""/12345` 同步 throw TypeError（与冻结声明一致）。合法 root+port=0 全链：listen→GET 200(text/html)→GET 200 txt→404→HEAD 200→POST 405(Allow: GET, HEAD)→`..%2f..%2fetc%2fpasswd` 403。MIME/HEAD/405 Allow/403 拦截全部不变。

## 既有行为回归

G5（不存在 root 单行 exit 1 无 unhandledRejection）PASS；G6（PORT=0 横幅实测端口 60774 + GET 200）PASS；symlink 逃逸（/escape.txt 403、..%2fsecret.txt 403）PASS；既有 2 用例含在 npm test 中通过。

## 全门槛与工作区

- `npm test` 43/43 pass / 0 skipped；`npm run verify` exit 0（validate ok → smoke ok: 25 resources → browser smoke ok: 5 templates + decision tool）。
- `git status --porcelain` 与起始快照 diff 为空（仓库所有者的外部文档改动为已知事项，未触碰）；`find . -name "*.factory-*"` count=0。

## 新发现

无。有效发现数 0（F1 已修复）。

## 剩余风险

win32 / Node 20.11 / Node 22 LTS 矩阵需 CI 补做；未来若引入自定义 Error 子类需复查 `error.message` 单行假设。

## 运行元数据

- 指定攻击 6 项 + 自行发现 1 项 = 7 项；关键命令 13 次；耗时约 12 分钟。
- 只读声明：0 次仓库写入、0 次 git 写操作、0 次 GUI 弹窗；产物全部在 /tmp/agjf-mm3-regression/。
