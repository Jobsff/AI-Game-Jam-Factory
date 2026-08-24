import GameScene from "./scenes/GameScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: "#1b1b2f",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [GameScene],
});
