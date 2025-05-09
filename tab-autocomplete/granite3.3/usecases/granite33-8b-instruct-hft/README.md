# Granite3.3:8b-instruct (HFT) — Code Completion Evaluation Report

## Configuration

```json
"tabAutocompleteModel": {
        "title": "granite3.3:8b",
        "model": "granite3.3:8b",
        "provider": "ollama",
        "apiBase": "http://localhost:11434",
        "contextLength": 4096,
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

This report summarizes the performance of `granite3.3:8b-instruct` using the **Hole-Filler Template (HFT)** across 12 code completion test cases. Each test case is evaluated for:

- Accuracy of the model's suggestion
- Alignment with expected code
- Number of Tab (accept) and Esc (reject) actions
- Justification of manual overrides or fixes

---

## Test Case Results

| #  | Test Case Description             | Model Completion Summary                                        | Expected Output Match      | Tab/Esc Count         | Evaluation Summary                                     |
|----|----------------------------------|------------------------------------------------------------------|----------------------------|------------------------|--------------------------------------------------------|
| 1  | Nested tax brackets (prefix)     | Used slab amounts with cumulative sums                          | ⚠️ Partially acceptable    | Tab ×2                | ✅ Logic mostly okay, but numeric constants off        |
| 2  | Lambda even filter (prefix)      | Missed `, numbers))` at first                                   | ❌ Incorrect initially      | Esc ×1, Tab ×2        | ❌ Had to accept despite incorrect result              |
| 3  | Pandas agg (prefix)              | Syntax issues in dictionary and brackets                        | ❌ Invalid dictionary usage | Tab ×2                | ⚠️ Requires manual fix for valid syntax                |
| 4  | Exception raise (prefix)         | Verbose and well-formatted output message                       | ✅ Matches expected         | Tab ×4                | ✅ Good UX improvement                                 |
| 5  | `__str__` method (prefix)        | Included additional salary method and verbose output            | ⚠️ Extra logic included     | Esc ×2, Tab ×3        | ⚠️ Acceptable but unnecessarily extended               |
| 6  | Factorial logic (prefix)         | `return n * factorial(n - 1)`                                   | ✅ Exact match              | Tab ×1                | ✅ Clean and correct                                   |
| 7  | Nested tax (with suffix)         | Syntax errors and malformed structure                           | ❌ Incorrect                | Esc ×4, Tab ×1        | ❌ Accepting flawed output due to no better options    |
| 8  | Lambda filter (with suffix)      | Correct lambda with parentheses                                 | ✅ Matches expected         | Tab ×1                | ✅ Ideal and minimal                                  |
| 9  | Pandas chain (with suffix)       | Used unimported `mean`, `sum`                                   | ❌ Missing import issue     | Tab ×1, Esc ×1        | ⚠️ Logic okay but required manual import intervention |
| 10 | Withdraw logic (with suffix)     | Good flow, user-friendly messages                               | ✅ Matches expected         | Tab ×1                | ✅ Great UX output                                     |
| 11 | Bonus method (with suffix)       | Forgot to return result                                         | ❌ Incomplete logic         | Esc ×3, Tab ×1        | ❌ Output unusable without return keyword              |
| 12 | Factorial (with suffix)          | `return n * factorial(n - 1)`                                   | ✅ Exact match              | Tab ×1                | ✅ Clean and correct                                   |

---

## Summary

- ✅ **Correct Completions:** 5 / 12  
- ⚠️ **Partially Acceptable:** 3  
- ❌ **Incorrect or Incomplete:** 4  
- ⌨️ **Tab Accepts:** 21  
- 🛑 **Esc Rejects:** 13  

---

## Insights

- Model shows strong performance in simple recursion, print statements, and exception handling.
- **Major syntax and return issues** were found in functional and financial logic tasks.
- **HFT format** sometimes fails to provide full-context understanding leading to structural errors.
- Significant Esc count reflects reliability issues in critical sections.

---
