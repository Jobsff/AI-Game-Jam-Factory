import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";

export const TIMER_EVENTS = Object.freeze({ TICKED: "timer:ticked", ENDED: "timer:ended", STATE_CHANGED: "timer:state-changed" });

export class CountdownTimer {
  constructor(config = {}) {
    this.duration = config.duration ?? 30;
    if (!Number.isInteger(this.duration) || this.duration < 0) throw new RangeError("duration must be a non-negative integer in seconds");
    this.loop = config.loop ?? false;
    if (this.loop && this.duration === 0) throw new RangeError("loop requires a positive duration");
    this.emitTicks = config.tick ?? true;
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.scheduler = config.scheduler ?? { setInterval: globalThis.setInterval.bind(globalThis), clearInterval: globalThis.clearInterval.bind(globalThis) };
    this.remaining = this.duration;
    this.state = "idle";
    this.handle = null;
    this.enabled = true;
    this.destroyed = false;
  }

  start() {
    this.#assertAlive();
    if (!this.enabled || this.state === "running") return false;
    if (this.remaining === 0) this.remaining = this.duration;
    this.#setState("running");
    if (this.duration === 0) { this.#finish(); return true; }
    this.handle = this.scheduler.setInterval(() => this.#step(), 1000);
    return true;
  }
  #step() {
    if (this.state !== "running") return;
    this.remaining = Math.max(0, this.remaining - 1);
    if (this.emitTicks) this.eventBus.emit(TIMER_EVENTS.TICKED, { remaining: this.remaining, duration: this.duration });
    if (this.remaining === 0) this.#finish();
  }
  #finish() {
    this.#clearHandle();
    this.eventBus.emit(TIMER_EVENTS.ENDED, { duration: this.duration, loop: this.loop });
    if (this.loop && this.enabled) { this.remaining = this.duration; this.#setState("idle"); this.start(); }
    else this.#setState("ended");
  }
  pause() { this.#assertAlive(); if (this.state !== "running") return false; this.#clearHandle(); this.#setState("paused"); return true; }
  resume() { this.#assertAlive(); if (this.state !== "paused" || !this.enabled) return false; this.#setState("idle"); return this.start(); }
  reset() { this.#assertAlive(); this.#clearHandle(); this.remaining = this.duration; this.#setState("idle"); this.enabled = true; return this.remaining; }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; if (this.state === "running") this.pause(); }
  destroy() { if (this.destroyed) return; this.#clearHandle(); this.state = "destroyed"; this.destroyed = true; }
  #clearHandle() { if (this.handle !== null) { this.scheduler.clearInterval(this.handle); this.handle = null; } }
  #setState(next) { const previous = this.state; this.state = next; if (previous !== next) this.eventBus.emit(TIMER_EVENTS.STATE_CHANGED, { previous, current: next, remaining: this.remaining }); }
  #assertAlive() { if (this.destroyed) throw new Error("CountdownTimer is destroyed"); }
}
export default CountdownTimer;
