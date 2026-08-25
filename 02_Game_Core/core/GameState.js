import sharedEventBus from "./EventBus.js";

export const GAME_STATE_EVENTS = Object.freeze({ CHANGED: "game-state:changed", RESET: "game-state:reset" });

/** 小型状态容器；每个游戏显式创建实例，避免隐式全局可变状态。 */
export class GameState {
  constructor(config = {}) {
    const { initial = {}, eventBus = sharedEventBus } = config;
    if (!initial || typeof initial !== "object" || Array.isArray(initial)) throw new TypeError("initial must be an object");
    this.eventBus = eventBus;
    this.initial = structuredClone(initial);
    this.value = structuredClone(initial);
    this.destroyed = false;
  }

  get(key) { this.#assertAlive(); return this.value[key]; }
  snapshot() { this.#assertAlive(); return structuredClone(this.value); }

  set(key, value) {
    this.#assertAlive();
    if (typeof key !== "string" || !key) throw new TypeError("key must be a non-empty string");
    const previous = this.value[key];
    this.value[key] = value;
    this.eventBus.emit(GAME_STATE_EVENTS.CHANGED, { key, value, previous, state: this.snapshot() });
    return value;
  }

  update(patch) {
    this.#assertAlive();
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) throw new TypeError("patch must be an object");
    for (const [key, value] of Object.entries(patch)) this.set(key, value);
    return this.snapshot();
  }

  reset() {
    this.#assertAlive();
    this.value = structuredClone(this.initial);
    const state = this.snapshot();
    this.eventBus.emit(GAME_STATE_EVENTS.RESET, { state });
    return state;
  }

  destroy() { this.destroyed = true; this.value = Object.create(null); }
  #assertAlive() { if (this.destroyed) throw new Error("GameState is destroyed"); }
}

export default GameState;
