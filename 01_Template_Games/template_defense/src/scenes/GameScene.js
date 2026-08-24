// 模板2：保护/防守/守护
// 核心循环：敌人从边缘逼近核心目标 → 点击敌人消灭 → 保护目标血量 → 坚持到胜利/血量归零失败
// 状态机：READY -> WAVE -> DEFEND -> WIN / FAIL
export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.state = "READY";
    this.hp = 5;        // 核心目标血量
    this.wave = 0;
    this.maxWave = 5;   // 坚持 5 波胜利

    // 核心目标（占位：中心大色块，后续换成 AI 生成的核心物）
    this.core = this.add.circle(360, 640, 90, 0x4fc3f7);
    this.hpText = this.add.text(360, 200, `核心 HP: ${this.hp}`, {
      fontSize: "30px", color: "#ffffff",
    }).setOrigin(0.5);

    this.enemies = this.add.group();

    this.add.text(360, 100, "点击敌人，保护核心！", {
      fontSize: "30px", color: "#ffffff",
    }).setOrigin(0.5);

    this.startWave();
  }

  startWave() {
    this.state = "WAVE";
    this.wave++;
    // 每波生成 wave+2 个敌人
    for (let i = 0; i < this.wave + 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const ex = 360 + Math.cos(angle) * 500;
      const ey = 640 + Math.sin(angle) * 500;
      const enemy = this.add.circle(ex, ey, 32, 0xff5252);
      enemy.setInteractive();
      enemy.on("pointerdown", () => { enemy.destroy(); });
      this.enemies.add(enemy);
    }
    this.state = "DEFEND";
  }

  update() {
    if (this.state !== "DEFEND") return;

    // 敌人向核心移动，碰到核心扣血
    this.enemies.getChildren().forEach((enemy) => {
      if (!enemy.active) return;
      this.physics = this.physics || null;
      const dx = 360 - enemy.x;
      const dy = 640 - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 95) {
        enemy.destroy();
        this.hp--;
        this.hpText.setText(`核心 HP: ${this.hp}`);
        if (this.hp <= 0) this.gameOver(false);
      } else {
        enemy.x += (dx / dist) * 1.5;
        enemy.y += (dy / dist) * 1.5;
      }
    });

    // 波清空 → 下一波或胜利
    if (this.enemies.getChildren().every((e) => !e.active)) {
      if (this.wave >= this.maxWave) this.gameOver(true);
      else this.startWave();
    }
  }

  gameOver(win) {
    this.state = win ? "WIN" : "FAIL";
    const msg = win ? "🎉 守护成功！" : "💔 守护失败";
    this.add.text(360, 640, msg, {
      fontSize: "56px", color: win ? "#ffd54a" : "#ff5252",
    }).setOrigin(0.5);
    this.add.text(360, 900, "点击重新开始", { fontSize: "28px", color: "#ffffff" }).setOrigin(0.5);
    this.input.once("pointerdown", () => this.scene.restart());
  }
}
