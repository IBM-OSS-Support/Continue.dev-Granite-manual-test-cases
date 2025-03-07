## This project contains testcases for VS Code Granite Project.

The main folder has the following files:

1. [SUMMARY.md](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/blob/main/SUMMARY.md) has a table of ranked results focusing on accuracy and precision, as well as a brief summary for each model for how well they performed.
   SUMMARY10Models.md is a more comprehensive comparison

3. [test-cases](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/blob/main/test-cases) has the 10 questions/scenarios where we are testing against the following models:

- Granite-code:8b-instruct (and different tags)
- granite3-dense:8b (and different tags)
- Llama3.1:8b
- Codestral-Mamba:7b
- Starcoder2:7b

3. Codes: [documentation.py](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/blob/main/documentation.py), [documentation_with_bugs.py](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/blob/main/documentation_with_bugs.py) and [code_to_optimize.py](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/blob/main/code_to_optimize.py) are used in the 10 questions/scenarios for testing.

4. The [chat-results](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/tree/main/chat-results) folder contains the output for each iteration. We run the 10 scenarios in sequence 3 times to measure consistency/precision.

5. [documentation-results](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/tree/main/documentation-results) are from a previous test for documenting code that is now question/scenario #9 in the [test-cases](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/blob/main/test-cases).

Execute prompt files using `run_multi_prompt.py` script to execute a multi-prompt test case. The script takes two arguments: `prompt_file_path` and `config_file_path`. The output directory is used to store the generated chat logs.
Execute the below command to run the script:
python3 run_multi_prompt.py >> out.json