import LifecycleBag from "./LifecycleBag.js";

/** Phaser 输入适配器；不读取 Phaser 全局，便于用轻量 mock 测试。 */
export class InputManager {
  constructor(scene, config = {}) {
    if (!scene?.input) throw new TypeError("scene.input is required");
    this.scene = scene;
    this.justDownAdapter = config.justDown ?? ((key) => key?.justDown === true);
    this.keys = new Map();
    this.lifecycle = new LifecycleBag();
    this.enabled = true;
  }

  addKey(name, keyCode) {
    this.#assertAlive();
    if (!this.scene.input.keyboard?.addKey) throw new Error("scene.input.keyboard.addKey is unavailable");
    const key = this.scene.input.keyboard.addKey(keyCode);
    this.keys.set(name, key);
    return key;
  }

  isDown(name) { this.#assertAlive(); return this.enabled && Boolean(this.keys.get(name)?.isDown); }
  justDown(name) { this.#assertAlive(); return this.enabled && Boolean(this.justDownAdapter(this.keys.get(name))); }

  onTap(listener) {
    this.#assertAlive();
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    const wrapped = (pointer, ...args) => { if (this.enabled) listener(pointer, ...args); };
    this.lifecycle.listen(this.scene.input, "pointerdown", wrapped);
    return () => this.scene.input.off("pointerdown", wrapped);
  }

  tapPosition() {
    this.#assertAlive();
    const pointer = this.scene.input.activePointer;
    if (!pointer) throw new Error("activePointer is unavailable");
    return { x: pointer.x, y: pointer.y };
  }

  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; }
  reset() { this.#assertAlive(); this.keys.clear(); this.enabled = true; }
  destroy() { if (!this.lifecycle.destroyed) this.lifecycle.destroy(); this.keys.clear(); }
  #assertAlive() { if (this.lifecycle.destroyed) throw new Error("InputManager is destroyed"); }
}

export default InputManager;
