// 全局状态（单一真源，所有 Scene 读这里，不要散落 if(gameOver)）
export default {
  state: "READY",   // READY -> PLAYING -> CREATING -> WIN
  items: [],        // 已收集的碎片 id
  target: 3,        // 收集多少个触发合成
  score: 0,
};
