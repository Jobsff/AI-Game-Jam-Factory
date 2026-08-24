// 全局事件总线 + 事件常量（防跨文件改A炸B）
export const Events = {
  ITEM_GET: "ITEM_GET",   // 收集到一个碎片
  CREATE: "CREATE",       // 集满，触发合成
  WIN: "WIN",             // 合成成功，胜利
  RESET: "RESET",         // 重新开始
};

export const EventBus = new Phaser.Events.EventEmitter();
