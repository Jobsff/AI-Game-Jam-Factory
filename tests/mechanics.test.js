import test from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../02_Game_Core/core/EventBus.js";
import { Merger, MERGE_EVENTS } from "../08_Prefab_Library/mechanic-prefabs/merge/Merge.js";
import { CountdownTimer, TIMER_EVENTS } from "../08_Prefab_Library/mechanic-prefabs/timer/CountdownTimer.js";
import { Spawner, SPAWN_EVENTS } from "../08_Prefab_Library/mechanic-prefabs/spawn/Spawner.js";
import { createScheduler } from "./helpers.js";

test("Merger is configurable, order independent, and emits structured outcomes", () => {
  const bus = new EventBus(); const success = []; const failure = [];
  bus.on(MERGE_EVENTS.SUCCEEDED, (value) => success.push(value)); bus.on(MERGE_EVENTS.FAILED, (value) => failure.push(value));
  const merger = new Merger({ eventBus: bus, rules: new Map([["seed+water", "sprout"]]) });
  assert.equal(merger.merge({ key: "water" }, { key: "seed" }).result.key, "sprout");
  assert.equal(success[0].ok, true);
  const result = merger.merge("rock", "water");
  assert.deepEqual({ ok: result.ok, reason: result.reason, result: result.result }, { ok: false, reason: "NO_MATCHING_RULE", result: null });
  assert.equal(failure.length, 1);
});

test("CountdownTimer supports pause, resume, end, reset and destroy cleanup", () => {
  const scheduler = createScheduler(); const bus = new EventBus(); const ticks = []; let ended = 0;
  bus.on(TIMER_EVENTS.TICKED, (value) => ticks.push(value.remaining)); bus.on(TIMER_EVENTS.ENDED, () => ended++);
  const timer = new CountdownTimer({ duration: 2, scheduler, eventBus: bus });
  timer.start(); scheduler.tick(); assert.equal(timer.remaining, 1); timer.pause(); assert.equal(scheduler.size, 0);
  timer.resume(); scheduler.tick(); assert.equal(ended, 1); assert.deepEqual(ticks, [1, 0]);
  timer.reset(); assert.equal(timer.remaining, 2); timer.start(); timer.destroy(); assert.equal(scheduler.size, 0);
  assert.throws(() => new CountdownTimer({ duration: 0, loop: true }), /positive duration/);
});

test("Spawner emits factory results within bounds and honors max", () => {
  const scheduler = createScheduler(); const bus = new EventBus(); const events = [];
  bus.on(SPAWN_EVENTS.SPAWNED, (value) => events.push(value));
  const spawner = new Spawner({ factory: ({ index }) => ({ id: index }), interval: 10, max: 2, bounds: { x: 10, y: 20, width: 30, height: 40 }, random: () => 0.5, scheduler, eventBus: bus });
  spawner.start(); scheduler.tick(); scheduler.tick();
  assert.equal(events.length, 2); assert.deepEqual(events[0].position, { x: 25, y: 40 }); assert.equal(scheduler.size, 0); assert.equal(spawner.spawnOne(), null);
  spawner.reset(); assert.equal(spawner.count, 0); spawner.destroy();
  assert.throws(() => new Spawner({ factory: () => ({}), bounds: { x: 0, y: 0, width: -1, height: 1 } }), /non-negative/);
});
