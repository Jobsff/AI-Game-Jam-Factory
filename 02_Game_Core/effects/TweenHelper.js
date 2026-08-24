// 补间动画辅助：统一常用动画，避免到处写 tweens 配置
export default class TweenHelper {
  // 弹入：从透明+缩小 → 正常
  static popIn(target, duration = 300) {
    return target.scene.tweens.add({
      targets: target, alpha: { from: 0, to: 1 }, scale: { from: 0.6, to: 1 },
      duration, ease: "Back.Out",
    });
  }

  // 闪烁：用于提示/高亮
  static flash(target, duration = 200) {
    return target.scene.tweens.add({
      targets: target, alpha: { from: 1, to: 0.2 },
      duration, yoyo: true, repeat: 2,
    });
  }

  // 飘字：向上飘动 + 淡出
  static floatUp(target, distance = 80, duration = 800) {
    return target.scene.tweens.add({
      targets: target, y: target.y - distance, alpha: 0, duration, ease: "Cubic.Out",
    });
  }
}
