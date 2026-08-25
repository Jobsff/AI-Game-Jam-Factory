/** 集中登记清理函数，确保 Scene 重启时释放监听与计时器。 */
export class LifecycleBag {
  #cleanups = new Set();
  #destroyed = false;

  add(cleanup) {
    if (typeof cleanup !== "function") throw new TypeError("cleanup must be a function");
    if (this.#destroyed) throw new Error("LifecycleBag is destroyed");
    this.#cleanups.add(cleanup);
    return cleanup;
  }

  listen(emitter, eventName, listener, context) {
    if (!emitter || typeof emitter.on !== "function" || typeof emitter.off !== "function") {
      throw new TypeError("emitter must provide on and off");
    }
    emitter.on(eventName, listener, context);
    this.add(() => emitter.off(eventName, listener, context));
    return listener;
  }

  timer(timer, cancel = (value) => value?.remove?.()) {
    if (typeof cancel !== "function") throw new TypeError("cancel must be a function");
    this.add(() => cancel(timer));
    return timer;
  }

  clear() {
    const cleanups = [...this.#cleanups].reverse();
    this.#cleanups.clear();
    const errors = [];
    for (const cleanup of cleanups) {
      try { cleanup(); } catch (error) { errors.push(error); }
    }
    if (errors.length) throw new AggregateError(errors, "Lifecycle cleanup failed");
  }

  destroy() {
    if (this.#destroyed) return;
    this.clear();
    this.#destroyed = true;
  }

  get destroyed() { return this.#destroyed; }
  get size() { return this.#cleanups.size; }
}

export default LifecycleBag;
