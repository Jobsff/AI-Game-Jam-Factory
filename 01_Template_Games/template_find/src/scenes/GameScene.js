import LifecycleBag from "#factory/core/LifecycleBag.js";
import Clickable, { CLICK_EVENTS } from "#prefabs/mechanic-prefabs/click/Clickable.js";
import CountdownTimer, { TIMER_EVENTS } from "#prefabs/mechanic-prefabs/timer/CountdownTimer.js";
import ScoreSystem from "#prefabs/system-prefabs/score/ScoreSystem.js";
import StateMachine from "#prefabs/system-prefabs/state-machine/StateMachine.js";
import EventBus, { EVENTS } from "../events.js"; import { GAME_CONFIG } from "../data/gameConfig.js";

export default class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }
  create() {
    this.lifecycle = new LifecycleBag(); this.restartPending = false; this.clickables = []; this.remaining = GAME_CONFIG.duration;
    this.machine = new StateMachine({ initial: "READY", states: { READY: {}, PLAYING: {}, WIN: {}, FAIL: {} }, eventBus: EventBus });
    this.score = new ScoreSystem({ eventBus: EventBus }); this.timer = new CountdownTimer({ duration: GAME_CONFIG.duration, eventBus: EventBus });
    this.add.text(360, 180, "找出藏在星图中的五颗金星", { fontSize: "28px", color: "#dbeafe" }).setOrigin(0.5);
    const positions = [[100,300],[270,280],[510,330],[635,455],[150,530],[365,570],[570,690],[190,790],[420,900],[610,1040]];
    positions.forEach(([x, y], index) => { const target = index < GAME_CONFIG.targets; const object = this.add.image(x, y, target ? "target" : "decoy").setScale(target ? 0.72 : 0.9).setRotation(index * 0.37).setData("target", target); this.clickables.push(new Clickable(this, object, { eventBus: EventBus })); });
    this.lifecycle.add(EventBus.on(CLICK_EVENTS.CLICKED, ({ target }) => this.inspectObject(target)));
    this.lifecycle.add(EventBus.on(TIMER_EVENTS.TICKED, ({ remaining }) => { this.remaining = remaining; this.publishHud(); }));
    this.lifecycle.add(EventBus.on(TIMER_EVENTS.ENDED, () => this.finish("FAIL")));
    this.lifecycle.add(EventBus.on(EVENTS.UI_READY, () => this.publishHud()));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.scene.launch("UIScene"); this.machine.change("PLAYING"); this.timer.start(); this.publishHud();
  }
  inspectObject(object) {
    if (this.machine.get() !== "PLAYING" || !object.active) return;
    if (!object.getData("target")) { this.cameras.main.shake(110, 0.006); object.setTint(0xff6b6b); this.lifecycle.timer(this.time.delayedCall(180, () => object.active && object.clearTint())); return; }
    object.disableInteractive(); object.setTint(0xffffff); this.tweens.add({ targets: object, scale: 0, alpha: 0, duration: 180, onComplete: () => object.destroy() }); this.score.add(1);
    if (this.score.get() >= GAME_CONFIG.targets) this.finish("WIN"); else this.publishHud();
  }
  publishHud() { EventBus.emit(EVENTS.HUD, { title: GAME_CONFIG.title, status: `找到 ${this.score.get()} / ${GAME_CONFIG.targets}　剩余 ${this.remaining}s` }); }
  finish(state) { if (this.machine.get() !== "PLAYING") return; this.machine.change(state); this.timer.pause(); this.clickables.forEach((item) => item.disable()); EventBus.emit(EVENTS.RESULT, { message: state === "WIN" ? "⭐ 全部找到！" : "⌛ 时间到" }); this.armRestart(); }
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
  shutdown() { if (this.scene.isActive("UIScene")) this.scene.stop("UIScene"); this.clickables.forEach((item) => item.destroy()); this.timer?.destroy(); this.score?.destroy(); this.machine?.destroy(); this.lifecycle?.destroy(); }
}
