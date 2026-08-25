function assertFiniteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new TypeError(`${label} must be a finite number`);
  return number;
}

function metricIds(model) {
  return new Set(model.metrics.map((metric) => metric.id));
}

export function assertScoringModel(model) {
  if (!model || typeof model !== "object") throw new TypeError("scoring model must be an object");
  if (!model.scale || typeof model.scale !== "object") throw new TypeError("scoring model scale is required");
  const minimum = assertFiniteNumber(model.scale.minimum, "scale.minimum");
  const maximum = assertFiniteNumber(model.scale.maximum, "scale.maximum");
  if (minimum >= maximum) throw new RangeError("scale.minimum must be lower than scale.maximum");
  if (!Array.isArray(model.metrics) || model.metrics.length === 0) throw new TypeError("scoring model metrics must be a non-empty array");

  const ids = new Set();
  let total = 0;
  for (const metric of model.metrics) {
    if (!metric?.id || typeof metric.id !== "string") throw new TypeError("every metric needs a string id");
    if (ids.has(metric.id)) throw new Error(`duplicate metric id: ${metric.id}`);
    ids.add(metric.id);
    const weight = assertFiniteNumber(metric.weight, `metric ${metric.id} weight`);
    if (weight <= 0) throw new RangeError(`metric ${metric.id} weight must be positive`);
    total += weight;
  }
  if (Math.abs(total - 100) > Number.EPSILON) throw new Error(`评分权重总和必须为 100，当前为 ${total}`);

  if (!Array.isArray(model.hardElimination)) throw new TypeError("hardElimination must be an array");
  for (const rule of model.hardElimination) {
    if (!ids.has(rule?.id) && rule?.id !== "coreArtCount") throw new Error(`unknown hard elimination field: ${rule?.id}`);
    if (!new Set(["lt", "gt"]).has(rule.operator)) throw new Error(`unsupported hard elimination operator: ${rule.operator}`);
    assertFiniteNumber(rule.value, `hard elimination ${rule.id} value`);
    if (!rule.reason || typeof rule.reason !== "string") throw new TypeError(`hard elimination ${rule.id} needs a reason`);
  }

  if (!Array.isArray(model.tieBreakOrder) || model.tieBreakOrder.length === 0) throw new TypeError("tieBreakOrder must be a non-empty array");
  for (const key of model.tieBreakOrder) if (!ids.has(key) && key !== "name") throw new Error(`unknown tie-break field: ${key}`);
  return true;
}

function scoreValue(candidate, metric, model) {
  const value = assertFiniteNumber(candidate?.scores?.[metric.id], `candidate score ${metric.id}`);
  if (value < model.scale.minimum || value > model.scale.maximum) {
    throw new RangeError(`candidate score ${metric.id} must be between ${model.scale.minimum} and ${model.scale.maximum}`);
  }
  return value;
}

function artCount(candidate) {
  const value = assertFiniteNumber(candidate?.coreArtCount ?? 0, "candidate coreArtCount");
  if (value < 0 || !Number.isInteger(value)) throw new RangeError("candidate coreArtCount must be a non-negative integer");
  return value;
}

export function scoreCandidate(candidate, model) {
  assertScoringModel(model);
  return model.metrics.reduce((sum, metric) => sum + scoreValue(candidate, metric, model) / model.scale.maximum * metric.weight, 0);
}

export function eliminationReasons(candidate, model) {
  assertScoringModel(model);
  const count = artCount(candidate);
  return model.hardElimination.flatMap((rule) => {
    const value = rule.id === "coreArtCount"
      ? count
      : scoreValue(candidate, model.metrics.find((metric) => metric.id === rule.id), model);
    const hit = rule.operator === "lt" ? value < rule.value : value > rule.value;
    return hit ? [rule.reason] : [];
  });
}

export function rankCandidates(candidates, model) {
  assertScoringModel(model);
  if (!Array.isArray(candidates) || candidates.length === 0) throw new TypeError("candidates must be a non-empty array");
  return candidates.map((candidate, index) => ({
    ...candidate,
    originalIndex: index,
    total: scoreCandidate(candidate, model),
    eliminated: eliminationReasons(candidate, model),
  })).sort((left, right) => {
    if (!!left.eliminated.length !== !!right.eliminated.length) return left.eliminated.length ? 1 : -1;
    if (right.total !== left.total) return right.total - left.total;
    for (const key of model.tieBreakOrder) {
      if (key === "name") {
        const byName = String(left.name ?? "").localeCompare(String(right.name ?? ""), "zh-CN");
        if (byName) return byName;
        continue;
      }
      const metric = model.metrics.find((item) => item.id === key);
      const delta = scoreValue(right, metric, model) - scoreValue(left, metric, model);
      if (delta) return delta;
    }
    return left.originalIndex - right.originalIndex;
  });
}

export function chooseWinner(candidates, model) {
  return rankCandidates(candidates, model).find((candidate) => !candidate.eliminated.length) ?? null;
}
