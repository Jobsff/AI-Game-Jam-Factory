// 合成结果对象（占位：合成后展示的新物品。后续替换成 AI 生成结果）
export default class Creator extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    const g = scene.add.graphics();
    g.fillStyle(0xffd54a, 1);
    g.fillCircle(0, 0, 60);
    this.add(g);
    scene.add.existing(this);
  }
}
