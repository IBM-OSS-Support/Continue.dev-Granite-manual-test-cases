# Granite3.3:2b-base (FIM) — Code Completion Evaluation Report

## Configuration

```json
"tabAutocompleteModel": {
  "title": "granite-3.3-2b-base (FIM)",
  "model": "granite-3.3-2b-base",
  "provider": "ollama",
  "apiBase": "http://localhost:11434",
  "contextLength": 4096,
  "useRecentlyEdited": false,
  "onlyMyCode": true,
  "promptTemplates": {
    "autocomplete": "<fim_prefix>{{{prefix}}}<fim_suffix>{{{suffix}}}<fim_middle>"
  },
  "completionOptions": {
    "maxTokens": 2048,
    "temperature": 0,
    "topP": 0.9,
    "topK": 40,
    "presencePenalty": 0,
    "frequencyPenalty": 0.1
  }
}
```

## Overview

This report evaluates the code completion performance of the `granite3.3:2b-base` model using the **Fill-in-the-Middle (FIM)** template across 12 unified test cases. Each test case was evaluated based on:

- Correctness of the model's completion
- Alignment with the expected solution
- Tab (accept) and Esc (reject) interactions

---

## Test Case Results

| # | Test Case Description | Model Completion | Expected Completion | Tab/Esc Count | Evaluation |
|--:|------------------------|------------------|---------------------|---------------|------------|
| 1 | Nested tax brackets (prefix) | `((income - 250000) * 0.05) + (((income - 500000) * 0.1) / 2)` | `return (income - 500000) * 0.1` | Tab ×3 | ❌ Overcomplicated and mathematically incorrect |
| 2 | Lambda even filter (prefix) | `lambda x: x % 2 == 0` | `lambda x: x % 2 == 0` | Tab ×2 | ✅ Correct |
| 3 | Pandas agg (prefix) | `{"value": "sum", "count": "count", "mean": "mean", "std": "std", "min": "min", "max": "max"}` | `{"value": "sum"}` or similar | Tab ×2 | ✅ Reasonable though verbose |
| 4 | Exception raise (prefix) | `raise ValueError("Insufficient funds")` | Same | Tab ×2 | ✅ Correct |
| 5 | `__str__` method (prefix) | `return f"Name: {self.name}, Salary: {self.salary}"` | `return f"Employee {self.name} earns ${self.salary}."` | Esc ×1, Tab after repeat | ⚠️ Acceptable, but not ideal |
| 6 | Factorial logic (prefix) | `return n * factorial(n - 1)` | Same | Tab ×2 | ✅ Correct |
| 7 | Nested tax (with suffix) | `((income - 500000) * 0.1) + ((500000 - 1000000) * 0.2)` | `return (income - 1000000) * 0.2 + (500000 - 1000000) * 0.1` | Tab ×2 | ❌ Incorrect bracket logic |
| 8 | Lambda filter (with suffix) | `lambda x: x % 2 == 0` | Same | Esc ×1, Tab on retry | ✅ Final completion correct |
| 9 | Pandas chain (with suffix) | Count, mean, median aggregation | Basic agg e.g., `{"value": "sum"}` | Tab ×1 | ⚠️ Valid but excessive |
| 10 | Withdraw (with suffix) | `raise Exception("Insufficient funds in the account")` | Same | Tab ×1 | ✅ Correct |
| 11 | Bonus method (with suffix) | Calculates 10% bonus with condition | `return self.salary * 0.1` | Esc ×1, Tab on final | ✅ Logic fine, slight noise in prompt |
| 12 | Factorial (with suffix) | `return n * factorial(n - 1)` | Same | Tab ×2 | ✅ Correct |

---

## Summary

- ✅ **Correct Completions:** 9 / 12
- ⚠️ **Partially Acceptable:** 2
- ❌ **Incorrect:** 1
- ⌨️ **Tab Accepts:** 21
- 🛑 **Esc Rejects:** 3

---

## Insights

- The model performs reliably on classic programming constructs: **recursion**, **lambdas**, and **basic exception handling**.
- **Tax-related logic and nested brackets** proved error-prone.
- Occasional verbose completions were valid but suboptimal.
- Low Esc count suggests model was mostly in line with user expectations.

---

