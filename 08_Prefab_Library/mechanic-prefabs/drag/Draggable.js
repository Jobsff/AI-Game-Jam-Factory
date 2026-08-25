import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";
import LifecycleBag from "../../../02_Game_Core/core/LifecycleBag.js";

export const DRAG_EVENTS = Object.freeze({ STARTED: "drag:started", MOVED: "drag:moved", ENDED: "drag:ended" });

export class Draggable {
  constructor(scene, gameObject, config = {}) {
    if (!scene?.input || !gameObject) throw new TypeError("scene.input and gameObject are required");
    this.scene = scene;
    this.gameObject = gameObject;
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.bounds = config.bounds ?? null;
    this.#validateBounds();
    this.snapBack = config.snapBack ?? false;
    this.origin = { x: gameObject.x, y: gameObject.y };
    this.enabled = true;
    this.lifecycle = new LifecycleBag();
    this.ownsInteractive = !gameObject.input;
    if (this.ownsInteractive) gameObject.setInteractive?.();
    scene.input.setDraggable?.(gameObject, true);
    this.lifecycle.listen(scene.input, "dragstart", this.#onStart, this);
    this.lifecycle.listen(scene.input, "drag", this.#onMove, this);
    this.lifecycle.listen(scene.input, "dragend", this.#onEnd, this);
  }

  #matches(target) { return this.enabled && target === this.gameObject; }
  #onStart(pointer, target) {
    if (!this.#matches(target)) return;
    this.eventBus.emit(DRAG_EVENTS.STARTED, { target, pointer, x: target.x, y: target.y });
  }
  #onMove(pointer, target, dragX, dragY) {
    if (!this.#matches(target)) return;
    const { x, y } = this.#clamp(dragX, dragY);
    if (typeof target.setPosition === "function") target.setPosition(x, y); else { target.x = x; target.y = y; }
    this.eventBus.emit(DRAG_EVENTS.MOVED, { target, pointer, x, y });
  }
  #onEnd(pointer, target) {
    if (!this.#matches(target)) return;
    if (this.snapBack) {
      if (typeof target.setPosition === "function") target.setPosition(this.origin.x, this.origin.y);
      else { target.x = this.origin.x; target.y = this.origin.y; }
    }
    this.eventBus.emit(DRAG_EVENTS.ENDED, { target, pointer, x: target.x, y: target.y, snappedBack: this.snapBack });
  }
  #validateBounds() {
    if (!this.bounds) return;
    for (const key of ["x", "y", "width", "height"]) {
      if (!Number.isFinite(this.bounds[key])) throw new TypeError("bounds must contain finite x, y, width and height");
    }
    if (this.bounds.width < 0 || this.bounds.height < 0) throw new RangeError("bounds width and height must be non-negative");
  }
  #clamp(x, y) {
    if (!this.bounds) return { x, y };
    return { x: Math.min(Math.max(x, this.bounds.x), this.bounds.x + this.bounds.width), y: Math.min(Math.max(y, this.bounds.y), this.bounds.y + this.bounds.height) };
  }
  enable() { this.#assertAlive(); this.enabled = true; this.scene.input.setDraggable?.(this.gameObject, true); }
  disable() { this.#assertAlive(); this.enabled = false; this.scene.input.setDraggable?.(this.gameObject, false); }
  reset() {
    this.#assertAlive();
    if (typeof this.gameObject.setPosition === "function") this.gameObject.setPosition(this.origin.x, this.origin.y);
    else { this.gameObject.x = this.origin.x; this.gameObject.y = this.origin.y; }
    this.enable();
  }
  destroy() {
    if (this.lifecycle.destroyed) return;
    if (this.gameObject.scene && this.gameObject.input) {
      this.scene.input.setDraggable?.(this.gameObject, false);
    }
    this.lifecycle.destroy();
    if (this.ownsInteractive && this.gameObject.scene && this.gameObject.input) {
      this.gameObject.disableInteractive?.();
    }
  }
  #assertAlive() { if (this.lifecycle.destroyed) throw new Error("Draggable is destroyed"); }
}

export default Draggable;
