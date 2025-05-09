# Granite3.3:8b-instruct (FIM) — Code Completion Evaluation Report

## Configuration

```json
"tabAutocompleteModel": {
  "title": "granite-3.3:8b (FIM)",
  "model": "granite-3.3:8b",
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

This report evaluates the performance of `granite3.3:8b-instruct` using the **Fill-in-the-Middle (FIM)** template across 12 code completion test cases. Each case is assessed based on:

- Correctness of the model's suggestion
- Alignment with the expected solution
- Tab (accept) and Esc (reject) usage
- Contextual fidelity and code formatting

---

## Test Case Results

| #  | Test Case Description             | Model Completion Summary                             | Expected Output Match       | Tab/Esc Count         | Evaluation Summary                          |
|----|----------------------------------|------------------------------------------------------|-----------------------------|------------------------|---------------------------------------------|
| 1  | Nested tax brackets (prefix)     | Uses cumulative logic for tax calculation            | ❌ Overengineered logic     | Tab ×3                | ⚠️ Indentation had to be manually fixed     |
| 2  | Lambda even filter (prefix)      | `lambda x: x % 2 == 0`                               | ✅ Matches expected          | Tab ×1                | ✅ Correct and concise                      |
| 3  | Pandas agg (prefix)              | `{"value": ["mean", "sum"]}`                         | ✅ Reasonable alternative    | Tab ×2                | ✅ Acceptable logic                         |
| 4  | Exception raise (prefix)         | `raise ValueError("Insufficient funds")`             | ✅ Matches expected          | Tab ×2                | ✅ Ideal completion                         |
| 5  | `__str__` method (prefix)        | Correct string return, repeated completions          | ⚠️ Close, but excessive repeats | Esc ×2, Tab ×1        | ⚠️ Good logic, bad stop condition behavior |
| 6  | Factorial logic (prefix)         | `return n * factorial(n - 1)`                        | ✅ Exact match               | Tab ×2                | ✅ Clean and correct                        |
| 7  | Nested tax (with suffix)         | Slightly different bracket logic                     | ⚠️ Slight formula deviation  | Tab ×2                | ⚠️ Acceptable with caveats                  |
| 8  | Lambda filter (with suffix)      | `lambda x: x % 2 == 0`                               | ✅ Exact match               | Tab ×1                | ✅ Clean and correct                        |
| 9  | Pandas chain (with suffix)       | Used `np.mean`/`np.median` without import            | ❌ Error-prone               | Tab ×1, Esc ×1         | ⚠️ Logic okay, import hallucination         |
| 10 | Withdraw logic (with suffix)     | Logic correct but indentation broken                 | ✅ Logic match               | Tab ×1, Esc ×3         | ❌ Indentation makes it unusable            |
| 11 | Bonus method (with suffix)       | Good tiered logic, but indentation broken            | ✅ Logic match               | Esc ×3, Tab ×2         | ⚠️ Correct but required manual fix          |
| 12 | Factorial (with suffix)          | `return n * factorial(n - 1)`                        | ✅ Exact match               | Tab ×2                | ✅ No issues                                |

---

## Summary

- ✅ **Correct Completions:** 6 / 12  
- ⚠️ **Partially Acceptable:** 5  
- ❌ **Incorrect:** 1  
- ⌨️ **Tab Accepts:** 20  
- 🛑 **Esc Rejects:** 11  

---

## Insights

- The model excels at standard logic-based completions (recursion, lambda, exception handling).
- **Indentation issues** were a significant hindrance in cases involving control structures or methods.
- Over-generation and **lack of stopping behavior** (especially in `__str__`) affected usability.
- A hallucinated dependency on `np` (numpy) without import was noted in a Pandas test.

---
