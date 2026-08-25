export default class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }
  create() {
    const textures = [
      ["player", 0x54d7ff, "circle"], ["enemy", 0xff5b6e, "circle"],
      ["fragment-a", 0xffc857, "round"], ["fragment-b", 0x6ee7b7, "round"],
      ["target", 0xffe66d, "star"], ["decoy", 0x62718a, "circle"],
      ["obstacle", 0xff6b6b, "round"], ["core", 0x5eead4, "circle"]
    ];
    for (const [key, color, shape] of textures) {
      if (this.textures.exists(key)) continue;
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(color, 1);
      if (shape === "circle") graphics.fillCircle(40, 40, 36);
      else if (shape === "star") {
        graphics.fillTriangle(40, 2, 75, 60, 5, 60);
        graphics.fillTriangle(40, 78, 5, 20, 75, 20);
      }
      else graphics.fillRoundedRect(4, 4, 72, 72, 16);
      graphics.generateTexture(key, 80, 80);
      graphics.destroy();
    }
    this.scene.start("GameScene");
  }
}
