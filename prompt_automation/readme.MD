# Prompt Automation

This project automates interactions with the continue.dev extension on VS-Code and processes output logs to generate usable outputs. It involves running models, fetching logs, and generating JSON output based on these logs.

## Overview

The project consists of several scripts that work together to facilitate automation of running prompts on Visual Studio Code. It uses the `pyautogui` library for GUI automation tasks and relies on logging and subprocess management for interacting with the `ollama` server.


## Files and Their Descriptions

### `fetch_model_name.py`
This script is responsible for fetching the model name using the `ollama` command-line interface. It tries to retrieve and return the name of a running model within a timeout period:
- **Functionality**: Runs `ollama ps` to list models and fetches the name from the result.

### `guirunner.py`
This script provides automation for GUI operations such as sending input to `Continue.dev`. It waits for server logs to update, processes input files, and initiates model interactions:
- **Functions**:
  - `wait_for_log_update`: Waits for the appearance of a specific keyword in the server logs.
  - `automate_continue_dev`: Automates input typing in `Continue.dev` and handles server logs.
  - `process_input_file`: Opens and processes each line from an input text file, feeding it to Continue.dev.

### `m2j.py`
Handles JSON output creation from the logs:
- **Functionality**: Parses markdown logs and generates JSON files. Maintains timing information for each entry and stores resultant JSON files in structured directories.
- **Current Format of Logs**: 
    {
    "0": [
    {
      "name": "MODEL-NAME",
      "date": "DATE-OF-RUN",
      "file_name": "MODEL-NAME_DATE-OF-RUN.json",
      "total_time": "TOTAL TIME OF ALL THE PROMPTS",
      "prompt": [
        {
          "user": "prompt1",
          "assistant": "result1",
          "time": "Time of prompt1"
        },
        {
          "user": "prompt2",
          "assistant": "result2",
          "time": "Time of prompt2"
        }
      ]
    }
  ]
}
}

### `ollama_server.py`
Manages the `ollama` server processes:
- **Functionality**: Initializes and starts/stops the server process, logs the server's output, and provides utility methods to query log content.

### Key Dependencies
- **Python Libraries**: `subprocess`, `pyautogui`, `psutil`, `time`, `re`, `os`, `glob`, `json`.
- **Tools**: `ollama` command-line interface for interacting with models.

## Running the Application

1. **Setup**: Ensure any dependencies required by the scripts (`pyautogui`, `psutil`, `glob`, etc.) are installed.
2. **Executing Scripts**: Run the `guirunner.py` script as the main entry point to start the automation process. It will handle interactions based on the model and input files you choose.
3. **JSON Output**: After execution, JSON files containing processed prompts and timings are generated in the specified directory.

## Troubleshooting

- **Model Not Detected**: If the `fetch_model_name.py` raises a `RuntimeError`, ensure your models are running and that `ollama` is properly configured.
- **Server Logs**: Check the `logs` directory for server log output and error reporting.

## Contributing

Contributions to enhance the automation or add features are welcome. Please ensure any proposed changes are tested thoroughly.
