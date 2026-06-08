const assert = require("node:assert/strict");
const test = require("node:test");
const { checkResult, validateAnalyses } = require("../utils/resultValidation");

test("checkResult accepts numeric ranges and rejects values outside range", () => {
  assert.deepEqual(checkResult("45 - 52 HRC", "48 HRC"), { valid: true });
  assert.equal(checkResult("45 - 52 HRC", "54 HRC").valid, false);
});

test("checkResult validates minimum, maximum, and exact text results", () => {
  assert.equal(checkResult("Min 80 %", "86 %").valid, true);
  assert.equal(checkResult("Max 5 %", "7 %").valid, false);
  assert.equal(checkResult("Uniform tempered martensite", "Uniform tempered martensite").valid, true);
  assert.equal(checkResult("Uniform tempered martensite", "Different").valid, false);
});

test("validateAnalyses applies explicit product validation operators", () => {
  const analyses = [
    {
      title: "Physical Analysis",
      rows: [
        {
          parameter: "Hardness",
          requiredResult: "45 - 52 HRC",
          validationOperator: "between",
          validationValue: "45 - 52 HRC",
          result: "60 HRC",
          referenceMethod: "IS 1500"
        }
      ]
    }
  ];

  assert.deepEqual(validateAnalyses(analyses), ["Physical Analysis - Hardness: Result must be between 45 and 52"]);
});
