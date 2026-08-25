import BootScene from "./scenes/BootScene.js"; import GameScene from "./scenes/GameScene.js"; import UIScene from "./scenes/UIScene.js";
export default { type: Phaser.AUTO, parent: "game", width: 720, height: 1280, backgroundColor: "#101827", scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [BootScene, GameScene, UIScene] };
