import EventBus from "../events.js";
import { EVENTS } from "../events.js";

export default class UIScene extends Phaser.Scene {
  constructor() { super("UIScene"); }
  create() {
    this.title = this.add.text(360, 52, "", { fontFamily: "system-ui", fontSize: "34px", color: "#ffffff", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(100);
    this.status = this.add.text(360, 108, "", { fontFamily: "system-ui", fontSize: "25px", color: "#b9d7ff", align: "center" }).setOrigin(0.5).setDepth(100);
    this.message = this.add.text(360, 640, "", { fontFamily: "system-ui", fontSize: "48px", color: "#ffe66d", align: "center", backgroundColor: "#111827dd", padding: { x: 28, y: 22 }, wordWrap: { width: 620 } }).setOrigin(0.5).setDepth(100).setVisible(false);
    const onHud = ({ title, status }) => { if (title !== undefined) this.title.setText(title); if (status !== undefined) this.status.setText(status); };
    const onResult = ({ message }) => { this.message.setText(`${message}\n\n点击重新开始`).setVisible(true); };
    const offHud = EventBus.on(EVENTS.HUD, onHud);
    const offResult = EventBus.on(EVENTS.RESULT, onResult);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { offHud(); offResult(); });
    EventBus.emit(EVENTS.UI_READY);
  }
}
