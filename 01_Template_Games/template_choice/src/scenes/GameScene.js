import LifecycleBag from "#factory/core/LifecycleBag.js";
import GameState from "#factory/core/GameState.js";
import Clickable, { CLICK_EVENTS } from "#prefabs/mechanic-prefabs/click/Clickable.js";
import StateMachine from "#prefabs/system-prefabs/state-machine/StateMachine.js";
import EventBus, { EVENTS } from "../events.js"; import { GAME_CONFIG } from "../data/gameConfig.js";

export default class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }
  create() {
    this.lifecycle = new LifecycleBag(); this.restartPending = false; this.round = 0; this.buttons = []; this.clickables = [];
    this.world = new GameState({ initial: { kindness: 0, order: 0 }, eventBus: EventBus });
    this.machine = new StateMachine({ initial: "CHOOSING", states: { CHOOSING: {}, RESOLVING: {}, ENDING: {} }, eventBus: EventBus });
    this.prompt = this.add.text(360, 310, "", { fontSize: "38px", color: "#ffffff", align: "center", wordWrap: { width: 600 } }).setOrigin(0.5);
    this.worldText = this.add.text(360, 850, "", { fontSize: "27px", color: "#a7f3d0", align: "center" }).setOrigin(0.5);
    this.lifecycle.add(EventBus.on(CLICK_EVENTS.CLICKED, ({ target }) => this.resolve(target.getData("option"))));
    this.lifecycle.add(EventBus.on(EVENTS.UI_READY, () => this.publishHud()));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.scene.launch("UIScene"); this.showRound();
  }
  showRound() {
    this.clearButtons(); this.machine.get() === "RESOLVING" && this.machine.change("CHOOSING");
    const round = GAME_CONFIG.rounds[this.round]; this.prompt.setText(round.prompt);
    round.options.forEach((option, index) => { const y = 500 + index * 170; const box = this.add.rectangle(360, y, 570, 110, index ? 0xb4535a : 0x287c74).setData("option", option); const label = this.add.text(360, y, option.label, { fontSize: "31px", color: "#ffffff" }).setOrigin(0.5); this.buttons.push(box, label); this.clickables.push(new Clickable(this, box, { eventBus: EventBus })); });
    this.publishHud();
  }
  resolve(option) {
    if (this.machine.get() !== "CHOOSING" || !option) return; this.machine.change("RESOLVING");
    const snapshot = this.world.snapshot(); this.world.update({ kindness: snapshot.kindness + option.effects.kindness, order: snapshot.order + option.effects.order });
    this.round += 1; this.worldText.setText(`善意 ${this.world.get("kindness")}　秩序 ${this.world.get("order")}\n世界正在回应你的选择……`); this.clearButtons();
    const delayed = this.time.delayedCall(550, () => this.round >= GAME_CONFIG.rounds.length ? this.showEnding() : this.showRound()); this.lifecycle.timer(delayed);
  }
  showEnding() {
    this.machine.change("ENDING"); const kind = this.world.get("kindness"), order = this.world.get("order");
    const ending = kind > order ? "🌿 共生结局：世界因信任重生" : order > kind ? "🏛️ 秩序结局：世界在规则中延续" : "🌗 平衡结局：世界走上中间道路";
    this.prompt.setText(ending); EventBus.emit(EVENTS.RESULT, { message: ending }); this.armRestart();
  }
  clearButtons() { this.clickables.splice(0).forEach((item) => item.destroy()); this.buttons.splice(0).forEach((item) => item.destroy()); }
  publishHud() { EventBus.emit(EVENTS.HUD, { title: GAME_CONFIG.title, status: `第 ${Math.min(this.round + 1, 3)} / 3 轮　善意 ${this.world.get("kindness")}　秩序 ${this.world.get("order")}` }); }
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
  shutdown() { if (this.scene.isActive("UIScene")) this.scene.stop("UIScene"); this.clearButtons(); this.world?.destroy(); this.machine?.destroy(); this.lifecycle?.destroy(); }
}
