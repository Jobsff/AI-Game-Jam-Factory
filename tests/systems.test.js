import test from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../02_Game_Core/core/EventBus.js";
import { ScoreSystem, SCORE_EVENTS } from "../08_Prefab_Library/system-prefabs/score/ScoreSystem.js";
import { HealthSystem, HEALTH_EVENTS } from "../08_Prefab_Library/system-prefabs/health/HealthSystem.js";
import { StateMachine, STATE_MACHINE_EVENTS } from "../08_Prefab_Library/system-prefabs/state-machine/StateMachine.js";

test("ScoreSystem emits structured deltas and resets", () => {
  const bus = new EventBus(); const events = []; bus.on(SCORE_EVENTS.CHANGED, (value) => events.push(value));
  const score = new ScoreSystem({ initial: 5, eventBus: bus });
  assert.equal(score.add(3), 8); assert.equal(score.sub(2), 6); assert.equal(score.reset(), 5);
  assert.deepEqual(events.map((event) => event.delta), [3, -2, -1]);
  assert.throws(() => score.sub(-1), /non-negative/);
  assert.throws(() => score.add(-1), /non-negative/);
});

test("HealthSystem clamps, emits depletion once per crossing, and resets", () => {
  const bus = new EventBus(); const changes = []; const depleted = [];
  bus.on(HEALTH_EVENTS.CHANGED, (value) => changes.push(value)); bus.on(HEALTH_EVENTS.DEPLETED, (value) => depleted.push(value));
  const health = new HealthSystem({ max: 10, initial: 8, eventBus: bus });
  assert.equal(health.heal(5), 10); assert.equal(health.damage(20), 0); assert.equal(health.damage(1), 0); assert.equal(depleted.length, 1);
  assert.equal(health.reset(), 8); assert.equal(changes.at(-1).value, 8);
});

test("StateMachine runs hooks in order and rejects unknown states", () => {
  const bus = new EventBus(); const order = []; const events = [];
  bus.on(STATE_MACHINE_EVENTS.CHANGED, (value) => events.push(value));
  const machine = new StateMachine({ initial: "ready", eventBus: bus, states: {
    ready: { onEnter: () => order.push("enter-ready"), onExit: () => order.push("exit-ready") },
    play: { onEnter: () => order.push("enter-play"), onUpdate: () => order.push("update-play") }
  }});
  assert.equal(machine.change("play", { reason: "start" }), true); machine.update(16);
  assert.deepEqual(order, ["enter-ready", "exit-ready", "enter-play", "update-play"]);
  assert.deepEqual(events[0], { previous: "ready", current: "play", data: { reason: "start" } });
  assert.throws(() => machine.change("missing"), /unknown state/);
});
