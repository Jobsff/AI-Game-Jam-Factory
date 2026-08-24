// 模板3：选择/分支/后果
// 核心循环：出现两难选择 → 点击选择 → 世界状态改变 → 多轮后走向不同结局
// 状态机：START -> CHOOSING -> WORLD_CHANGE -> ENDING
// 特点：核心不是 update，是"数据驱动"（选择改变 state 数据）
export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.state = "CHOOSING";
    this.round = 0;
    this.maxRound = 3;
    // 世界状态（单一真源，选择改变它，结局由它决定）
    this.world = { kindness: 0, power: 0 };

    this.title = this.add.text(360, 120, "你的选择会改变世界", {
      fontSize: "34px", color: "#ffffff",
    }).setOrigin(0.5);

    this.showChoice();
  }

  // 展示一轮选择（占位：后续换成有剧情的选择）
  showChoice() {
    if (this.round >= this.maxRound) return this.showEnding();

    this.round++;
    this.clearButtons();
    this.title.setText(`第 ${this.round} 次选择：你会怎么做？`);

    // 两个选择按钮
    const btnA = this.add.text(360, 400, "A. 帮助它", {
      fontSize: "36px", color: "#ffffff", backgroundColor: "#388e3c",
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive();
    const btnB = this.add.text(360, 600, "B. 挑战它", {
      fontSize: "36px", color: "#ffffff", backgroundColor: "#d32f2f",
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive();

    btnA.on("pointerdown", () => { this.world.kindness++; this.showChoice(); });
    btnB.on("pointerdown", () => { this.world.power++; this.showChoice(); });

    this.buttons = [btnA, btnB];
  }

  clearButtons() {
    if (this.buttons) this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
  }

  showEnding() {
    this.state = "ENDING";
    this.clearButtons();
    // 结局由世界状态决定
    const ending = this.world.kindness > this.world.power
      ? "🌱 你选择善良，世界开满花"
      : "⚔️ 你选择力量，世界走向变革";
    this.title.setText(ending);
    this.add.text(360, 900, "点击重新开始", { fontSize: "28px", color: "#ffffff" }).setOrigin(0.5);
    this.input.once("pointerdown", () => this.scene.restart());
  }
}
