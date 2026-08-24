import { EventBus } from "../../../02_Game_Core/core/EventBus.js";

const MERGE_SUCCESS = "MERGE_SUCCESS";
const MERGE_FAIL = "MERGE_FAIL";
const ITEM_KEY_FIELDS = ["mergeKey", "id", "key", "itemId", "type"];

/**
 * 两个物体的合成机制预制件。
 * 只负责匹配合并规则、创建结果对象并发送事件。
 */
export class Merger {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.rules = config.rules instanceof Map ? config.rules : new Map();
  }

  /**
   * 尝试合并两个对象或对象 ID。
   * @returns {boolean} 合并成功返回 true，失败返回 false。
   */
  merge(itemA, itemB) {
    const keyA = this._getItemKey(itemA);
    const keyB = this._getItemKey(itemB);

    if (keyA === undefined || keyB === undefined) {
      return this._emitFailure("INVALID_ITEM");
    }

    const rule = this._findRule(keyA, keyB);
    if (!rule.found) {
      return this._emitFailure("NO_MATCHING_RULE");
    }

    const mergedItem = this._createMergedItem(rule.resultKey);
    EventBus.emit(MERGE_SUCCESS, mergedItem);
    return true;
  }

  // 对象可通过常见标识字段提供合并键；原始值直接作为对象 ID 使用。
  _getItemKey(item) {
    if (item === null || item === undefined) {
      return undefined;
    }

    if (typeof item !== "object") {
      return item;
    }

    for (const field of ITEM_KEY_FIELDS) {
      if (item[field] !== null && item[field] !== undefined) {
        return item[field];
      }
    }

    // 兼容以 Phaser 纹理 key 标识物体的常见用法。
    if (
      item.texture &&
      item.texture.key !== null &&
      item.texture.key !== undefined
    ) {
      return item.texture.key;
    }

    return undefined;
  }

  // 优先匹配明确的二元规则，再匹配同类物体的直接映射规则。
  _findRule(keyA, keyB) {
    for (const candidate of this._buildPairKeys(keyA, keyB)) {
      if (this.rules.has(candidate)) {
        return { found: true, resultKey: this.rules.get(candidate) };
      }
    }

    // 支持以二元数组作为 Map 键的配置方式。
    for (const [ruleKey, resultKey] of this.rules) {
      if (!Array.isArray(ruleKey) || ruleKey.length !== 2) {
        continue;
      }

      const matchesForward =
        Object.is(ruleKey[0], keyA) && Object.is(ruleKey[1], keyB);
      const matchesReverse =
        Object.is(ruleKey[0], keyB) && Object.is(ruleKey[1], keyA);

      if (matchesForward || matchesReverse) {
        return { found: true, resultKey };
      }
    }

    // 同类合并可直接配置为 sourceKey -> resultKey。
    if (Object.is(keyA, keyB) && this.rules.has(keyA)) {
      return { found: true, resultKey: this.rules.get(keyA) };
    }

    return { found: false, resultKey: undefined };
  }

  // 二元合并默认不区分顺序，并兼容常见的字符串组合键格式。
  _buildPairKeys(keyA, keyB) {
    const pairs = [[keyA, keyB]];
    const candidates = [];

    if (!Object.is(keyA, keyB)) {
      pairs.push([keyB, keyA]);
    }

    for (const [left, right] of pairs) {
      const leftText = String(left);
      const rightText = String(right);

      candidates.push(
        `${leftText}+${rightText}`,
        `${leftText}|${rightText}`,
        `${leftText}:${rightText}`,
        `${leftText},${rightText}`,
        JSON.stringify([left, right])
      );
    }

    return [...new Set(candidates)];
  }

  // 结果配置为对象时复制一份，避免复用并修改规则表中的对象。
  _createMergedItem(resultKey) {
    if (resultKey !== null && typeof resultKey === "object") {
      return Array.isArray(resultKey) ? [...resultKey] : { ...resultKey };
    }

    return { key: resultKey };
  }

  _emitFailure(reason) {
    EventBus.emit(MERGE_FAIL, reason);
    return false;
  }
}

export default Merger;
