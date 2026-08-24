import { EventBus, Events } from "../core/EventBus.js";
import GameState from "../core/GameState.js";
import Item from "../objects/Item.js";

// 核心玩法：随机掉落碎片 → 点击收集 → 集满 target 触发合成 → 胜利
export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    GameState.state = "PLAYING";
    GameState.items = [];
    this.collected = 0;

    // 提示文字
    this.add.text(360, 80, "点击碎片，收集 3 个", {
      fontSize: "32px", color: "#ffffff",
    }).setOrigin(0.5);

    // 生成若干可收集碎片（先用色块占位，后续替换成 AI 图）
    this.itemsGroup = this.add.group();
    for (let i = 0; i < 5; i++) {
      const item = new Item(this, 120 + i * 120, 400 + (i % 3) * 200);
      this.itemsGroup.add(item);
    }

    // 收集逻辑：点击任意碎片
    this.input.on("pointerdown", (pointer) => {
      if (GameState.state !== "PLAYING") return;
      const hit = this.itemsGroup.getChildren().find(
        (it) => it.active && Phaser.Geom.Rectangle.Contains(it.getBounds(), pointer.x, pointer.y)
      );
      if (!hit) return;

      this.collected++;
      GameState.items.push(hit.itemId);
      hit.collect(); // 播放收集反馈
      EventBus.emit(Events.ITEM_GET, this.collected);

      if (this.collected >= GameState.target) {
        GameState.state = "CREATING";
        EventBus.emit(Events.CREATE, this.collected);
      }
    });

    // 合成成功
    EventBus.on(Events.CREATE, () => {
      this.add.text(360, 640, "✨ 合成成功！", {
        fontSize: "48px", color: "#ffd54a",
      }).setOrigin(0.5);
      EventBus.emit(Events.WIN);
    });

    // 胜利 → 可重新开始
    EventBus.on(Events.WIN, () => {
      GameState.state = "WIN";
      this.add.text(360, 900, "点击屏幕重新开始", {
        fontSize: "28px", color: "#ffffff",
      }).setOrigin(0.5);
      this.input.once("pointerdown", () => {
        this.scene.restart();
      });
    });
  }

  update() {
    if (GameState.state === "PLAYING") {
      // 核心循环：这里放持续逻辑（如碎片漂移/动画）
    }
  }
}
