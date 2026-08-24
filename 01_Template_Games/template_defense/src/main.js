import GameScene from "./scenes/GameScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  backgroundColor: "#1a1a2e",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [GameScene],
});
