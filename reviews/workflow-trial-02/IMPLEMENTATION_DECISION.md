# 主智能体裁决 — 第一批强制整改

依据：主管指令 P1-01/02/03 + P2-01 + KK3 初审（F1-F7）。

## 采用

1. **P1-01 + F1**（F1 是 P1-01 的前置 blocker，必须同批修）：browser-smoke 浏览器发现修复 + `REQUIRE_BROWSER=1` 严格模式 + CI 独立浏览器 job（ubuntu-latest / Node 22 / REQUIRE_BROWSER=1）。
2. **P1-02 + F3**：.gitattributes 改精确规则（按指令 P1-02 的规则表），不做 KK3 的方案 (a)（CR 门禁超出本轮授权文件范围）。
3. **P1-03 + F5**：聚合 job `quality-gates-complete`（needs 矩阵 + browser job，if: always()，任一非 success 即失败）。分支保护：无认证凭据，如实报告"未配置 + 人类操作项"。
4. **P2-01 + F4 方案 B**：独立复现失败（P2-01_REPRO_LOG.md），收窄 tests/validate-cli.test.js 注释。
5. **F2 更正记录**：a601faf 提交信息的 CRLF 因果被字节证据证伪，真因为 PROMPT_INDEX 路径分隔符。本文件即为更正记录（不改写历史提交）。
6. **F6**：注解步骤退化处理（显式 file 参数挂 tests/validate-cli.test.js 误导更小？）——采用"显式去掉路径"方案：改为单条 ::error:: 摘要。**F7**：decoy 注释声明 POSIX-only。

## 延期

- KK3 方案 (a) 的 validate.mjs CR 字节门禁（需另轮授权）
- GHA runner Chrome 预装诊断 job（由 browser job 本身实测裁决：红了就是发现失败）
- 8192 机制的 runner 级复现（收窄表述后不再必要）

## G53 允许修改文件（两批，各 ≤3）

批次 1：
1. scripts/browser-smoke.mjs — 裸名 PATH 查找（node:child_process which 试探或逐候选 spawnSync --version 探测）、win32 补绝对路径候选（C:\Program Files\Google\Chrome\Application\chrome.exe 等）、REQUIRE_BROWSER=1 时无浏览器 exit 1 且输出明确错误
2. tests/browser-smoke.test.js（新增）— 无浏览器严格模式 exit 1 / 非严格 exit 0 跳过语义 / 候选解析纯函数快照
3. .github/workflows/validate.yml — 新增 browser-smoke job（ubuntu-latest, node 22, REQUIRE_BROWSER: 1, npm run browser-smoke）；新增 quality-gates-complete 聚合 job（needs 两者，if: always()，两者 result 均 success 才过）；注解步骤退化为单条 ::error:: 摘要（去 awk 路径错乱）

批次 2：
4. .gitattributes — 精确规则：`* text=auto` + *.js/*.mjs/*.json/*.md/*.html/*.css/*.yml/*.yaml/*.sh `text eol=lf` + `vendor/phaser.min.js -text`（注释写明防御性质）
5. tests/validate-cli.test.js — F4 注释收窄（GHA macos-20 腿观察性表述，不称 Node 官方缺陷）+ F7 POSIX-only 边界注释
6. （无第三文件）

## 禁止修改

scripts/ 其余文件、五个玩法模板、08_Prefab_Library、02_Game_Core、package.json、README、tests/ 既有其他文件。

## 保持不变

browser-smoke 成功路径输出前缀（`browser ok:` / `browser smoke ok:`）；模板清单；serve.mjs 接口；validate.mjs 契约；npm 依赖为零。

## 验收标准

1. 先红后绿：browser-smoke.test.js 在实现前必须失败。
2. 本地：npm test 全绿（含新测试）；npm run verify exit 0；REQUIRE_BROWSER=1 + 清空候选（CHROME_BIN 指向不存在路径）时 exit 1。
3. 推送后 CI：九组矩阵 + browser-smoke job + 聚合 job 全绿。
4. .gitattributes 生效验证：git check-attr 显示 phaser 为 -text、*.js 为 eol=lf；git diff --check 干净；无大规模行尾 diff（git status 为空）。
5. 分支保护：如实输出"未配置 + 原因 + 人类操作 + 当前风险"。
