import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";

export const MERGE_EVENTS = Object.freeze({ SUCCEEDED: "merge:succeeded", FAILED: "merge:failed" });
const KEY_FIELDS = ["mergeKey", "id", "key", "itemId", "type"];

export class Merger {
  constructor(config = {}) {
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.rules = config.rules ?? new Map();
    this.createResult = config.createResult ?? ((result, inputs) => ({ key: result, inputs }));
    if (!(this.rules instanceof Map) && (typeof this.rules !== "object" || this.rules === null || Array.isArray(this.rules))) throw new TypeError("rules must be a Map or object");
    if (typeof this.createResult !== "function") throw new TypeError("createResult must be a function");
    this.enabled = true;
    this.destroyed = false;
  }

  merge(itemA, itemB) {
    this.#assertAlive();
    const keys = [this.#keyOf(itemA), this.#keyOf(itemB)];
    if (!this.enabled) return this.#fail("DISABLED", keys, [itemA, itemB]);
    if (keys.some((key) => key === undefined)) return this.#fail("INVALID_ITEM", keys, [itemA, itemB]);
    const match = this.#find(keys[0], keys[1]);
    if (!match.found) return this.#fail("NO_MATCHING_RULE", keys, [itemA, itemB]);
    const result = this.createResult(match.result, [itemA, itemB]);
    if (result === undefined) throw new Error("createResult must return a result");
    const payload = { ok: true, keys, items: [itemA, itemB], rule: match.rule, result };
    this.eventBus.emit(MERGE_EVENTS.SUCCEEDED, payload);
    return payload;
  }

  #keyOf(item) {
    if (item === null || item === undefined) return undefined;
    if (typeof item !== "object") return item;
    for (const field of KEY_FIELDS) if (item[field] !== undefined && item[field] !== null) return item[field];
    return item.texture?.key;
  }

  #find(a, b) {
    const entries = this.rules instanceof Map ? [...this.rules] : Object.entries(this.rules);
    for (const [rule, result] of entries) {
      if (Array.isArray(rule) && rule.length === 2 && ((Object.is(rule[0], a) && Object.is(rule[1], b)) || (Object.is(rule[0], b) && Object.is(rule[1], a)))) return { found: true, rule, result };
      const text = String(rule);
      const candidates = [`${a}+${b}`, `${b}+${a}`, `${a}|${b}`, `${b}|${a}`, JSON.stringify([a, b]), JSON.stringify([b, a])];
      if (candidates.includes(text) || (Object.is(a, b) && Object.is(rule, a))) return { found: true, rule, result };
    }
    return { found: false };
  }

  #fail(reason, keys, items) {
    const payload = { ok: false, reason, keys, items, result: null };
    this.eventBus.emit(MERGE_EVENTS.FAILED, payload);
    return payload;
  }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; }
  reset() { this.#assertAlive(); this.enabled = true; }
  destroy() { this.destroyed = true; this.rules = new Map(); }
  #assertAlive() { if (this.destroyed) throw new Error("Merger is destroyed"); }
}

export default Merger;
