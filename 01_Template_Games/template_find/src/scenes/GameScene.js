// 模板5：寻找/观察/解谜
// 核心循环：在背景中找出隐藏的目标物体，点对得分，找全胜利
// 状态机：READY -> SEARCH -> CHECK -> SUCCESS
// 重点：鼠标/触摸命中检测 + 观察
export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.state = "SEARCH";
    this.found = 0;
    this.target = 3;

    this.add.text(360, 100, "找出画面里隐藏的 ⭐", {
      fontSize: "32px", color: "#ffffff",
    }).setOrigin(0.5);

    // 生成若干"物体"，其中 target 个是目标（占位：混在色块里的星形）
    this.objects = [];
    const positions = [[140, 300], [560, 350], [300, 600], [520, 800], [180, 950], [600, 1100]];
    positions.forEach(([x, y], i) => {
      const isTarget = i < this.target;
      const obj = isTarget
        ? this.add.star(x, y, 5, 34, 40, 0xffd54a)
        : this.add.circle(x, y, 40, 0x546e7a);
      obj.setData("isTarget", isTarget);
      obj.setInteractive();
      obj.on("pointerdown", () => this.onObjectClick(obj));
      this.objects.push(obj);
    });

    this.foundText = this.add.text(360, 160, `找到 ${this.found} / ${this.target}`, {
      fontSize: "28px", color: "#88d8ff",
    }).setOrigin(0.5);
  }

  onObjectClick(obj) {
    if (this.state !== "SEARCH") return;
    if (obj.getData("isTarget")) {
      obj.destroy();
      this.found++;
      this.foundText.setText(`找到 ${this.found} / ${this.target}`);
      if (this.found >= this.target) this.success();
    } else {
      // 点错：轻微反馈
      this.cameras.main.shake(100, 0.005);
    }
  }

  success() {
    this.state = "SUCCESS";
    this.add.text(360, 640, "🎉 全部找到！", {
      fontSize: "56px", color: "#ffd54a",
    }).setOrigin(0.5);
    this.add.text(360, 800, "点击重新开始", { fontSize: "28px", color: "#ffffff" }).setOrigin(0.5);
    this.input.once("pointerdown", () => this.scene.restart());
  }
}
