import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";
import LifecycleBag from "../../../02_Game_Core/core/LifecycleBag.js";

export const BUTTON_EVENTS = Object.freeze({ CLICKED: "button:clicked" });

export class UIButton {
  constructor(scene, config = {}) {
    if (!scene?.add) throw new TypeError("scene.add is required");
    this.scene = scene;
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.id = config.id ?? "button";
    this.enabled = true;
    this.lifecycle = new LifecycleBag();
    const x = config.x ?? 0, y = config.y ?? 0, width = config.width ?? 240, height = config.height ?? 80;
    this.container = scene.add.container(x, y);
    this.background = scene.add.rectangle(0, 0, width, height, config.bgColor ?? 0x3d5afe).setInteractive?.() ?? null;
    this.label = scene.add.text(0, 0, config.label ?? "", { fontSize: "30px", color: "#ffffff", ...(config.textStyle ?? {}) }).setOrigin?.(0.5) ?? null;
    this.container.add([this.background, this.label]);
    this.handleClick = (pointer) => {
      if (!this.enabled) return;
      scene.tweens?.add?.({ targets: this.container, scale: 0.92, duration: 80, yoyo: true });
      this.eventBus.emit(BUTTON_EVENTS.CLICKED, { id: this.id, button: this, pointer });
    };
    this.lifecycle.listen(this.background, "pointerdown", this.handleClick);
  }
  setText(text) { this.#assertAlive(); this.label.setText(text); return this; }
  enable() { this.#assertAlive(); this.enabled = true; this.background.setInteractive?.(); return this; }
  disable() { this.#assertAlive(); this.enabled = false; this.background.disableInteractive?.(); return this; }
  reset() { this.#assertAlive(); return this.enable(); }
  destroy() { if (this.lifecycle.destroyed) return; this.lifecycle.destroy(); this.container.destroy?.(true); }
  #assertAlive() { if (this.lifecycle.destroyed) throw new Error("UIButton is destroyed"); }
}
export default UIButton;
