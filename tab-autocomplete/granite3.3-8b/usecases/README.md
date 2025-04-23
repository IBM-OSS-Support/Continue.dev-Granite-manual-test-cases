# LLM Code Completion Prompts

This repository contains prompt examples for evaluating code completion models (such as Granite-3.3:8B) using two common template strategies:

- **Hole Filler Template (HFT)** (prefix-only completion)
- **Fill In the Middle (FIM)** (prefix and suffix, model fills the gap)

---

## 🔹 Hole Filler Template (HFT) Usage

> In this template, **only the code prefix is provided** (everything before the point where code completion is needed). The model is expected to generate the next logical code block or lines.

### **Instructions for Use:**

1. Open the prompt `prefix-only-usecases.py` file for the scenario you wish to test.
2. **Place your cursor where `# <<< cursor here >>>` appears** (typically at the end of the code prefix).
3. **Trigger tab completion** or use Continue.dev’s autocomplete shortcut.
4. The model will fill in the remainder of the function, logic, or code block.

---

## 🔸 Fill In the Middle (FIM) Usage

> In this template, both a code prefix (before the "hole") and a suffix (after the hole) are provided. The model is expected to generate the code to fill the gap.

### **Instructions for Use:**

1. Open the FIM prompt `fim-usecases.py` file for your desired scenario.
2. The prompt will include:
   - Code before the "hole" (prefix)
   - `# <<< cursor here for FIM >>>` marking where to place your cursor (the start of the hole)
   - Code after the hole (suffix)
3. **Place your cursor at the indicated location.**
4. **Trigger autocomplete/tab completion.**
5. The model should generate only the missing logic or code between the prefix and suffix.
