// 资源加载辅助：集中管理 AI 生成的图片/音频加载与进度
export default class AssetLoader {
  constructor(scene) {
    this.scene = scene;
  }

  // 批量注册图片（key -> 路径）
  loadImages(map) {
    for (const [key, path] of Object.entries(map)) {
      this.scene.load.image(key, path);
    }
  }

  // 批量注册音频
  loadAudio(map) {
    for (const [key, path] of Object.entries(map)) {
      this.scene.load.audio(key, path);
    }
  }

  // 加载完成回调
  onComplete(callback) {
    this.scene.load.once("complete", callback);
  }
}
