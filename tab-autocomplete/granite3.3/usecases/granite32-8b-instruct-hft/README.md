# Granite3.2:8b-instruct (HFT) — Code Completion Evaluation Report

## Overview

This report evaluates the code completion performance of the `granite3.2:8b-instruct` model using the **Hole-Filler Template (HFT)** across 12 unified Python code test cases. Each test case was assessed for:

- Accuracy of the model's code completion
- Alignment with expected logic
- Tab (accept) and Esc (reject) behavior
- Structural and syntactic quality of completions

> ⚠️ Note: These models were evaluated on a curated but limited set of examples and use cases. The results reflect performance on those specific tasks and should not be treated as a comprehensive measure of the model's full Python capabilities.

---

## Test Case Results

| #  | Test Case Description                     | Model Completion Summary                                           | Expected Completion                         | Tab/Esc Count       | Evaluation |
|----|-------------------------------------------|--------------------------------------------------------------------|---------------------------------------------|---------------------|------------|
| 1  | Nested tax brackets (prefix)              | `*(income - 1000000) * 0.2` with missing `return`, bad indentation | `return (income - 500000) * 0.1`             | Esc ×3              | ❌ Incorrect syntax and indentation |
| 2  | Lambda even filter (prefix)               | `lambda x: x % 2 == 0` but missing `, numbers))`                   | `lambda x: x % 2 == 0, numbers`              | Esc ×2, Tab         | ❌ Semantically wrong, missing argument |
| 3  | Pandas chaining with agg (prefix)         | Nonsensical `.apply` inside `.agg`                                | Simple dict like `{"value": "sum"}`         | Tab                 | ❌ Structurally broken |
| 4  | Withdraw logic (prefix)                   | Syntax issues, improper indentation                                | Valid `raise` and balance deduction flow     | Tab ×2, Esc ×4      | ❌ Sloppy indentation and logic |
| 5  | `__str__` + unrelated tax method (prefix) | Included extraneous `calculate_tax()`                              | Just a clean `__str__`                       | Tab ×2              | ⚠️ Overcomplete but valid |
| 6  | Recursive factorial (prefix)              | Correct recursive logic                                            | Same                                        | Tab ×2              | ✅ Correct |
| 7  | Nested tax (suffix)                       | Messy `else` and broken syntax                                     | Clean slab branching                         | Esc ×5, Tab ×2      | ❌ Poor control flow |
| 8  | Lambda filter (suffix)                    | `lambda x: x % 2 == 0`                                             | Same                                        | Tab ×1              | ✅ Correct |
| 9  | Pandas chaining (suffix)                  | Invalid nested dict + random tokens                               | Simple dict with summary functions           | Tab ×2, Esc ×2      | ❌ Garbage structure |
| 10 | Withdraw logic (suffix)                   | Valid transaction block                                            | Same                                        | Tab ×1              | ✅ Correct |
| 11 | Bonus calculation (suffix)                | Logic missing `return` statement                                  | Should return a computed value              | Esc ×3              | ❌ Incomplete logic |
| 12 | Recursive factorial (suffix)              | Correct                                                             | Same                                        | Tab ×1              | ✅ Correct |

---

## Summary

- ✅ **Correct Completions:** 3 / 12
- ⚠️ **Partially Acceptable:** 1
- ❌ **Incorrect:** 8
- ⌨️ **Tab Accepts:** 20
- 🛑 **Esc Rejects:** 25

---

## Observations

- 🔻 **Major weaknesses in handling suffix-based FIM tasks**, especially tax bracket logic and pandas operations.
- 🔻 Many completions were syntactically **broken** or **illogically structured**, particularly with control flow and dictionary formatting.
- 🔻 Even when the semantic meaning was close, indentation and formatting often made the code unusable.
- ⚠️ Simple constructs like **recursive functions** and **lambdas** performed reasonably well.
- 🐢 **Response latency** was notably **higher** than in other evaluated models.

---


