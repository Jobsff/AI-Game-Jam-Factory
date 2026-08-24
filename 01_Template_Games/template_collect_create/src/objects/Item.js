// 可收集碎片对象（占位：色块。后续替换成 AI 生成的物品图）
let uid = 0;

export default class Item extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.itemId = ++uid;

    // 占位图形：一个圆角色块（后续换成 this.scene.add.image(0,0,'item')）
    const g = scene.add.graphics();
    g.fillStyle(0xff8a80, 1);
    g.fillRoundedRect(-40, -40, 80, 80, 16);
    this.add(g);

    // 加个数字标识
    const label = scene.add.text(0, 0, String(this.itemId), {
      fontSize: "28px", color: "#ffffff",
    }).setOrigin(0.5);
    this.add(label);

    this.setSize(80, 80);
    scene.add.existing(this);
  }

  // 收集时的反馈动画
  collect() {
    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => this.destroy(),
    });
  }
}
