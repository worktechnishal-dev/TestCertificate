import assert from "node:assert/strict";
import test from "node:test";
import { checkResult, checkRowResult, validateAnalyses } from "./resultValidation.js";

test("checkResult validates ranges and text", () => {
  assert.equal(checkResult("45 - 52 HRC", "48 HRC").valid, true);
  assert.equal(checkResult("45 - 52 HRC", "60 HRC").valid, false);
  assert.equal(checkResult("Uniform tempered martensite", "Uniform tempered martensite").valid, true);
  assert.equal(checkResult("Uniform tempered martensite", "Different").valid, false);
});

test("checkRowResult uses explicit product validation", () => {
  assert.equal(
    checkRowResult({
      requiredResult: "45 - 52 HRC",
      validationOperator: "less_than",
      validationValue: "52 HRC",
      result: "50 HRC"
    }).valid,
    true
  );

  assert.equal(
    checkRowResult({
      requiredResult: "45 - 52 HRC",
      validationOperator: "less_than",
      validationValue: "52 HRC",
      result: "52 HRC"
    }).valid,
    false
  );
});

test("validateAnalyses returns readable validation errors", () => {
  const errors = validateAnalyses([
    {
      title: "Chemical Analysis",
      rows: [
        {
          parameter: "Carbon",
          requiredResult: "0.80 - 1.20 %",
          validationOperator: "between",
          validationValue: "0.80 - 1.20 %",
          result: "1.40 %"
        }
      ]
    }
  ]);

  assert.deepEqual(errors, ["Chemical Analysis - Carbon: Between 0.8 and 1.2"]);
});
