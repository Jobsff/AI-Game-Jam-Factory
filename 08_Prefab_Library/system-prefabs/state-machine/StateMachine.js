import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";

export const STATE_MACHINE_EVENTS = Object.freeze({ CHANGED: "state-machine:changed", RESET: "state-machine:reset" });

export class StateMachine {
  constructor(config = {}) {
    this.states = config.states ?? {};
    if (!this.states || typeof this.states !== "object" || Array.isArray(this.states)) throw new TypeError("states must be an object");
    this.initial = config.initial ?? null;
    if (this.initial !== null && !Object.hasOwn(this.states, this.initial)) throw new Error(`unknown initial state: ${this.initial}`);
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.current = this.initial; this.enabled = true; this.destroyed = false;
    this.states[this.current]?.onEnter?.({ from: null, to: this.current, data: undefined });
  }
  change(next, data) {
    this.#assertAlive();
    if (!this.enabled) return false;
    if (!Object.hasOwn(this.states, next)) throw new Error(`unknown state: ${next}`);
    if (next === this.current) return false;
    const previous = this.current;
    this.states[previous]?.onExit?.({ from: previous, to: next, data });
    this.current = next;
    this.states[next]?.onEnter?.({ from: previous, to: next, data });
    this.eventBus.emit(STATE_MACHINE_EVENTS.CHANGED, { previous, current: next, data });
    return true;
  }
  update(delta, data) { this.#assertAlive(); if (this.enabled) this.states[this.current]?.onUpdate?.({ state: this.current, delta, data }); }
  get() { this.#assertAlive(); return this.current; }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; }
  reset() { this.#assertAlive(); const previous = this.current; this.states[previous]?.onExit?.({ from: previous, to: this.initial }); this.current = this.initial; this.enabled = true; this.states[this.current]?.onEnter?.({ from: previous, to: this.current }); this.eventBus.emit(STATE_MACHINE_EVENTS.RESET, { previous, current: this.current }); return this.current; }
  destroy() { if (this.destroyed) return; this.states[this.current]?.onExit?.({ from: this.current, to: null }); this.destroyed = true; }
  #assertAlive() { if (this.destroyed) throw new Error("StateMachine is destroyed"); }
}
export default StateMachine;
