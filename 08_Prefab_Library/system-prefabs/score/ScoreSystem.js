import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";

export const SCORE_EVENTS = Object.freeze({ CHANGED: "score:changed", RESET: "score:reset" });

export class ScoreSystem {
  constructor(config = {}) {
    this.initial = config.initial ?? 0;
    if (!Number.isFinite(this.initial)) throw new TypeError("initial must be finite");
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.value = this.initial; this.enabled = true; this.destroyed = false;
  }
  add(amount) { if (!Number.isFinite(amount) || amount < 0) throw new RangeError("amount must be a non-negative finite number"); return this.#change(amount); }
  sub(amount) { if (!Number.isFinite(amount) || amount < 0) throw new RangeError("amount must be a non-negative finite number"); return this.#change(-amount); }
  #change(delta) {
    this.#assertAlive();
    if (!Number.isFinite(delta)) throw new TypeError("amount must be finite");
    if (!this.enabled) return this.value;
    const previous = this.value; this.value += delta;
    this.eventBus.emit(SCORE_EVENTS.CHANGED, { value: this.value, previous, delta });
    return this.value;
  }
  get() { this.#assertAlive(); return this.value; }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; }
  reset() { this.#assertAlive(); const previous = this.value; this.value = this.initial; this.enabled = true; const payload = { value: this.value, previous, delta: this.value - previous }; this.eventBus.emit(SCORE_EVENTS.RESET, payload); this.eventBus.emit(SCORE_EVENTS.CHANGED, payload); return this.value; }
  destroy() { this.destroyed = true; }
  #assertAlive() { if (this.destroyed) throw new Error("ScoreSystem is destroyed"); }
}
export default ScoreSystem;
