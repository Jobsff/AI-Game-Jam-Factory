import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assertScoringModel, chooseWinner, eliminationReasons, rankCandidates, scoreCandidate } from "../03_AI_Decision_System/decision-core.mjs";

const model = JSON.parse(await readFile(new URL("../03_AI_Decision_System/data/scoring-model.json", import.meta.url)));
const scores = (playability, finish, memory = 3) => ({ playability, finish, theme: 3, memory, ai: 3, child: 3 });

test("decision model weights total 100", () => assert.equal(assertScoringModel(model), true));

test("hard rules eliminate unclear, unlikely, or art-heavy candidates", () => {
  assert.deepEqual(eliminationReasons({ scores: scores(3, 2), coreArtCount: 11 }, model), [
    "48 小时完成概率低于 3/5", "30 秒核心玩法清晰度低于 4/5", "核心美术超过 10 张且尚未降级",
  ]);
});

test("ranking puts viable candidates first and resolves a tie by finish", () => {
  const candidates = [
    { name: "高分但淘汰", scores: scores(3, 5, 5), coreArtCount: 2 },
    { name: "可交付", scores: scores(4, 5, 3), coreArtCount: 2 },
    { name: "更冒险", scores: scores(5, 4, 3), coreArtCount: 2 },
  ];
  const ranked = rankCandidates(candidates, model);
  assert.equal(ranked[0].name, "可交付");
  assert.equal(ranked.at(-1).name, "高分但淘汰");
  assert.equal(chooseWinner(candidates, model).name, "可交付");
});


test("decision model and candidate values reject malformed data", () => {
  assert.throws(() => assertScoringModel({ ...model, metrics: [...model.metrics, model.metrics[0]] }), /duplicate metric/);
  assert.throws(() => scoreCandidate({ scores: { ...scores(4, 4), ai: 6 } }, model), /between 1 and 5/);
  assert.throws(() => eliminationReasons({ scores: scores(4, 4), coreArtCount: -1 }, model), /non-negative integer/);
  assert.throws(() => rankCandidates([], model), /non-empty array/);
});
