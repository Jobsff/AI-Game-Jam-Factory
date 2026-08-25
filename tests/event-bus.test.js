import test from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../02_Game_Core/core/EventBus.js";

test("EventBus supports subscription lifecycle and snapshot emission", () => {
  const bus = new EventBus(); const calls = [];
  const unsubscribe = bus.on("event", (payload) => calls.push(["on", payload]));
  bus.once("event", (payload) => calls.push(["once", payload]));
  assert.equal(bus.listenerCount("event"), 2);
  assert.equal(bus.emit("event", 1), 2);
  assert.equal(bus.emit("event", 2), 1);
  assert.equal(unsubscribe(), true);
  assert.equal(bus.listenerCount("event"), 0);
  assert.deepEqual(calls, [["on", 1], ["once", 1], ["on", 2]]);
});

test("EventBus clear is scoped or global and validates input", () => {
  const bus = new EventBus(); const listener = () => {};
  bus.on("a", listener); bus.on("b", listener);
  assert.equal(bus.clear("a"), 1); assert.equal(bus.listenerCount("b"), 1); assert.equal(bus.clear(), 1);
  assert.throws(() => bus.on("", listener), /eventName/);
});
