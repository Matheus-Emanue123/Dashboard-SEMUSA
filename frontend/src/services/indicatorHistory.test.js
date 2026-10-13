import { test } from "node:test";
import assert from "node:assert/strict";

import { buildIndicatorSeries } from "./indicatorHistory.js";

test("consolida razão pelos numeradores e denominadores do quadrimestre", () => {
  const result = buildIndicatorSeries({
    aggregation: { type: "ratio", scale: 100 },
    observations: [
      { month: "2025-01", numerator: 1, denominator: 2 },
      { month: "2025-02", numerator: 9, denominator: 18 },
      { month: "2025-03", numerator: 9, denominator: 10 },
      { month: "2025-04", numerator: 1, denominator: 10 },
    ],
  }, "quadrimester");

  assert.equal(result[0].value, 50);
  assert.equal(result[0].label, "jan–abr/2025");
  assert.equal(result[0].partial, false);
});

test("calcula média quadrimestral ponderada pelas quantidades observadas", () => {
  const result = buildIndicatorSeries({
    aggregation: { type: "mean" },
    observations: [
      { month: "2025-01", total: 10, count: 1 },
      { month: "2025-02", total: 90, count: 9 },
      { month: "2025-03", total: 0, count: 0 },
      { month: "2025-04", total: 0, count: 0 },
    ],
  }, "quadrimester");

  assert.equal(result[0].value, 10);
});

test("soma contagens aditivas por quadrimestre", () => {
  const result = buildIndicatorSeries({
    aggregation: { type: "count" },
    observations: [
      { month: "2025-05", value: 2 },
      { month: "2025-06", value: 3 },
      { month: "2025-07", value: 4 },
      { month: "2025-08", value: 5 },
    ],
  }, "quadrimester");

  assert.equal(result[0].value, 14);
  assert.equal(result[0].label, "mai–ago/2025");
});

test("marca quadrimestre parcial sem preencher meses ausentes", () => {
  const result = buildIndicatorSeries({
    aggregation: { type: "count" },
    observations: [
      { month: "2024-09", value: 4 },
      { month: "2024-11", value: 6 },
    ],
  }, "quadrimester");

  assert.equal(result.length, 1);
  assert.equal(result[0].value, 10);
  assert.equal(result[0].partial, true);
  assert.match(result[0].label, /parcial/);
});

test("retorna série vazia quando não há observações", () => {
  assert.deepEqual(buildIndicatorSeries(undefined, "quadrimester"), []);
  assert.deepEqual(buildIndicatorSeries({ aggregation: { type: "count" }, observations: [] }, "monthly"), []);
});

test("mensal retorna o resultado dos componentes do próprio mês", () => {
  const result = buildIndicatorSeries({
    aggregation: { type: "ratio", scale: 1000 },
    observations: [{ month: "2025-03", numerator: 2, denominator: 10 }],
  }, "monthly");

  assert.equal(result[0].value, 200);
  assert.equal(result[0].label, "mar/2025");
});
