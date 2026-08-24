import { EventBus, Events } from "../core/EventBus.js";

// UI 场景：负责分数、进度、顶部信息，与玩法逻辑解耦
export default class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    // 进度显示
    this.progressText = this.add.text(360, 140, "已收集 0 / 3", {
      fontSize: "28px", color: "#88d8ff",
    }).setOrigin(0.5);

    EventBus.on(Events.ITEM_GET, (count) => {
      this.progressText.setText(`已收集 ${count} / 3`);
    });
  }
}
