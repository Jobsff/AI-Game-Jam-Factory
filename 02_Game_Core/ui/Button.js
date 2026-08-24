// 通用按钮组件：统一 UI 风格，带按下反馈
export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, { width = 240, height = 80, bgColor = 0x3d5afe, onClick } = {}) {
    super(scene, x, y);

    const g = scene.add.graphics();
    g.fillStyle(bgColor, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, 20);
    this.add(g);

    const text = scene.add.text(0, 0, label, {
      fontSize: "30px", color: "#ffffff", fontStyle: "bold",
    }).setOrigin(0.5);
    this.add(text);

    this.setSize(width, height);
    this.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    this.on("pointerdown", () => {
      this.scene.tweens.add({ targets: this, scale: 0.92, duration: 80, yoyo: true });
      if (onClick) onClick();
    });

    scene.add.existing(this);
  }
}
