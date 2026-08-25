import LifecycleBag from "#factory/core/LifecycleBag.js";
import Clickable, { CLICK_EVENTS } from "#prefabs/mechanic-prefabs/click/Clickable.js";
import Merger from "#prefabs/mechanic-prefabs/merge/Merge.js";
import ScoreSystem from "#prefabs/system-prefabs/score/ScoreSystem.js";
import StateMachine from "#prefabs/system-prefabs/state-machine/StateMachine.js";
import EventBus, { EVENTS } from "../events.js";
import { GAME_CONFIG } from "../data/gameConfig.js";

export default class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }
  create() {
    this.lifecycle = new LifecycleBag(); this.restartPending = false; this.clickables = []; this.selected = null;
    this.machine = new StateMachine({ initial: "READY", states: { READY: {}, PLAYING: {}, WIN: {}, FAIL: {} }, eventBus: EventBus });
    this.score = new ScoreSystem({ eventBus: EventBus });
    this.merger = new Merger({ rules: { "a+a": "creation-a", "b+b": "creation-b" }, eventBus: EventBus, createResult: (key) => key });
    this.add.text(360, 190, "选择两个同类碎片", { fontSize: "28px", color: "#dbeafe" }).setOrigin(0.5);
    for (let index = 0; index < 12; index += 1) {
      const type = GAME_CONFIG.fragmentTypes[index % 2];
      const x = 120 + (index % GAME_CONFIG.columns) * 160;
      const y = 330 + Math.floor(index / GAME_CONFIG.columns) * 190;
      const item = this.add.image(x, y, `fragment-${type}`).setScale(1.25).setData("mergeKey", type);
      this.clickables.push(new Clickable(this, item, { eventBus: EventBus, cooldown: 100 }));
    }
    const onClick = ({ target }) => this.choose(target);
    this.lifecycle.add(EventBus.on(CLICK_EVENTS.CLICKED, onClick));
    this.lifecycle.add(EventBus.on(EVENTS.UI_READY, () => this.publishHud()));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.scene.launch("UIScene"); this.machine.change("PLAYING"); this.publishHud();
  }
  choose(target) {
    if (this.machine.get() !== "PLAYING" || !target.active) return;
    if (!this.selected) { this.selected = target; target.setTint(0xffffff); target.setScale(1.45); return; }
    if (target === this.selected) { target.clearTint().setScale(1.25); this.selected = null; return; }
    const first = this.selected; this.selected = null;
    const outcome = this.merger.merge(first.getData("mergeKey"), target.getData("mergeKey"));
    first.clearTint().setScale(1.25);
    if (!outcome.ok) { this.cameras.main.shake(100, 0.004); return; }
    const resultPosition = { x: (first.x + target.x) / 2, y: (first.y + target.y) / 2 };
    first.destroy(); target.destroy(); this.score.add(1);
    this.add.image(resultPosition.x, resultPosition.y, "target").setScale(1.15);
    if (this.score.get() >= GAME_CONFIG.creationsToWin) this.finish(); else this.publishHud();
  }
  publishHud() { EventBus.emit(EVENTS.HUD, { title: GAME_CONFIG.title, status: `创造 ${this.score.get()} / ${GAME_CONFIG.creationsToWin}` }); }
  finish() { this.machine.change("WIN"); this.clickables.forEach((item) => item.disable()); EventBus.emit(EVENTS.RESULT, { message: "✨ 三次创造完成！" }); this.armRestart(); }
  armRestart() {
    if (this.restartPending) return;
    this.restartPending = true;
    const delayed = this.time.delayedCall(200, () => {
      const restart = () => this.scene.restart();
      this.input.once("pointerdown", restart);
      this.lifecycle.add(() => this.input.off("pointerdown", restart));
    });
    this.lifecycle.timer(delayed);
  }
  shutdown() { if (this.scene.isActive("UIScene")) this.scene.stop("UIScene"); this.clickables.forEach((item) => item.destroy()); this.merger?.destroy(); this.score?.destroy(); this.machine?.destroy(); this.lifecycle?.destroy(); }
}
