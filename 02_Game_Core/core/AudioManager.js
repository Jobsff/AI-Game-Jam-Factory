import sharedEventBus from "./EventBus.js";

export const AUDIO_EVENTS = Object.freeze({ PLAYED: "audio:played", STOPPED: "audio:stopped", MUTED: "audio:muted" });

/** Phaser Sound 的小型生命周期包装，不持有跨 Scene 的声音实例。 */
export class AudioManager {
  constructor(scene, config = {}) {
    if (!scene?.sound) throw new TypeError("scene.sound is required");
    this.scene = scene;
    this.eventBus = config.eventBus ?? sharedEventBus;
    this.sounds = new Map();
    this.enabled = true;
    this.destroyed = false;
  }
  play(key, config = {}) {
    this.#assertAlive();
    if (!this.enabled) return null;
    if (typeof key !== "string" || !key) throw new TypeError("key must be a non-empty string");
    const sound = this.scene.sound.add(key, config);
    this.sounds.set(sound, key);
    sound.once?.("destroy", () => this.sounds.delete(sound));
    sound.play();
    this.eventBus.emit(AUDIO_EVENTS.PLAYED, { key, sound });
    return sound;
  }
  stopAll() {
    this.#assertAlive();
    for (const [sound, key] of this.sounds) {
      sound.stop?.(); sound.destroy?.();
      this.eventBus.emit(AUDIO_EVENTS.STOPPED, { key, sound });
    }
    this.sounds.clear();
  }
  enable() { this.#assertAlive(); this.enabled = true; }
  disable() { this.#assertAlive(); this.enabled = false; this.stopAll(); }
  reset() { this.#assertAlive(); this.stopAll(); this.enabled = true; }
  destroy() { if (this.destroyed) return; this.stopAll(); this.destroyed = true; }
  #assertAlive() { if (this.destroyed) throw new Error("AudioManager is destroyed"); }
}
export default AudioManager;
