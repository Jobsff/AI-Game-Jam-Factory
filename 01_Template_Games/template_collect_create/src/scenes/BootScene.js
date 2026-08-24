// 资源加载场景：未来在这里 load AI 生成的图片/音频
export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // 占位：load 资源时在这里加 this.load.image(...)
  }

  create() {
    this.scene.start("GameScene");
  }
}
