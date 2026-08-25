export const GAME_CONFIG = Object.freeze({
  title: "三次抉择",
  rounds: [
    { prompt: "旱季来临，最后一桶水给谁？", options: [{ label: "分享给村庄", effects: { kindness: 2, order: -1 } }, { label: "留给守卫", effects: { kindness: -1, order: 2 } }] },
    { prompt: "陌生旅人请求进入城门。", options: [{ label: "开门接纳", effects: { kindness: 2, order: -1 } }, { label: "关闭城门", effects: { kindness: -1, order: 2 } }] },
    { prompt: "古老机器可以改变未来。", options: [{ label: "交给众人", effects: { kindness: 1, order: 0 } }, { label: "由议会掌控", effects: { kindness: 0, order: 2 } }] }
  ]
});
