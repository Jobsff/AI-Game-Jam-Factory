// 模板4：反应/躲避/操作
// 核心循环：操控角色左右移动，躲避下落的障碍，坚持越久分越高
// 状态机：READY -> PLAYING -> GAMEOVER
// 重点：碰撞检测 + 精准操作
export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.state = "READY";
    this.score = 0;
    this.speed = 4;

    // 玩家（占位：底部色块，后续换成 AI 角色）
    this.player = this.add.rectangle(360, 1150, 100, 100, 0x4fc3f7);
    this.obstacles = this.add.group();

    this.scoreText = this.add.text(20, 20, "得分: 0", {
      fontSize: "32px", color: "#ffffff",
    });

    // 触摸/鼠标控制：点哪里，玩家移向哪里
    this.input.on("pointermove", (pointer) => {
      this.player.x = Phaser.Math.Clamp(pointer.x, 60, 660);
    });
    this.input.on("pointerdown", (pointer) => {
      this.player.x = Phaser.Math.Clamp(pointer.x, 60, 660);
    });

    this.start();
  }

  start() {
    this.state = "PLAYING";
    // 定时生成障碍
    this.time.addEvent({ delay: 700, loop: true, callback: () => this.spawnObstacle() });
  }

  spawnObstacle() {
    const ob = this.add.rectangle(
      Phaser.Math.Between(60, 660), -40, 70, 70, 0xff5252
    );
    this.obstacles.add(ob);
  }

  update() {
    if (this.state !== "PLAYING") return;

    // 障碍下落 + 碰撞检测
    this.obstacles.getChildren().forEach((ob) => {
      if (!ob.active) return;
      ob.y += this.speed;
      this.score += 0.01;
      this.scoreText.setText(`得分: ${Math.floor(this.score)}`);

      // 碰撞 → 失败
      if (Phaser.Geom.Rectangle.Overlaps(ob.getBounds(), this.player.getBounds())) {
        this.gameOver();
      }
      if (ob.y > 1320) ob.destroy();
    });
  }

  gameOver() {
    this.state = "GAMEOVER";
    this.add.text(360, 500, "💥 游戏结束", {
      fontSize: "56px", color: "#ff5252",
    }).setOrigin(0.5);
    this.add.text(360, 640, `最终得分: ${Math.floor(this.score)}`, {
      fontSize: "36px", color: "#ffffff",
    }).setOrigin(0.5);
    this.add.text(360, 800, "点击重新开始", { fontSize: "28px", color: "#ffffff" }).setOrigin(0.5);
    this.input.once("pointerdown", () => this.scene.restart());
  }
}
