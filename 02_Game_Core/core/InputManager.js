// 统一输入层：所有键盘/触摸输入走这里，不让对象代码直接监听。
// 好处：换平台（PC/移动）只改这里，玩法代码不用动。
export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this.pointer = scene.input.activePointer;
  }

  // 注册键盘按键
  addKey(name, keyCode) {
    this.keys[name] = this.scene.input.keyboard.addKey(keyCode);
    return this.keys[name];
  }

  isDown(name) {
    return this.keys[name] ? this.keys[name].isDown : false;
  }

  justDown(name) {
    return this.keys[name] ? Phaser.Input.Keyboard.JustDown(this.keys[name]) : false;
  }

  // 触摸/点击事件（统一封装）
  onTap(callback) {
    this.scene.input.on("pointerdown", callback);
  }

  // 触摸/点击位置
  tapPosition() {
    return { x: this.pointer.x, y: this.pointer.y };
  }
}
