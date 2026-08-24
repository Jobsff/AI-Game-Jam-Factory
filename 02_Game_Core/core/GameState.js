// 共享全局状态（标准版）。单一真源，禁止在各 Scene 里散落状态变量。
// 用法：import GameState from "../core/GameState.js"; GameState.state = "PLAYING";
export default {
  state: "READY", // READY -> PLAYING -> WIN/LOSE
  score: 0,
  level: 1,
  data: {},      // 自由扩展的键值数据
};
