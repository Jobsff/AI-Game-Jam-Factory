# 开源参考矩阵｜直接借鉴、学思路重写、跳过

> 核验日期：**2026-08-25**。这里记录的是赛前技术决策，不是法律意见。许可证允许复用，不等于适合在 53 小时赛事中临时接入；代码许可也不自动覆盖示例游戏中的字体、图片、音频、商标、人物或其他素材。

## 决策等级

- **A｜直接借鉴**：仅限许可证、版本、依赖、素材来源和归属义务都已核验，并已在本仓库内通过离线、浏览器和交互测试的依赖。
- **B｜学思路重写**：参考公开架构与接口思想，由本项目重新实现；不复制源码、素材、Prompt 文本或示例内容。
- **C｜跳过现场接入**：即使许可证宽松，也因体量、构建链、未知模型／服务、玩法不匹配或测试成本过高而不进入主链。

## 已核验候选

| 候选 | 核验快照 | 仓库级许可证 | 现场建议 | 可借鉴内容 | 不采用／前置条件 |
|---|---|---|---|---|---|
| **Phaser 3.90.0 runtime** | 本仓库固定 `vendor/phaser.min.js`，SHA-256 `e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7` | MIT；许可证已放入 `vendor/PHASER_LICENSE.txt` | **A 直接使用** | 引擎 runtime | 保留许可证与版本／hash；比赛前不得临时升级 |
| **Phaser “Create with Phaser” 可玩模板画廊** | `phaser.io/create` 页面可访问；每个卡片对应内容和素材的授权范围未在本次仓库审计中逐项确认 | **逐模板待核验**，不能把“官方页面”推定为所有代码与素材统一 MIT | **B 学玩法结构，默认不复制** | 2048、Breakout、Snake、Shmup 等循环、节奏、碰撞与输入拆法 | 要直接拿某一模板，必须记录具体源码仓库、commit、LICENSE、NOTICE、素材逐文件来源后再决定 |
| **phaserjs/create-game** | `main`；GitHub 仓库元数据未识别到 repo-level license | 未确认 | **C 不接入** | 官方脚手架的交互流程可作产品参考 | 当前生产线是无构建 CDN/ESM；不能在未确认许可证时复制 CLI 代码 |
| **renatocassino/phaser-toolkit**（用户提到的 `ag-game/phaser-toolkit` 是其 fork） | `main` commit `0291de27d1cde451432d1decc084efbe180919da`；TypeScript monorepo | MIT | **B 学思路重写** | Hudini 的布局／组件 API、phaser-wind token、hooks 的状态隔离思想 | 不把 React 风格 hooks、monorepo 或额外构建依赖带入现场；若复制源码必须保留 MIT notice 并审计 package 依赖 |
| **SkyAlpha/luminus-rpg** | `master` commit `e381475e4a1c0ccc50af81b7713333df7916235e`；Action RPG template，最后提交 2023-06-13 | MIT | **C 跳过现场接入** | ECS/plugin 边界可供赛后 RPG 工厂研究 | 体量大、RPG/ECS 假设重、资产多，和 30 秒核心循环／零构建目标不匹配；素材必须另审计 |
| **yandeu/phaser-project-template** | `master` commit `2664d16f8b65cdfd050968b42134eaca7ed656c0`；TypeScript + webpack，最后提交 2023-01-24 | MIT | **C 跳过现场接入** | 脚手架目录与 PWA 构建可作赛后参考 | 直接引入会打破“CDN + 原生 JS + 无构建”冻结；需要 webpack/TS 时另开分支验证 |
| **leigest519/OpenGame** | `main` commit `7fb78d30874f92cdd6bad817cceaec1f9557dc49`；Node ≥20，TypeScript agent CLI，框架版本 0.6.0 | Apache-2.0；LICENSE 包含归属与 NOTICE／修改声明要求 | **B 借魂不搬家；C 不作现场主链** | Template Skill、Debug Skill、headless browser 验证、Build Health／Visual Usability／Intent Alignment 思路 | 框架需 `npm install/build/link`，主 LLM 走 OpenAI-compatible API，图片／视频／音频各需自带 key；仓库 README 未给出可直接下载的 GameCoder-27B 权重或最低 GPU 配置，不能把“模型可本地跑”当作已验证事实 |

## OpenGame 的明确结论

1. **能用框架，不等于能在现场稳定用 GameCoder-27B。** 当前仓库说明 Node.js 20+、源码安装、OpenAI-compatible API 与多模态 provider 配置；GameCoder-27B 只被描述为可替换的本地模型，权重获取、模型许可证、量化格式、推理引擎和最低显存均未在本次核验材料中形成闭环。
2. **27B 本地推理必须赛前单独压测。** 不能仅凭参数量给出唯一显存数字；量化、上下文、KV cache、并发和推理后端都会改变需求。没有在比赛机器上完成“安装→加载→生成→浏览器调试→重启”的演练，就视为不可用。
3. **本仓库只吸收方法论。** `AGENTS.md`、玩法母件、模块契约、Debug Report、浏览器 smoke 与交互回归，已经把 Template Skill + Debug Skill 的核心纪律轻量化落地，同时保留 Phaser + Codex 主链。
4. **OpenGame-Bench 不能直接当获奖概率。** Build Health、Visual Usability、Intent Alignment 适合工程验收；创意、主题契合、儿童真实贡献和路演仍由本仓库的决策器与现场流程管理。

## 任何外部代码进入项目之前

- [ ] 记录准确的 `owner/repo`、branch/tag、commit SHA 和核验日期。
- [ ] 阅读根 LICENSE、NOTICE、子目录 LICENSE、package metadata 和素材说明；“GitHub 显示 MIT”不能替代文件级审计。
- [ ] 区分代码、模型权重、训练数据、图片、音频、字体、商标／角色 IP 的授权。
- [ ] 保存必要的许可证文本和 attribution；Apache-2.0 修改文件要留明显修改说明，NOTICE 存在时要传递。
- [ ] 在独立分支或临时工程运行安装、构建、离线、浏览器、重启和移动端测试。
- [ ] 不能在 30 分钟内回退的依赖，不进入比赛主线。
- [ ] 商业化前重新核验上游 commit 与全部分发物；比赛时的审计记录只是起点。

## 当前仓库执行决定

- 生产 runtime：只直接分发已固定 hash 的 Phaser 3.90.0。
- 玩法实现：本仓库原创、契约驱动，不复制外部示例游戏。
- AI 工程：Codex 主力；OpenGame 仅作为方法论参考，不是运行依赖。
- UI／状态／ECS：只吸收设计思想，不增加 phaser-toolkit、luminus-rpg 或 webpack boilerplate 依赖。
- 外部资产：默认不入库；确需使用时在 `THIRD_PARTY_NOTICES.md` 和提交清单中逐项登记。
