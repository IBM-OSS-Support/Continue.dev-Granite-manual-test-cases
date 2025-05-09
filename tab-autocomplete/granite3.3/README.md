# 🧠 Granite3.3 Models — Code Completion Evaluation Report

## 🔍 Models Evaluated

| Model                             | Template Used | Parameter Size |
|----------------------------------|---------------|----------------|
| `granite3.3:2b-base`             | FIM           | 2B             |
| `granite3.3:8b-instruct`         | FIM           | 8B             |
| `granite3.3:8b-instruct`         | HFT (default) | 8B             |

---

## Detailed model wise reports
- [granite3.3:2b-base FIM](usecases/granite33-2b-base-fim/README.md)
- [granite3.3:8b-instruct FIM](usecases/granite33-8b-instruct-fim/README.md)
- [granite3.3:8b-base HFT](usecases/granite33-8b-instruct-hft/README.md)

---
## ✅ Overall Performance Summary

| Model                      | Correct | Partially Acceptable | Incorrect | Total Tab | Total Esc | Notes |
|---------------------------|--------:|----------------------:|----------:|----------:|----------:|-------|
| `2b-base (FIM)`           | 9       | 2                     | 1         | 21        | 3         | Strong consistency despite smaller size |
| `8b-instruct (FIM)`       | 9       | 2                     | 1         | 24        | 9         | Better logic, occasional repetition bug |
| `8b-instruct (HFT)`       | 5       | 3                     | 4         | 21        | 13        | Most error-prone, poor handling of structure |

---

| #  | Test Case Description              | Expected Outcome Description                            | 2b-base (FIM)        | 8b-instruct (FIM)      | 8b-instruct (HFT)       |
|----|------------------------------------|----------------------------------------------------------|----------------------|------------------------|--------------------------|
| 1  | Nested tax (prefix)               | Simple 3-slab bracket formula                            | ❌ Overcomplicated   | ✅ Minor indent issue  | ❌ Incorrect math        |
| 2  | Lambda filter (prefix)           | `lambda x: x % 2 == 0`                                   | ✅ Correct           | ✅ Correct             | ❌ Wrong comma, fixed    |
| 3  | Pandas chaining (prefix)         | Basic `.agg({})` usage                                   | ✅ Verbose but valid | ✅ Valid               | ⚠️ Brackets messy        |
| 4  | Raise ValueError (prefix)        | Simple exception message                                 | ✅ Correct           | ✅ Correct             | ✅ Correct               |
| 5  | `__str__` method (prefix)        | Employee string representation                           | ⚠️ Slightly off      | ⚠️ Repeats indefinitely| ✅ Acceptable            |
| 6  | Factorial recursion (prefix)     | `return n * factorial(n - 1)`                            | ✅ Correct           | ✅ Correct             | ✅ Correct               |
| 7  | Nested tax (suffix)              | Logic with suffix, proper bracket handling               | ❌ Incorrect logic   | ✅ Correct             | ❌ Misplaced returns     |
| 8  | Lambda filter (suffix)           | `lambda x: x % 2 == 0`                                   | ✅ After Esc retry   | ✅ Correct             | ✅ Correct               |
| 9  | Pandas chaining (suffix)         | Multi-agg with suffix context                            | ⚠️ Verbose           | ✅ (uses np funcs)     | ⚠️ Poorly formatted agg  |
| 10 | Withdraw with print (suffix)     | Fully printed flow with account update                   | ✅ Correct           | ⚠️ Indentation issue  | ✅ Correct               |
| 11 | Bonus method (suffix)            | Return salary-based bonus                                | ✅ Acceptable        | ⚠️ Indent error fixed  | ❌ Missing return stmt   |
| 12 | Factorial (suffix)               | Same as prefix, with suffix                              | ✅ Correct           | ✅ Correct             | ✅ Correct               |

---

## 🔬 Insights & Model Comparisons

### 🧩 Template Format Impact

- **FIM** (Fill-in-the-Middle) clearly outperformed **HFT** (Hole-Filler) across the board.
- FIM handled **prefix + suffix** completions much better than HFT, which often failed in logic-heavy completions.
- HFT exhibited:
  - Misplaced control flow (`else` without matching `if`)
  - Missing return statements
  - Incomplete logic for bonus, pandas chaining, and tax brackets.

### 💡 Correctness vs Acceptability

- Both FIM models delivered **>75% accurate completions**.
- HFT dropped to **~40% correctness**, with notable bugs.
- Some completions were verbose but logically valid, while others needed trimming or manual indentation.
- `8b-instruct (FIM)` was also suggesting good test cases at the end to run on the functions that was filled.

### 👎 Esc Usage as Friction Signal

- Esc count serves as a useful friction signal:
  - `2b-base (FIM)`: **3 Esc presses**
  - `8b-instruct (FIM)`: **9 Esc presses**
  - `8b-instruct (HFT)`: **13 Esc presses**
- High Esc usage with HFT indicates **developer dissatisfaction** and frequent interruption to correct output.

### 💬 UX Issues Observed

- `8b-instruct (FIM)` showed **repeating completions** in some cases (e.g., Employee class).
- All models overgenerated at times, especially on pandas aggregations.
- Indentation bugs were present in multiple completions — mostly recoverable, but a sign of prompt misalignment.

---

## 🏆 Final Ranking

| Rank | Model                    | Reasoning |
|------|--------------------------|-----------|
| 🥇 1 | `granite3.3:2b-base (FIM)`     | Compact, consistent, and low-friction completions |
| 🥈 2 | `granite3.3:8b-instruct (FIM)` | More powerful logic but occasional noise and repetition |
| 🥉 3 | `granite3.3:8b-instruct (HFT)` | Frequent logic errors, high rejection rate |

---

## 📌 Recommendations

- ✅ Prefer **FIM template** for all code completion tasks.
- ✅ Use **2b-base (FIM)** for efficiency-critical environments.
- 🧪 Apply **8b-instruct (FIM)** where richer logic is required, but monitor for repetition bugs.
- ⚠️ Avoid using **8b-instruct (HFT)** as default; not robust enough without better prompt tuning.

---


## 📝 Note

These models were evaluated using a limited and curated set of 12 Python code completion scenarios.  
The test cases were selected to span various real-world programming patterns (e.g., recursion, conditionals, pandas usage), but they do **not comprehensively cover** the entire scope of Python programming.

All observations were based on interactive completions during **a few manual test runs**.  
Performance may vary under different coding environments, datasets, or usage patterns.  
This report is intended to give a directional insight rather than an exhaustive benchmark.

---

---
