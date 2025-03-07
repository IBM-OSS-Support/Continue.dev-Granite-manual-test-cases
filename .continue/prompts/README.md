## To run the prompt file:

-In the chat option of Continue, type @ and select the option "Prompt Files" from the drop down list.

![image](https://github.com/user-attachments/assets/f4faf4b5-8427-4bd9-849a-2ed08a73880a)

-Select the prompt file that is created in the repo [here](https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases/blob/main/.continue/prompts/test_cases.prompt)

![image](https://github.com/user-attachments/assets/c160d913-cc93-4ace-b736-ff2a9e570fbd)

-Write a simple prompt (For example - "Run this file") 

## We can set the parameters for the prompt file in the prompt file itself:

![image](https://github.com/user-attachments/assets/47eef664-6b6f-456a-86b9-a7199a0a9107)

## Automate the execution of prompt file using python script:-
# Pre-requisite :- python must be installed before execute the command

Go to the location where python file is saved.
Open the python file and edit the below values-
1. Url - this value is replaced with running ollama url api.
2. file_path - this value must be override with the path of prompt file which you are going to execute.
To run the prompt file use the below command.
“python3 run_prompt.py >> out.txt”

run_prompt.py - is a python file
Out.txt - is a file name to save the output in txt form.