/** 常用 Phaser tween 配置；通过 target.scene 注入，不读取 Phaser 全局。 */
export class TweenHelper {
  static popIn(target, duration = 300) {
    return this.#add(target, { targets: target, alpha: { from: 0, to: 1 }, scale: { from: 0.6, to: 1 }, duration, ease: "Back.Out" });
  }
  static flash(target, duration = 200) {
    return this.#add(target, { targets: target, alpha: { from: 1, to: 0.2 }, duration, yoyo: true, repeat: 2 });
  }
  static floatUp(target, distance = 80, duration = 800) {
    if (!Number.isFinite(target?.y)) throw new TypeError("target.y must be finite");
    return this.#add(target, { targets: target, y: target.y - distance, alpha: 0, duration, ease: "Cubic.Out" });
  }
  static stop(target) {
    const manager = target?.scene?.tweens;
    if (!manager?.killTweensOf) throw new TypeError("target.scene.tweens.killTweensOf is required");
    manager.killTweensOf(target);
  }
  static #add(target, config) {
    if (!Number.isFinite(config.duration) || config.duration < 0) throw new RangeError("duration must be a non-negative number");
    const manager = target?.scene?.tweens;
    if (!manager?.add) throw new TypeError("target.scene.tweens.add is required");
    return manager.add(config);
  }
}

export default TweenHelper;
