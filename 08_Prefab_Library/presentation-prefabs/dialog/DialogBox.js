import sharedEventBus from "../../../02_Game_Core/core/EventBus.js";
import LifecycleBag from "../../../02_Game_Core/core/LifecycleBag.js";

export const DIALOG_EVENTS = Object.freeze({ LINE_STARTED: "dialog:line-started", LINE_COMPLETED: "dialog:line-completed", COMPLETED: "dialog:completed" });

export class DialogBox {
  constructor(scene, config = {}) {
    if (!scene?.add || !scene?.time) throw new TypeError("scene.add and scene.time are required");
    this.scene = scene; this.eventBus = config.eventBus ?? sharedEventBus;
    this.lines = config.lines ?? [];
    if (!Array.isArray(this.lines) || this.lines.some((line) => typeof line?.text !== "string")) throw new TypeError("lines must contain objects with text");
    this.typeSpeed = config.typeSpeed ?? 30;
    if (!Number.isFinite(this.typeSpeed) || this.typeSpeed <= 0) throw new RangeError("typeSpeed must be positive");
    this.lifecycle = new LifecycleBag(); this.enabled = true; this.playing = false; this.index = -1; this.character = 0; this.timer = null;
    const camera = scene.cameras?.main ?? { centerX: 0, height: 600, width: 800 };
    this.container = scene.add.container(camera.centerX, camera.height - 120).setVisible(false);
    this.background = scene.add.rectangle(0, 0, config.width ?? camera.width - 80, config.height ?? 180, config.bgColor ?? 0x111111, 0.9);
    this.speakerText = scene.add.text(-((config.width ?? camera.width - 80) / 2) + 25, -65, "", { color: "#ffd54f", fontSize: "22px" });
    this.bodyText = scene.add.text(-((config.width ?? camera.width - 80) / 2) + 25, -25, "", { color: "#ffffff", fontSize: "22px", wordWrap: { width: (config.width ?? camera.width - 80) - 50 } });
    this.container.add([this.background, this.speakerText, this.bodyText]);
    this.lifecycle.listen(scene.input, "pointerdown", () => { if (!this.enabled || !this.playing) return; if (this.character < this.lines[this.index].text.length) this.skip(); else this.#nextLine(); });
  }
  play() { this.#assertAlive(); if (!this.enabled || this.playing) return false; this.container.setVisible(true); this.playing = true; this.index = -1; this.#nextLine(); return true; }
  #nextLine() {
    this.#clearTimer(); this.index += 1;
    if (this.index >= this.lines.length) { this.playing = false; this.container.setVisible(false); this.eventBus.emit(DIALOG_EVENTS.COMPLETED, { lineCount: this.lines.length, dialog: this }); return; }
    const line = this.lines[this.index]; this.character = 0; this.speakerText.setText(line.speaker ?? ""); this.bodyText.setText("");
    this.eventBus.emit(DIALOG_EVENTS.LINE_STARTED, { index: this.index, line });
    this.timer = this.scene.time.addEvent({ delay: this.typeSpeed, loop: true, callback: () => {
      this.character += 1; this.bodyText.setText(line.text.slice(0, this.character));
      if (this.character >= line.text.length) { this.#clearTimer(); this.eventBus.emit(DIALOG_EVENTS.LINE_COMPLETED, { index: this.index, line }); }
    } });
  }
  skip() { this.#assertAlive(); if (!this.playing) return false; const line = this.lines[this.index]; this.#clearTimer(); this.character = line.text.length; this.bodyText.setText(line.text); this.eventBus.emit(DIALOG_EVENTS.LINE_COMPLETED, { index: this.index, line, skipped: true }); return true; }
  isPlaying() { this.#assertAlive(); return this.playing; }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; this.#clearTimer(); this.playing = false; this.container.setVisible(false); }
  reset() { this.#assertAlive(); this.#clearTimer(); this.index = -1; this.character = 0; this.playing = false; this.enabled = true; this.bodyText.setText(""); this.container.setVisible(false); }
  destroy() { if (this.lifecycle.destroyed) return; this.#clearTimer(); this.lifecycle.destroy(); this.container.destroy?.(true); }
  #clearTimer() { if (this.timer) { this.timer.remove?.(); this.timer = null; } }
  #assertAlive() { if (this.lifecycle.destroyed) throw new Error("DialogBox is destroyed"); }
}
export default DialogBox;
