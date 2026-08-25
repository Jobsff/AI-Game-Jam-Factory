import config from "./config.js";

try {
  if (!globalThis.Phaser) throw new Error("Phaser 未加载");
  globalThis.__FACTORY_GAME__ = new Phaser.Game(config);
} catch (error) {
  globalThis.dispatchEvent(new ErrorEvent("error", { error, message: error.message }));
}
