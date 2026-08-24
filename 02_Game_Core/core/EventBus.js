// 共享事件总线（标准版）。所有模板的事件常量建议在此扩展，保持命名一致。
export const Events = {
  ITEM_GET: "ITEM_GET",
  CREATE: "CREATE",
  WIN: "WIN",
  LOSE: "LOSE",
  RESET: "RESET",
};

export const EventBus = new Phaser.Events.EventEmitter();
