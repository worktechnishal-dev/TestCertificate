const numberPattern = /-?\d+(?:\.\d+)?/g;

const normalize = (value = "") => String(value).trim();

const extractNumber = (value = "") => {
  const match = normalize(value).match(numberPattern);
  return match ? Number(match[0]) : null;
};

const parseRequiredRule = (requiredResult = "") => {
  const raw = normalize(requiredResult);
  const lower = raw.toLowerCase();
  const numbers = raw.match(numberPattern)?.map(Number) || [];

  if (!raw) return { type: "none" };
  if ((lower.includes("max") || lower.includes("not more than")) && numbers.length) return { type: "max", value: numbers[0] };
  if ((lower.includes("min") || lower.includes("not less than")) && numbers.length) return { type: "min", value: numbers[0] };
  if ((raw.includes("-") || lower.includes("to")) && numbers.length >= 2) return { type: "range", min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]) };
  if (/^(<=|≤|<)/.test(raw) && numbers.length) return { type: raw.startsWith("<") && !raw.startsWith("<=") ? "lt" : "max", value: numbers[0] };
  if (/^(>=|≥|>)/.test(raw) && numbers.length) return { type: raw.startsWith(">") && !raw.startsWith(">=") ? "gt" : "min", value: numbers[0] };
  if (/^(pass|passed|ok|complies|compliant)$/i.test(raw)) return { type: "contains", value: raw.toLowerCase() };
  if (numbers.length === 1 && raw.replace(numberPattern, "").trim().length <= 2) return { type: "exactNumber", value: numbers[0] };
  return { type: "text", value: lower };
};

export const checkResult = (requiredResult, result) => {
  const actualText = normalize(result);
  const rule = parseRequiredRule(requiredResult);

  if (!actualText) return { valid: false, message: "Result is required" };
  if (rule.type === "none") return { valid: true };

  const actualNumber = extractNumber(actualText);
  if (["max", "min", "range", "lt", "gt", "exactNumber"].includes(rule.type) && actualNumber === null) {
    return { valid: false, message: "Enter a numeric result" };
  }
  if (rule.type === "max" && actualNumber > rule.value) return { valid: false, message: `Maximum ${rule.value}` };
  if (rule.type === "min" && actualNumber < rule.value) return { valid: false, message: `Minimum ${rule.value}` };
  if (rule.type === "lt" && actualNumber >= rule.value) return { valid: false, message: `Less than ${rule.value}` };
  if (rule.type === "gt" && actualNumber <= rule.value) return { valid: false, message: `Greater than ${rule.value}` };
  if (rule.type === "range" && (actualNumber < rule.min || actualNumber > rule.max)) return { valid: false, message: `${rule.min} to ${rule.max}` };
  if (rule.type === "exactNumber" && actualNumber !== rule.value) return { valid: false, message: `Must be ${rule.value}` };
  if (rule.type === "contains" && !actualText.toLowerCase().includes(rule.value)) return { valid: false, message: `Include ${requiredResult}` };
  if (rule.type === "text" && actualText.toLowerCase() !== rule.value) return { valid: false, message: `Match ${requiredResult}` };
  return { valid: true };
};

export const checkRowResult = (row) => {
  const operator = normalize(row.validationOperator);
  const rangeValues = String(row.validationValue || "").match(numberPattern)?.map(Number) || [];
  const expected = extractNumber(row.validationValue);
  const actual = extractNumber(row.result);

  if (!operator) return checkResult(row.requiredResult, row.result);
  if (!normalize(row.result)) return { valid: false, message: "Result is required" };
  if (operator === "between" && rangeValues.length < 2) return { valid: false, message: "Enter min and max validation values" };
  if (operator !== "between" && expected === null) return { valid: false, message: "Validation value must be numeric" };
  if (actual === null) return { valid: false, message: "Enter a numeric result" };
  if (operator === "between") {
    const min = Math.min(rangeValues[0], rangeValues[1]);
    const max = Math.max(rangeValues[0], rangeValues[1]);
    if (actual < min || actual > max) return { valid: false, message: `Between ${min} and ${max}` };
  }
  if (operator === "greater_than" && actual <= expected) return { valid: false, message: `Greater than ${expected}` };
  if (operator === "less_than" && actual >= expected) return { valid: false, message: `Less than ${expected}` };
  if (operator === "equal_to" && actual !== expected) return { valid: false, message: `Equal to ${expected}` };
  return { valid: true };
};

export const validateAnalyses = (analyses = []) =>
  analyses.flatMap((analysis) =>
    (analysis.rows || []).flatMap((row) => {
      const verdict = checkRowResult(row);
      return verdict.valid ? [] : [`${analysis.title} - ${row.parameter}: ${verdict.message}`];
    })
  );
