import pyautogui
import time, os, re
from m2j import generate_json
from simple_term_menu import TerminalMenu
import fetch_model_name
import ollama_server

"""
################################################
#                   MODEL LIST                 #
################################################

1. gpt-4o
2. claude3.5-sonnet
3. granite3.1-xx
4. granite3.2-xx

PLEASE ENSURE SAME MODEL NAME ACROSS ALL PLACES
################################################
"""

MODEL_NAME = "claude3.5-sonnet"
MODEL_TYPE = "NOT ASSIGNED"
sleep_time = 20
first_time = True
TIMINGS = []

def wait_for_log_update(server, keyword="DEBUG [print_timings]           total time"):
    """Wait until the ollama server log shows the specified keyword."""
    while True:
        latest_logs = server.get_latest_logs(10)
        # print("latest_logs: ", latest_logs)
        for log in latest_logs:
            if keyword in log:
                print("Found the log: ", log)
                return log
        print("Waiting for log update...")
        time.sleep(1)

def automate_continue_dev(input_text):
    global first_time, MODEL_NAME, TIMINGS
    try:
        if MODEL_TYPE == 'granite':
            time.sleep(3)
            pyautogui.write(input_text, interval=0.1)
            pyautogui.press('enter')
            pyautogui.press('enter')

            print("\nFetching server logs for updates...")
            log = wait_for_log_update(server)
            print("Returned Log: ", log)
            match = re.search(r'total time\s*=\s*([\d.]+)\s*ms', log)
            TIMINGS.append(match.group(1))
            print("Timings List: ", TIMINGS)
            if first_time == True:
                MODEL_NAME = fetch_model_name.get_model_name()
                print("\nGRANITE MODEL NAME: ", MODEL_NAME)
                first_time = False

        else:
            time.sleep(3)
            pyautogui.write(input_text, interval=0.1)
            pyautogui.press('enter')
            pyautogui.press('enter')
            time.sleep(sleep_time)

    except pyautogui.FailSafeException:
        print("Fail-safe triggered. Mouse clicked away from the chat box.")
    except Exception as e:
        print(f"An error occurred during automation: {e}")

def process_input_file(input_file):
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            for line in file:
                input_text = line.strip()
                print("\nEvaluating Prompt:", input_text)
                print("[INFO]: Please click on the chat box in Continue.dev and stay there!")
                automate_continue_dev(input_text)
    except FileNotFoundError:
        print(f"Error: The file {input_file} was not found.")
    except IOError as e:
        print(f"An error occurred while reading the file: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == '__main__':
    print("HELLOOO")
    # os.system('clear')
    print("######################################################\n\n")
    print("      Please select a file from the below options:        \n\n")
    print("######################################################\n\n")
    options = ["Simple Chat Prompts", "Context Providers", "Exit"]
    terminal_menu = TerminalMenu(options)
    selected_index = terminal_menu.show()
    choice = options[selected_index]

    if selected_index == 0:
        input_file = 'prompts_list.txt'
    elif selected_index == 1:
        input_file = 'context_providers.txt'
    else:
        # os.system('clear')
        print("GOODBYE!")
        exit(0)
 
    # os.system('clear')
    print("######################################################\n\n")
    print("      Please select a file from the below options:        \n\n")
    print("######################################################\n\n")
    options = ["Granite", "Other Models", "Exit"]
    terminal_menu = TerminalMenu(options)
    selected_index = terminal_menu.show()
    choice = options[selected_index]
    
    if selected_index == 0:
        MODEL_TYPE = 'granite'
        print("\nStarting Ollama server...")
        try:
            server = ollama_server.OllamaServer()
            server.start_server()
        except Exception as e:
            print(f"Error starting Ollama server: {e}")

    elif selected_index == 1:
        MODEL_TYPE = 'others'
    else:
        # os.system('clear')
        print("GOODBYE!")
        exit(0)

    # os.system('clear')
    print(f"\nExecuting prompts from {input_file}. The selected model type is: {MODEL_TYPE}")
    print("\n##############################################################################################")
    print(f"\n[WARNING] Please ensure that the model selected in chat box of Continue.dev is of type {MODEL_TYPE}\n")
    print("##############################################################################################")
    try:
        process_input_file(input_file)
        pyautogui.write("/share", interval=0.08)
        pyautogui.press('enter')
        pyautogui.press('enter')
        TIMINGS = list(map(float, TIMINGS))
        generate_json(MODEL_NAME, TIMINGS)
        print("Process completed!!\n")

    except Exception as e:
        print(f"An unexpected error occurred in the main function: {e}")
