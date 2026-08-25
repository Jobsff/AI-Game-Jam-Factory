import LifecycleBag from "#factory/core/LifecycleBag.js";
import InputManager from "#factory/core/InputManager.js";
import CountdownTimer, { TIMER_EVENTS } from "#prefabs/mechanic-prefabs/timer/CountdownTimer.js";
import Spawner from "#prefabs/mechanic-prefabs/spawn/Spawner.js";
import StateMachine from "#prefabs/system-prefabs/state-machine/StateMachine.js";
import EventBus, { EVENTS } from "../events.js"; import { GAME_CONFIG } from "../data/gameConfig.js";

export default class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }
  create() {
    this.lifecycle = new LifecycleBag(); this.restartPending = false; this.obstacles = new Set(); this.remaining = GAME_CONFIG.duration; this.pointerX = null;
    this.machine = new StateMachine({ initial: "READY", states: { READY: {}, PLAYING: {}, WIN: {}, FAIL: {} }, eventBus: EventBus });
    this.controls = new InputManager(this); this.controls.addKey("left", Phaser.Input.Keyboard.KeyCodes.LEFT); this.controls.addKey("right", Phaser.Input.Keyboard.KeyCodes.RIGHT); this.controls.addKey("a", Phaser.Input.Keyboard.KeyCodes.A); this.controls.addKey("d", Phaser.Input.Keyboard.KeyCodes.D);
    this.player = this.add.image(360, 1110, "player").setScale(1.15); this.add.text(360, 190, "移动躲开坠落障碍", { fontSize: "28px", color: "#dbeafe" }).setOrigin(0.5);
    const onPointer = (pointer) => { this.pointerX = Phaser.Math.Clamp(pointer.x, 50, 670); };
    this.lifecycle.listen(this.input, "pointerdown", onPointer); this.lifecycle.listen(this.input, "pointermove", onPointer);
    this.timer = new CountdownTimer({ duration: GAME_CONFIG.duration, eventBus: EventBus });
    this.spawner = new Spawner({ interval: GAME_CONFIG.spawnEveryMs, eventBus: EventBus, factory: () => this.spawnObstacle() });
    this.lifecycle.add(EventBus.on(TIMER_EVENTS.TICKED, ({ remaining }) => { this.remaining = remaining; this.publishHud(); }));
    this.lifecycle.add(EventBus.on(TIMER_EVENTS.ENDED, () => this.finish("WIN")));
    this.lifecycle.add(EventBus.on(EVENTS.UI_READY, () => this.publishHud()));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.scene.launch("UIScene"); this.machine.change("PLAYING"); this.spawner.start(); this.timer.start(); this.publishHud();
  }
  spawnObstacle() { const obstacle = this.add.image(Phaser.Math.Between(55, 665), 175, "obstacle").setScale(Phaser.Math.FloatBetween(0.75, 1.25)); this.obstacles.add(obstacle); return obstacle; }
  update(_time, delta) {
    if (this.machine?.get() !== "PLAYING") return; const seconds = delta / 1000;
    let direction = 0; if (this.controls.isDown("left") || this.controls.isDown("a")) direction -= 1; if (this.controls.isDown("right") || this.controls.isDown("d")) direction += 1;
    if (direction) { this.player.x = Phaser.Math.Clamp(this.player.x + direction * GAME_CONFIG.playerSpeed * seconds, 50, 670); this.pointerX = null; }
    else if (this.pointerX !== null) this.player.x = Phaser.Math.Linear(this.player.x, this.pointerX, Math.min(1, seconds * 9));
    for (const obstacle of [...this.obstacles]) { obstacle.y += GAME_CONFIG.obstacleSpeed * seconds; if (Phaser.Geom.Intersects.RectangleToRectangle(obstacle.getBounds(), this.player.getBounds())) { this.finish("FAIL"); return; } if (obstacle.y > 1330) { this.obstacles.delete(obstacle); obstacle.destroy(); } }
  }
  publishHud() { EventBus.emit(EVENTS.HUD, { title: GAME_CONFIG.title, status: `坚持 ${this.remaining}s　← → / A D / 触摸` }); }
  finish(state) { if (this.machine.get() !== "PLAYING") return; this.machine.change(state); this.spawner.stop(); this.timer.pause(); this.controls.disable(); EventBus.emit(EVENTS.RESULT, { message: state === "WIN" ? "🚀 坚持成功！" : "💥 撞上障碍" }); this.armRestart(); }
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
  shutdown() { if (this.scene.isActive("UIScene")) this.scene.stop("UIScene"); this.spawner?.destroy(); this.timer?.destroy(); this.controls?.destroy(); this.machine?.destroy(); this.lifecycle?.destroy(); this.obstacles?.forEach((item) => item.destroy()); this.obstacles?.clear(); }
}
