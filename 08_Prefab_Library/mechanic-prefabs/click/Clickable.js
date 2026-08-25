import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";

export const CLICK_EVENTS = Object.freeze({ CLICKED: "click:clicked" });

export class Clickable {
  constructor(scene, gameObject, config = {}) {
    if (!scene?.input || !gameObject?.on || !gameObject?.off) throw new TypeError("scene.input and an event-capable gameObject are required");
    this.scene = scene;
    this.gameObject = gameObject;
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.cooldown = config.cooldown ?? 0;
    this.now = config.now ?? Date.now;
    if (!Number.isFinite(this.cooldown) || this.cooldown < 0) throw new RangeError("cooldown must be a non-negative number");
    this.enabled = true;
    this.destroyed = false;
    this.ownsInteractive = !gameObject.input;
    this.lastClickAt = -Infinity;
    this.handlePointerDown = this.#handlePointerDown.bind(this);
    if (this.ownsInteractive) gameObject.setInteractive?.();
    gameObject.on("pointerdown", this.handlePointerDown);
  }

  #handlePointerDown(pointer) {
    if (!this.enabled) return;
    const at = this.now();
    if (at - this.lastClickAt < this.cooldown) return;
    this.lastClickAt = at;
    this.eventBus.emit(CLICK_EVENTS.CLICKED, { target: this.gameObject, pointer, at });
  }

  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; }
  reset() { this.#assertAlive(); this.lastClickAt = -Infinity; this.enabled = true; }
  destroy() {
    if (this.destroyed) return;
    this.gameObject.off("pointerdown", this.handlePointerDown);
    if (this.ownsInteractive && this.gameObject.scene && this.gameObject.input) {
      this.gameObject.disableInteractive?.();
    }
    this.destroyed = true;
  }
  #assertAlive() { if (this.destroyed) throw new Error("Clickable is destroyed"); }
}

export default Clickable;
