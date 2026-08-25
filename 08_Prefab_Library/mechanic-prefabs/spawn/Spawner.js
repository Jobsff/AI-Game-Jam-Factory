import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";

export const SPAWN_EVENTS = Object.freeze({ SPAWNED: "spawn:spawned", LIMIT_REACHED: "spawn:limit-reached" });

export class Spawner {
  constructor(config = {}) {
    if (typeof config.factory !== "function") throw new TypeError("factory must be a function");
    this.factory = config.factory;
    this.interval = config.interval ?? 1000;
    this.max = config.max ?? Infinity;
    if (!Number.isFinite(this.interval) || this.interval <= 0) throw new RangeError("interval must be a positive number");
    if (!(this.max === Infinity || (Number.isInteger(this.max) && this.max >= 0))) throw new RangeError("max must be a non-negative integer or Infinity");
    this.bounds = config.bounds ?? null;
    this.#validateBounds();
    this.random = config.random ?? Math.random;
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.scheduler = config.scheduler ?? { setInterval: globalThis.setInterval.bind(globalThis), clearInterval: globalThis.clearInterval.bind(globalThis) };
    this.count = 0; this.handle = null; this.enabled = true; this.destroyed = false;
  }
  start() { this.#assertAlive(); if (!this.enabled || this.handle !== null || this.count >= this.max) return false; this.handle = this.scheduler.setInterval(() => this.spawnOne(), this.interval); return true; }
  stop() { this.#assertAlive(); if (this.handle === null) return false; this.scheduler.clearInterval(this.handle); this.handle = null; return true; }
  spawnOne() {
    this.#assertAlive();
    if (!this.enabled) return null;
    if (this.count >= this.max) { if (this.handle !== null) this.stop(); this.eventBus.emit(SPAWN_EVENTS.LIMIT_REACHED, { count: this.count, max: this.max }); return null; }
    const position = this.#position();
    const item = this.factory({ index: this.count, position });
    if (item === undefined) throw new Error("factory must return a spawned item");
    const payload = { item, index: this.count, position };
    this.count += 1;
    this.eventBus.emit(SPAWN_EVENTS.SPAWNED, payload);
    if (this.count >= this.max && this.handle !== null) this.stop();
    return payload;
  }
  #validateBounds() {
    if (!this.bounds) return;
    const { x, y, width, height } = this.bounds;
    if (![x, y, width, height].every(Number.isFinite)) throw new TypeError("bounds must contain finite x, y, width and height");
    if (width < 0 || height < 0) throw new RangeError("bounds width and height must be non-negative");
  }
  #position() {
    if (!this.bounds) return null;
    const { x, y, width, height } = this.bounds;
    return { x: x + this.random() * width, y: y + this.random() * height };
  }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); if (this.handle !== null) this.stop(); this.enabled = false; }
  reset() { this.#assertAlive(); if (this.handle !== null) this.stop(); this.count = 0; this.enabled = true; }
  destroy() { if (this.destroyed) return; if (this.handle !== null) this.stop(); this.destroyed = true; }
  #assertAlive() { if (this.destroyed) throw new Error("Spawner is destroyed"); }
}
export default Spawner;
