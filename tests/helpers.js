export class MockEmitter {
  constructor() { this.listeners = new Map(); }
  on(name, listener, context) { const list = this.listeners.get(name) ?? []; list.push({ listener, context }); this.listeners.set(name, list); return this; }
  off(name, listener, context) { const list = this.listeners.get(name) ?? []; this.listeners.set(name, list.filter((entry) => entry.listener !== listener || entry.context !== context)); return this; }
  emit(name, ...args) { for (const { listener, context } of [...(this.listeners.get(name) ?? [])]) listener.apply(context, args); }
  listenerCount(name) { return this.listeners.get(name)?.length ?? 0; }
}

export function createScheduler() {
  let nextId = 1;
  const callbacks = new Map();
  return {
    setInterval(callback) { const id = nextId++; callbacks.set(id, callback); return id; },
    clearInterval(id) { callbacks.delete(id); },
    tick() { for (const callback of [...callbacks.values()]) callback(); },
    get size() { return callbacks.size; }
  };
}
