# 🧠 Granite Models — Code Completion Evaluation Report

## 🔍 Models Evaluated

| Model                             | Template Used | Parameter Size |
|----------------------------------|---------------|----------------|
| `granite3.3:2b-base`             | FIM           | 2B             |
| `granite3.3:8b-instruct`         | FIM           | 8B             |
| `granite3.3:8b-instruct`         | HFT (default) | 8B             |
| `granite3.2:8b-instruct`         | HFT           | 8B             |

---

## Detailed model-wise reports

- [granite3.3:2b-base FIM](usecases/granite33-2b-base-fim/README.md)
- [granite3.3:8b-instruct FIM](usecases/granite33-8b-instruct-fim/README.md)
- [granite3.3:8b-instruct HFT](usecases/granite33-8b-instruct-hft/README.md)
- [granite3.2:8b-instruct HFT](usecases/granite32-8b-instruct-hft/README.md)

---

## ✅ Overall Performance Summary

| Model                      | Correct | Partially Acceptable | Incorrect | Total Tab | Total Esc | Notes |
|---------------------------|--------:|----------------------:|----------:|----------:|----------:|-------|
| `2b-base (FIM)`           | 9       | 2                     | 1         | 21        | 3         | Strong consistency despite smaller size |
| `8b-instruct (FIM)`       | 9       | 2                     | 1         | 24        | 9         | Better logic, occasional repetition bug |
| `8b-instruct (HFT)`       | 5       | 3                     | 4         | 21        | 13        | Most error-prone, poor handling of structure |
| `3.2:8b-instruct (HFT)`   | 3       | 1                     | 8         | 21        | 27        | Slow responses, high friction, weak suffix completions |

---

### 📊 Per-Case Model Comparison

| #  | Test Case Description              | Expected Outcome Description                            | 2b-base (FIM) | 8b-instruct (FIM) | 8b-instruct (HFT) | 3.2:8b-instruct (HFT) |
|----|------------------------------------|----------------------------------------------------------|----------------|--------------------|--------------------|------------------------|
| 1  | Nested tax (prefix)               | Simple 3-slab bracket formula                            | ❌             | ✅                 | ❌                 | ❌ Garbage syntax      |
| 2  | Lambda filter (prefix)           | `lambda x: x % 2 == 0`                                   | ✅             | ✅                 | ❌                 | ❌ Missing argument     |
| 3  | Pandas chaining (prefix)         | Basic `.agg({})` usage                                   | ✅             | ✅                 | ⚠️                 | ❌ Broken logic         |
| 4  | Raise ValueError (prefix)        | Simple exception message                                 | ✅             | ✅                 | ✅                 | ❌ Bad indentation      |
| 5  | `__str__` method (prefix)        | Employee string representation                           | ⚠️             | ⚠️ Repetition bug  | ✅                 | ⚠️ Added unrelated method |
| 6  | Factorial recursion (prefix)     | `return n * factorial(n - 1)`                            | ✅             | ✅                 | ✅                 | ✅                     |
| 7  | Nested tax (suffix)              | Logic with suffix, proper bracket handling               | ❌             | ✅                 | ❌                 | ❌ Utterly broken       |
| 8  | Lambda filter (suffix)           | `lambda x: x % 2 == 0`                                   | ✅             | ✅                 | ✅                 | ✅                     |
| 9  | Pandas chaining (suffix)         | Multi-agg with suffix context                            | ⚠️             | ✅                 | ⚠️                 | ❌ Messy structure      |
| 10 | Withdraw with print (suffix)     | Fully printed flow with account update                   | ✅             | ⚠️                 | ✅                 | ✅                     |
| 11 | Bonus method (suffix)            | Return salary-based bonus                                | ✅             | ⚠️                 | ❌ Missing return  | ❌ Incomplete           |
| 12 | Factorial (suffix)               | Same as prefix, with suffix                              | ✅             | ✅                 | ✅                 | ✅                     |

---

| #  | Test Case Description              | Expected Outcome Description                            | 2b-base (FIM) | 8b-instruct (FIM) | 8b-instruct (HFT) | 3.2:8b-instruct (HFT) |
|----|------------------------------------|----------------------------------------------------------|----------------|--------------------|--------------------|------------------------|
| 1  | Nested tax (prefix)               | Simple 3-slab bracket formula                            | ❌             | ✅                 | ❌                 | ❌ Garbage syntax      |
| 2  | Lambda filter (prefix)           | `lambda x: x % 2 == 0`                                   | ✅             | ✅                 | ❌                 | ❌ Missing argument     |
| 3  | Pandas chaining (prefix)         | Basic `.agg({})` usage                                   | ✅             | ✅                 | ⚠️                 | ❌ Broken logic         |
| 4  | Raise ValueError (prefix)        | Simple exception message                                 | ✅             | ✅                 | ✅                 | ❌ Bad indentation      |
| 5  | `__str__` method (prefix)        | Employee string representation                           | ⚠️             | ⚠️ Repetition bug  | ✅                 | ⚠️ Added unrelated method |
| 6  | Factorial recursion (prefix)     | `return n * factorial(n - 1)`                            | ✅             | ✅                 | ✅                 | ✅                     |
| 7  | Nested tax (suffix)              | Logic with suffix, proper bracket handling               | ❌             | ✅                 | ❌                 | ❌ Utterly broken       |
| 8  | Lambda filter (suffix)           | `lambda x: x % 2 == 0`                                   | ✅             | ✅                 | ✅                 | ✅                     |
| 9  | Pandas chaining (suffix)         | Multi-agg with suffix context                            | ⚠️             | ✅                 | ⚠️                 | ❌ Messy structure      |
| 10 | Withdraw with print (suffix)     | Fully printed flow with account update                   | ✅             | ⚠️                 | ✅                 | ✅                     |
| 11 | Bonus method (suffix)            | Return salary-based bonus                                | ✅             | ⚠️                 | ❌ Missing return  | ❌ Incomplete           |
| 12 | Factorial (suffix)               | Same as prefix, with suffix                              | ✅             | ✅                 | ✅                 | ✅                     |

---

## 🔬 Insights & Model Comparisons

### 🧩 Template Format Impact

- **FIM** clearly outperformed **HFT** across all models, particularly in suffix-context awareness.
- **HFT completions** often had:
  - Broken syntax (`*expression` or missing `return`)
  - Incorrect or incomplete control structures (`else` logic)
  - Repetition or verbosity with irrelevant blocks

### 💡 Correctness vs Acceptability

- FIM models averaged **75–85% correct completions**.
- HFT-based models hovered below **50% accuracy**, and often required multiple user interventions.
- Model `3.2:8b-instruct (HFT)` performed **worst overall** in suffix-based tasks and showed **sluggish latency**.

### 👎 Esc Usage as Friction Signal

| Model                  | Total Esc Presses |
|------------------------|-------------------|
| `2b-base (FIM)`        | 3                 |
| `8b-instruct (FIM)`    | 9                 |
| `8b-instruct (HFT)`    | 13                |
| `3.2:8b-instruct (HFT)`| 27                |

Esc usage is a strong proxy for model friction. The 3.2:8b model required heavy correction effort despite multiple tabs.

### 💬 UX Notes

- Repetition and overgeneration is seen across all models, but **8b-instruct FIM** was the only one that occasionally tried to generate tests.
- Structural formatting and indentation were frequently buggy in both HFT models.
- `3.2:8b` was notably **slower** in delivering completions — possibly due to weaker tuning or infrastructure inefficiencies.

---

## 🏆 Final Ranking

| Rank | Model                         | Notes |
|------|-------------------------------|-------|
| 🥇 1 | `granite3.3:2b-base (FIM)`     | Most reliable with minimal errors |
| 🥈 2 | `granite3.3:8b-instruct (FIM)` | More expressive, minor repetition |
| 🥉 3 | `granite3.3:8b-instruct (HFT)` | Moderate errors, better than 3.2   |
| 🥄 4 | `granite3.2:8b-instruct (HFT)` | Weakest logic, high rejection rate |

---

## 📌 Recommendations

- ✅ Use **FIM** templating across the board for tab completion tasks.
- 🧠 `2b-base (FIM)` is the best **lightweight + fast** option.
- 🧪 `8b-instruct (FIM)` offers richer completions and logic scaffolding.
- ❌ Avoid **HFT** as default — prone to structural issues and poor suffix support.

---

## 📝 Note

These models were evaluated using a curated but **limited set of 12 Python completion tasks**, designed to simulate common code scenarios like:

- Recursion
- Conditional tax logic
- Lambda/filter/map
- Pandas `.agg()`
- Class methods and bonus logic

This is **not a comprehensive benchmark**, and outcomes may vary under different usage patterns or project complexity.

These evaluations were based on **manual testing** over a few interactive sessions.

---

## 📝 Note

These models were evaluated using a curated but **limited set of 12 Python completion tasks**, designed to simulate common code scenarios like:

- Recursion
- Conditional tax logic
- Lambda/filter/map
- Pandas `.agg()`
- Class methods and bonus logic

This is **not a comprehensive benchmark**, and outcomes may vary under different usage patterns or project complexity.

These evaluations were based on **manual testing** over a few interactive sessions.

---
