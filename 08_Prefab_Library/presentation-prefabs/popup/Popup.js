import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";
import LifecycleBag from "../../../02_Game_Core/core/LifecycleBag.js";

export const POPUP_EVENTS = Object.freeze({ OPENED: "popup:opened", CLOSED: "popup:closed", ACTION: "popup:action" });

export class Popup {
  constructor(scene, config = {}) {
    if (!scene?.add) throw new TypeError("scene.add is required");
    this.scene = scene; this.eventBus = config.eventBus ?? sharedEventBus; this.id = config.id ?? "popup";
    this.lifecycle = new LifecycleBag(); this.isOpen = false; this.enabled = true;
    const camera = scene.cameras?.main ?? { centerX: 0, centerY: 0, width: 800, height: 600 };
    this.container = scene.add.container(camera.centerX, camera.centerY).setVisible(false);
    this.mask = scene.add.rectangle(0, 0, camera.width, camera.height, 0x000000, 0.6).setInteractive?.() ?? null;
    this.panel = scene.add.rectangle(0, 0, config.width ?? 520, config.height ?? 320, config.bgColor ?? 0xffffff);
    this.title = scene.add.text(0, -100, config.title ?? "", { color: "#111111", fontSize: "30px" }).setOrigin?.(0.5) ?? null;
    this.content = scene.add.text(0, -30, config.content ?? "", { color: "#222222", fontSize: "22px", wordWrap: { width: (config.width ?? 520) - 60 } }).setOrigin?.(0.5) ?? null;
    this.container.add([this.mask, this.panel, this.title, this.content]);
    const buttonDefinitions = config.buttons ?? [];
    if (!Array.isArray(buttonDefinitions)) throw new TypeError("buttons must be an array");
    this.buttons = buttonDefinitions.map((button, index) => this.#createButton(button, index, buttonDefinitions.length));
    if (config.maskClose ?? true) this.lifecycle.listen(this.mask, "pointerdown", () => this.close());
  }
  #createButton(definition, index, total) {
    if (!definition || typeof definition !== "object") throw new TypeError("button definition must be an object");
    const button = this.scene.add.text((index - (total - 1) / 2) * 120, 100, definition.label ?? String(definition.id ?? index), { color: "#ffffff", backgroundColor: "#3d5afe", padding: { x: 16, y: 10 } }).setOrigin?.(0.5).setInteractive?.() ?? null;
    this.container.add(button);
    this.lifecycle.listen(button, "pointerdown", (pointer) => this.eventBus.emit(POPUP_EVENTS.ACTION, { id: this.id, action: definition.id ?? index, pointer, popup: this }));
    return button;
  }
  open() { this.#assertAlive(); if (!this.enabled || this.isOpen) return false; this.isOpen = true; this.container.setVisible(true); this.scene.tweens?.add?.({ targets: this.panel, scale: { from: 0.8, to: 1 }, alpha: { from: 0, to: 1 }, duration: 180 }); this.eventBus.emit(POPUP_EVENTS.OPENED, { id: this.id, popup: this }); return true; }
  close() { this.#assertAlive(); if (!this.isOpen) return false; this.isOpen = false; this.scene.tweens?.killTweensOf?.(this.panel); this.container.setVisible(false); this.eventBus.emit(POPUP_EVENTS.CLOSED, { id: this.id, popup: this }); return true; }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; if (this.isOpen) this.close(); }
  reset() { this.#assertAlive(); if (this.isOpen) this.close(); this.enabled = true; }
  destroy() { if (this.lifecycle.destroyed) return; this.scene.tweens?.killTweensOf?.(this.panel); this.lifecycle.destroy(); this.container.destroy?.(true); }
  #assertAlive() { if (this.lifecycle.destroyed) throw new Error("Popup is destroyed"); }
}
export default Popup;
