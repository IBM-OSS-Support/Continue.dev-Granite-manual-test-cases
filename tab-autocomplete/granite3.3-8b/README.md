# Granite-3.3:8B — Code Completion Evaluation  
# Comparison of Hole Filler Template vs. Fill In the Middle Template

** Models used for the analysis: Granite3.3:8b-instruct, Granite3.2:8b-instruct**

---

## 📒 **Appendix: Prompt Design (for Reference)**

- **Hole Filler Template:**  
  Prefix only; cursor at end of code block. Prompts used: [prefix-only-usecases.py](usecases/prefix-only/prefix-only-usecases.py)
- **FIM Template:**  
  Prefix (before hole), Suffix (after hole), cursor at the gap. See attached prompt breakdowns for exact examples. Prompts used: [fim-usecases.py](usecases/fim/fim-usecases.py)

---

## ✅ Executive Summary

- **Hole Filler Template (HFT):**  
  - *Strengths:* Reliable for sequential code completions, strong with Python syntax and functional code, robust for simple to moderately complex code.
  - *Weaknesses:* Prone to hallucinations in structured/multi-branch logic, verbose in certain scenarios.

- **Fill In the Middle (FIM):**  
  - *Strengths:* Excels at filling isolated code holes (e.g., lambdas, recursion, exception logic), ideal for small focused completions, integrates well in refactoring workflows.
  - *Weaknesses:* Struggles with complex, multi-branch logic and structural completions (e.g., tax slabs, pandas aggregations, OOP methods); sometimes produces incomplete or vague output.

- **Granite3.2 HFT:**  
  - *Strengths:* Performs well on simple recursion and lambda logic.
  - *Weaknesses:* Struggles with pandas APIs, exception handling, and multi-branch logic. Regression evident when compared to Granite3.3.

---

## 📊 Evaluation Summary Table

| Test Case                                | Granite3.3 HFT                                 | Granite3.3 FIM                             | Granite3.2 HFT                             |
|-------------------------------------------|------------------------------------------------|--------------------------------------------|---------------------------------------------|
| 1. Nested Conditions (Tax Slabs)          | ⚠️ Partial: Logic mismatch                      | ❌ Broken: Dead code, syntax error          | ❌ Broken: Hallucinated slabs, syntax error  |
| 2. Lambda + Filter                        | ✅ Excellent: Clean, correct, idiomatic         | ✅ Excellent: Clean, correct, idiomatic     | ✅ Correct: Slight delay in full completion  |
| 3. Pandas Chaining                        | ✅ Good: Uses NamedAgg                          | ❌ Vague: "all columns" output              | ❌ Broken: SQL dicts, malformed, unusable    |
| 4. Exception Handling with Custom Message | ✅ Solid: Verbose but correct                   | ✅ Excellent: Clean, concise                | ❌ No completion at all                     |
| 5. Class with Dunder/Bonus                | ✅ Good: Correct methods and logic              | ❌ Broken: Incomplete, missing return       | ⚠️ Partial: Good `__str__`, missing bonus    |
| 6. Recursive Function (Factorial)         | ✅ Excellent: Canonical recursion               | ✅ Excellent: Canonical recursion           | ✅ Excellent: Canonical recursion            |

---

## 📝 Detailed Comparison by Use Case

### 1️⃣ Nested Conditions (Tax Slabs)

- **Hole Filler:**  
  Partial logic, hardcodes slab values, does not fully respect business logic, but structure is valid Python.
- **FIM:**  
  Misses a whole branch, inserts dead code, and outputs syntactically invalid Python.
- **Granite3.2 HFT:** Outputs syntax error (`*` expression), hallucinated slab ranges (1.5M, 2M), and unreachable blocks.

### 2️⃣ Lambda + Filter

- **Hole Filler:**  
  Generates a correct, idiomatic lambda filter for even numbers.
- **FIM:**  
  Also generates correct lambda. Both modes perform equally well.
- Granite3.2 required a spacebar nudge for the closing brackets but otherwise fine.

### 3️⃣ Pandas Chaining

- **Hole Filler:**  
  Uses advanced API (`NamedAgg`), correct overall structure, only minor formatting issues.
- **FIM:**  
  Produces non-Python output ("all columns"), does not provide a real aggregation statement.
- **Granite3.2:** Injects SQL-like syntax in place of pandas, and ends with malformed junk tokens.

### 4️⃣ Exception Handling with Custom Messages

- **Hole Filler:**  
  Robust, verbose, but logic is correct.
- **FIM:**  
  Clean, concise, and correct — in fact, more succinct than HFT. Sometimes required manual cursor placement at line start for FIM to work.
- **Granite3.2** fails to even generate basic exception logic.

### 5️⃣ Class Definitions with Dunder and Bonus

- **Hole Filler:**  
  Generates correct __init__ and __str__. Implements calculate_bonus logic as intended (salary check, bonus calculation, returns correct value). Minor verbosity at end, but not incorrect. Solid performance for both OOP syntax and business logic.
- **FIM:**  
  Output is incomplete, missing both condition and return. Fails to provide usable code for this scenario.
- **Granite3.2:** Outputs a good `__str__`, but omits `calculate_bonus()` entirely.

### 6️⃣ Recursive Logic

- **Hole Filler:**  
  Outputs canonical recursive implementation; perfect.
- **FIM:**  
  Same as HFT; perfect recursion.
- **Granite3.2:** Outputs the correct recursion.

---

## 🟢 Strengths & 🔴 Weaknesses

### Hole Filler Template (HFT)

**Strengths:**
- Good at classic code completion and generating boilerplate or sequential code.
- Improved OOP handling vs. 3.2.
- Handles simple functions, recursion, and basic functional programming patterns well.
- Can generate complex API calls if context is linear.
- Excels at both classic and OOP code completions, including dunder methods and conditional logic inside methods.


**Weaknesses:**
- Hallucinates or fumbles structured/branching logic.
- Tends to generate verbose code (especially with print statements).

### Fill In the Middle (FIM) Template

**Strengths:**
- Excels at targeted, in-place code hole filling (e.g., filling in a lambda, a recursive call, or a single exception raise).
- More concise for isolated code blocks.
- Integrates well in a refactoring workflow or patch-based code editing.

**Weaknesses:**
- Unreliable for multi-branch, multi-step, or structural completions (e.g., tax slab logic, pandas aggregations, full method bodies).
- Sometimes produces vague or invalid output when the required logic is complex.
- Suffers on OOP patterns and logic-heavy completions.

---

## ⚖️ **Overall Verdict**

- **For most real-world developer workflows:**  
  - Use **Hole Filler Template** for general code completion, larger blocks, or full function/method generation.
  - Use **FIM Template** for targeted patching, simple insertions, or automated refactoring tasks that require context before and after the hole.

- **Model Quality:**  
  - Granite-3.3:8B is strong on simple/medium code completion, recursion, lambdas, and straightforward exception logic in both modes.
  - It needs improvement in class structure, complex branching, and context-heavy or "abstract" tasks (like custom aggregation).
  - Granite3.2 shows significant regressions and is not recommended for production developer workflows requiring structured logic or completeness.

---

## 📌 **Recommendations**

- **Use Case Fit:**  
  - **Hole Filler:** For new function writing, classic autocomplete, or when the task is to finish a code block given the start.
  - **FIM:** For editing/filling gaps in the middle of existing code, quick patching, or tight refactoring loops.
---
