# Trial 02 基线（00_BASELINE）

- 时间：2026-08-25（Trial 01 + 维护线 + CI 跨平台修复之后）
- HEAD：0c3e0297da5ea5118b1ab825e62ad7cc8b0874ac（main，工作区干净，与 origin 同步）
- 内容级基线：/tmp/agjf-trial02-checkpoint（202 文件）+ /tmp/agjf-trial02-checkpoint.sha256
- CI 现状：九组矩阵全绿（3 OS × Node 20/22/24，npm test + validate + smoke）
- 本轮范围：
  1. 第一批强制整改（P1-01 浏览器 CI 门禁 / P1-02 gitattributes 精确化 / P1-03 聚合 job 与分支保护 / P2-01 Node 20 结论证明或收窄）
  2. Trial 02：工程生成器事务安全与破坏性路径对抗（create-game.mjs / validate-game.mjs / serve.mjs）
- 退出条件：见指令第十一节
