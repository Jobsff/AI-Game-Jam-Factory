import LifecycleBag from "#factory/core/LifecycleBag.js";
import Clickable, { CLICK_EVENTS } from "#prefabs/mechanic-prefabs/click/Clickable.js";
import CountdownTimer, { TIMER_EVENTS } from "#prefabs/mechanic-prefabs/timer/CountdownTimer.js";
import Spawner from "#prefabs/mechanic-prefabs/spawn/Spawner.js";
import HealthSystem, { HEALTH_EVENTS } from "#prefabs/system-prefabs/health/HealthSystem.js";
import StateMachine from "#prefabs/system-prefabs/state-machine/StateMachine.js";
import EventBus, { EVENTS } from "../events.js"; import { GAME_CONFIG } from "../data/gameConfig.js";

export default class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }
  create() {
    this.lifecycle = new LifecycleBag(); this.restartPending = false; this.enemies = new Set(); this.clickables = new Map(); this.remaining = GAME_CONFIG.duration;
    this.machine = new StateMachine({ initial: "READY", states: { READY: {}, PLAYING: {}, WIN: {}, FAIL: {} }, eventBus: EventBus });
    this.health = new HealthSystem({ max: GAME_CONFIG.health, eventBus: EventBus });
    this.timer = new CountdownTimer({ duration: GAME_CONFIG.duration, eventBus: EventBus });
    this.add.image(360, 650, "core").setScale(2.1); this.add.circle(360, 650, 125, 0x5eead4, 0.12);
    this.spawner = new Spawner({ interval: GAME_CONFIG.spawnEveryMs, eventBus: EventBus, factory: () => this.spawnEnemy() });
    this.lifecycle.add(EventBus.on(CLICK_EVENTS.CLICKED, ({ target }) => this.clearEnemy(target)));
    this.lifecycle.add(EventBus.on(TIMER_EVENTS.TICKED, ({ remaining }) => { this.remaining = remaining; this.publishHud(); }));
    this.lifecycle.add(EventBus.on(TIMER_EVENTS.ENDED, () => this.finish("WIN")));
    this.lifecycle.add(EventBus.on(HEALTH_EVENTS.CHANGED, () => this.publishHud()));
    this.lifecycle.add(EventBus.on(HEALTH_EVENTS.DEPLETED, () => this.finish("FAIL")));
    this.lifecycle.add(EventBus.on(EVENTS.UI_READY, () => this.publishHud()));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.scene.launch("UIScene"); this.machine.change("PLAYING"); this.spawner.spawnOne(); this.spawner.start(); this.timer.start(); this.publishHud();
  }
  spawnEnemy() {
    const side = Phaser.Math.Between(0, 3); const points = [[Phaser.Math.Between(30,690),180],[690,Phaser.Math.Between(180,1160)],[Phaser.Math.Between(30,690),1160],[30,Phaser.Math.Between(180,1160)]];
    const enemy = this.add.image(...points[side], "enemy").setScale(0.9); this.enemies.add(enemy); this.clickables.set(enemy, new Clickable(this, enemy, { eventBus: EventBus })); return enemy;
  }
  clearEnemy(enemy) { if (this.machine.get() !== "PLAYING" || !this.enemies.has(enemy)) return; this.removeEnemy(enemy); }
  removeEnemy(enemy) { this.clickables.get(enemy)?.destroy(); this.clickables.delete(enemy); this.enemies.delete(enemy); enemy.destroy(); }
  update(_time, delta) {
    if (this.machine?.get() !== "PLAYING") return;
    for (const enemy of [...this.enemies]) { const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, 360, 650); const distance = GAME_CONFIG.enemySpeed * delta / 1000; enemy.x += Math.cos(angle) * distance; enemy.y += Math.sin(angle) * distance; if (Phaser.Math.Distance.Between(enemy.x, enemy.y, 360, 650) < 125) { this.removeEnemy(enemy); this.health.damage(1); } }
  }
  publishHud() { EventBus.emit(EVENTS.HUD, { title: GAME_CONFIG.title, status: `核心生命 ${this.health.get()} / ${GAME_CONFIG.health}　剩余 ${this.remaining}s` }); }
  finish(state) { if (this.machine.get() !== "PLAYING") return; this.machine.change(state); this.spawner.stop(); this.timer.pause(); for (const click of this.clickables.values()) click.disable(); EventBus.emit(EVENTS.RESULT, { message: state === "WIN" ? "🛡️ 守护成功！" : "💥 核心失守" }); this.armRestart(); }
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
  shutdown() { if (this.scene.isActive("UIScene")) this.scene.stop("UIScene"); for (const click of this.clickables.values()) click.destroy(); this.clickables.clear(); this.spawner?.destroy(); this.timer?.destroy(); this.health?.destroy(); this.machine?.destroy(); this.lifecycle?.destroy(); }
}
