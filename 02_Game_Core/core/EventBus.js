/** 无 Phaser 依赖的同步事件总线。 */
export class EventBus {
  #listeners = new Map();

  on(eventName, listener) {
    this.#assertEventName(eventName);
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    const listeners = this.#listeners.get(eventName) ?? new Set();
    listeners.add(listener);
    this.#listeners.set(eventName, listeners);
    return () => this.off(eventName, listener);
  }

  once(eventName, listener) {
    this.#assertEventName(eventName);
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    let unsubscribe;
    const wrapper = (...args) => {
      unsubscribe();
      return listener(...args);
    };
    unsubscribe = this.on(eventName, wrapper);
    return unsubscribe;
  }

  off(eventName, listener) {
    this.#assertEventName(eventName);
    if (typeof listener !== "function") throw new TypeError("listener must be a function");
    const listeners = this.#listeners.get(eventName);
    if (!listeners) return false;
    const removed = listeners.delete(listener);
    if (listeners.size === 0) this.#listeners.delete(eventName);
    return removed;
  }

  emit(eventName, ...args) {
    this.#assertEventName(eventName);
    const listeners = this.#listeners.get(eventName);
    if (!listeners) return 0;
    const snapshot = [...listeners];
    for (const listener of snapshot) listener(...args);
    return snapshot.length;
  }

  clear(eventName) {
    if (eventName === undefined) {
      const count = [...this.#listeners.values()].reduce((sum, set) => sum + set.size, 0);
      this.#listeners.clear();
      return count;
    }
    this.#assertEventName(eventName);
    const count = this.listenerCount(eventName);
    this.#listeners.delete(eventName);
    return count;
  }

  listenerCount(eventName) {
    this.#assertEventName(eventName);
    return this.#listeners.get(eventName)?.size ?? 0;
  }

  #assertEventName(eventName) {
    if (typeof eventName !== "string" || eventName.length === 0) {
      throw new TypeError("eventName must be a non-empty string");
    }
  }
}

export const sharedEventBus = new EventBus();
export default sharedEventBus;
