import LifecycleBag from "./LifecycleBag.js";

/** 对 Phaser Loader 的薄封装，只负责注册资源和可清理的进度监听。 */
export class AssetLoader {
  constructor(scene) {
    if (!scene?.load) throw new TypeError("scene.load is required");
    this.scene = scene;
    this.lifecycle = new LifecycleBag();
  }

  loadImages(entries) { return this.#loadMap("image", entries); }
  loadAudio(entries) { return this.#loadMap("audio", entries); }

  onProgress(listener) { this.#assertAlive(); this.lifecycle.listen(this.scene.load, "progress", listener); return listener; }
  onComplete(listener) {
    this.#assertAlive();
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    const wrapped = (...args) => { this.scene.load.off("complete", wrapped); listener(...args); };
    this.lifecycle.listen(this.scene.load, "complete", wrapped);
    return listener;
  }

  reset() { this.#assertAlive(); this.lifecycle.clear(); }
  destroy() { if (!this.lifecycle.destroyed) this.lifecycle.destroy(); }

  #loadMap(method, entries) {
    this.#assertAlive();
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) throw new TypeError("entries must be an object");
    if (typeof this.scene.load[method] !== "function") throw new Error(`scene.load.${method} is unavailable`);
    for (const [key, path] of Object.entries(entries)) {
      if (!key || (typeof path !== "string" && !Array.isArray(path))) throw new TypeError(`invalid asset entry: ${key}`);
      this.scene.load[method](key, path);
    }
    return Object.keys(entries).length;
  }

  #assertAlive() { if (this.lifecycle.destroyed) throw new Error("AssetLoader is destroyed"); }
}

export default AssetLoader;
