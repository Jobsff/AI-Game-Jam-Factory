import { UIButton, BUTTON_EVENTS } from "../../08_Prefab_Library/presentation-prefabs/button/UIButton.js";

/**
 * UIButton 的兼容入口。
 * 新代码使用 new Button(scene, config)；旧代码仍可使用
 * new Button(scene, x, y, label, options)。
 */
export class Button extends UIButton {
  constructor(scene, xOrConfig = 0, y = 0, label = "", options = {}) {
    const usesConfig = xOrConfig !== null && typeof xOrConfig === "object" && !Array.isArray(xOrConfig);
    const config = usesConfig
      ? { ...xOrConfig }
      : { ...(options ?? {}), x: xOrConfig, y, label };

    if (config.onClick !== undefined && typeof config.onClick !== "function") {
      throw new TypeError("onClick must be a function");
    }

    super(scene, config);

    if (config.onClick) {
      const unsubscribe = this.eventBus.on(BUTTON_EVENTS.CLICKED, (payload) => {
        if (payload.button === this) config.onClick(payload);
      });
      this.lifecycle.add(unsubscribe);
    }
  }

  get x() { return this.container.x; }
  set x(value) { this.container.x = value; }
  get y() { return this.container.y; }
  set y(value) { this.container.y = value; }
  setPosition(x, y = x) { this.container.setPosition(x, y); return this; }
  setVisible(value) { this.container.setVisible(value); return this; }
  setDepth(value) { this.container.setDepth(value); return this; }
  setAlpha(value) { this.container.setAlpha(value); return this; }
  setScale(x, y = x) { this.container.setScale(x, y); return this; }
}

export { UIButton, BUTTON_EVENTS };
export default Button;
