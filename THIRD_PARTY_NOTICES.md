# Third-Party Notices

## 边界说明

本仓库中 `vendor/phaser.min.js` 是第三方 **Phaser 3.90.0 runtime** 的本地缓存；其许可证文本位于 [`vendor/PHASER_LICENSE.txt`](vendor/PHASER_LICENSE.txt)，缓存与校验说明见 [`vendor/README.md`](vendor/README.md)；当前固定 SHA-256 为 `e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7`。Phaser 的许可证只覆盖 Phaser 自身，不自动覆盖本仓库的自研代码、文档、模板、Prompt 或资产。

除上述 runtime 及其随附许可证文本外，本仓库当前纳入验证的 Factory 脚本、Game Core、Prefab、模板适配、决策器、文档和数据均为仓库内自研内容。该陈述不替代提交作品中新增字体、图片、音频、模型、生成服务输出或依赖的逐项审计。

## 分发清单

- [ ] 分发 Phaser runtime 时同时保留 `vendor/PHASER_LICENSE.txt`。
- [ ] 运行 `node scripts/cache-phaser.mjs` 前核对版本、来源与 hash；变化时更新本说明。
- [ ] 新增第三方项时记录 name、version、source、license、用途、包含文件和 NOTICE 要求。
- [ ] 不明来源或不明 license 项标“待核验”，不得进入商业化包。
- [ ] 商业化前按 [`OPEN_SOURCE_POLICY.md`](00_Command_Center/OPEN_SOURCE_POLICY.md)逐文件复核。

本仓库没有通过此文件为整体添加开源 LICENSE。
