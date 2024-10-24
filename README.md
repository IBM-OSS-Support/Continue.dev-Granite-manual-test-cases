## This project contains testcases for VS Code Granite Project.

The main folder has the following files:

1. [SUMMARY.md](https://github.com/IBM-GC/vscode-granite-testcases/blob/main/SUMMARY.md) has a table of ranked results focusing on accuracy and precision, as well as a brief summary for each model for how well they performed.

2. [test-cases](https://github.com/IBM-GC/vscode-granite-testcases/blob/main/test-cases) has the 10 questions/scenarios where we are testing against the following models:

- Granite-code:8b-instruct
- Granite-code:8b-dense-instruct
- Llama3.1:8b
- Codestral-Mamba:7b
- Starcoder2:7b

3. Codes: [documentation.py](https://github.com/IBM-GC/vscode-granite-testcases/blob/main/documentation.py), [documentation_with_bugs.py](https://github.com/IBM-GC/vscode-granite-testcases/blob/main/documentation_with_bugs.py) and [code_to_optimize.py](https://github.com/IBM-GC/vscode-granite-testcases/blob/main/code_to_optimize.py) are used in the 10 questions/scenarios for testing.

4. The [chat-results](https://github.com/IBM-GC/vscode-granite-testcases/tree/main/chat-results) folder contains the output for each iteration. We run the 10 scenarios in sequence 3 times to measure consistency/precision.

5. [documentation-results](https://github.com/IBM-GC/vscode-granite-testcases/tree/main/documentation-results) are from a previous test for documenting code that is now question/scenario #9 in the [test-cases](https://github.com/IBM-GC/vscode-granite-testcases/blob/main/test-cases).