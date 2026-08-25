import test from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "../02_Game_Core/core/EventBus.js";
import { Clickable, CLICK_EVENTS } from "../08_Prefab_Library/mechanic-prefabs/click/Clickable.js";
import { Draggable, DRAG_EVENTS } from "../08_Prefab_Library/mechanic-prefabs/drag/Draggable.js";
import { MockEmitter } from "./helpers.js";

test("Clickable enforces cooldown and removes its listener on destroy", () => {
  const target = new MockEmitter(); target.setInteractive = () => target; target.disableInteractive = () => target;
  const bus = new EventBus(); const events = []; let now = 100;
  bus.on(CLICK_EVENTS.CLICKED, (value) => events.push(value));
  const clickable = new Clickable({ input: {} }, target, { cooldown: 50, now: () => now, eventBus: bus });
  target.emit("pointerdown", { id: 1 }); now = 120; target.emit("pointerdown", { id: 2 }); now = 151; target.emit("pointerdown", { id: 3 });
  assert.equal(events.length, 2); assert.equal(target.listenerCount("pointerdown"), 1);
  clickable.destroy(); assert.equal(target.listenerCount("pointerdown"), 0); target.emit("pointerdown", {}); assert.equal(events.length, 2);
});

test("Draggable clamps coordinates, emits lifecycle, and detaches scene listeners", () => {
  const input = new MockEmitter(); input.setDraggable = () => {};
  const target = { x: 1, y: 2, setInteractive() {}, disableInteractive() {}, setPosition(x, y) { this.x = x; this.y = y; } };
  const bus = new EventBus(); const order = [];
  bus.on(DRAG_EVENTS.STARTED, () => order.push("start")); bus.on(DRAG_EVENTS.MOVED, () => order.push("move")); bus.on(DRAG_EVENTS.ENDED, () => order.push("end"));
  const draggable = new Draggable({ input }, target, { eventBus: bus, bounds: { x: 0, y: 0, width: 10, height: 20 } });
  input.emit("dragstart", {}, target); input.emit("drag", {}, target, 30, -4); input.emit("dragend", {}, target);
  assert.deepEqual([target.x, target.y], [10, 0]); assert.deepEqual(order, ["start", "move", "end"]);
  draggable.destroy(); assert.equal(input.listenerCount("drag"), 0); input.emit("drag", {}, target, 5, 5); assert.deepEqual([target.x, target.y], [10, 0]);
});

test("interaction prefabs preserve pre-existing interactivity and reset plain objects", () => {
  const clickTarget = new MockEmitter();
  clickTarget.input = { enabled: true };
  let clickSetInteractive = 0; let clickDisabled = 0;
  clickTarget.setInteractive = () => { clickSetInteractive++; return clickTarget; };
  clickTarget.disableInteractive = () => { clickDisabled++; return clickTarget; };
  const clickable = new Clickable({ input: {} }, clickTarget);
  clickable.destroy();
  assert.equal(clickSetInteractive, 0);
  assert.equal(clickDisabled, 0);

  const input = new MockEmitter(); input.setDraggable = () => {};
  const dragTarget = { x: 2, y: 3, input: { enabled: true }, disableInteractive() { throw new Error("must not disable existing input"); } };
  const draggable = new Draggable({ input }, dragTarget, { bounds: { x: 0, y: 0, width: 10, height: 10 } });
  input.emit("drag", {}, dragTarget, 9, 8);
  assert.deepEqual([dragTarget.x, dragTarget.y], [9, 8]);
  draggable.reset();
  assert.deepEqual([dragTarget.x, dragTarget.y], [2, 3]);
  draggable.destroy();

  assert.throws(
    () => new Draggable({ input }, { x: 0, y: 0 }, { bounds: { x: 0, y: 0, width: -1, height: 1 } }),
    /non-negative/,
  );
});
