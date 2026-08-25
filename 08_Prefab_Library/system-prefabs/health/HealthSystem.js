import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";

export const HEALTH_EVENTS = Object.freeze({ CHANGED: "health:changed", DEPLETED: "health:depleted", RESET: "health:reset" });

export class HealthSystem {
  constructor(config = {}) {
    this.max = config.max ?? 100;
    this.initial = config.initial ?? this.max;
    if (!Number.isFinite(this.max) || this.max <= 0) throw new RangeError("max must be positive and finite");
    if (!Number.isFinite(this.initial) || this.initial < 0 || this.initial > this.max) throw new RangeError("initial must be between 0 and max");
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.value = this.initial; this.enabled = true; this.destroyed = false;
  }
  damage(amount) { this.#validateAmount(amount); return this.#change(-amount); }
  heal(amount) { this.#validateAmount(amount); return this.#change(amount); }
  #change(delta) {
    this.#assertAlive(); if (!this.enabled) return this.value;
    const previous = this.value; this.value = Math.min(this.max, Math.max(0, previous + delta));
    const payload = { value: this.value, max: this.max, previous, delta: this.value - previous };
    this.eventBus.emit(HEALTH_EVENTS.CHANGED, payload);
    if (previous > 0 && this.value === 0) this.eventBus.emit(HEALTH_EVENTS.DEPLETED, payload);
    return this.value;
  }
  get() { this.#assertAlive(); return this.value; }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; }
  reset() { this.#assertAlive(); const previous = this.value; this.value = this.initial; this.enabled = true; const payload = { value: this.value, max: this.max, previous, delta: this.value - previous }; this.eventBus.emit(HEALTH_EVENTS.RESET, payload); this.eventBus.emit(HEALTH_EVENTS.CHANGED, payload); return this.value; }
  destroy() { this.destroyed = true; }
  #validateAmount(amount) { if (!Number.isFinite(amount) || amount < 0) throw new RangeError("amount must be a non-negative finite number"); }
  #assertAlive() { if (this.destroyed) throw new Error("HealthSystem is destroyed"); }
}
export default HealthSystem;
