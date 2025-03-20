import pyautogui
import time, os
from m2j import generate_json
from simple_term_menu import TerminalMenu
import fetch_model_name

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
first_time = False

def automate_continue_dev(input_text):
    global first_time, MODEL_NAME
    try:
        if first_time == False and MODEL_TYPE == 'granite':
            first_time = True
            time.sleep(3)
            pyautogui.write(input_text, interval=0.1)
            pyautogui.press('enter')
            pyautogui.press('enter')
            time.sleep(sleep_time)

            MODEL_NAME = fetch_model_name.get_model_name()
            print("\nGRANITE MODEL NAME: ", MODEL_NAME)

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
    os.system('clear')
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
        os.system('clear')
        print("GOODBYE!")
        exit(0)
 
    os.system('clear')
    print("######################################################\n\n")
    print("      Please select a file from the below options:        \n\n")
    print("######################################################\n\n")
    options = ["Granite", "Other Models", "Exit"]
    terminal_menu = TerminalMenu(options)
    selected_index = terminal_menu.show()
    choice = options[selected_index]
    
    if selected_index == 0:
        MODEL_TYPE = 'granite'
    elif selected_index == 1:
        MODEL_TYPE = 'others'
    else:
        os.system('clear')
        print("GOODBYE!")
        exit(0)

    os.system('clear')
    print(f"\nExecuting prompts from {input_file}. The selected model type is: {MODEL_TYPE}")
    print("\n##############################################################################################")
    print(f"\n[WARNING] Please ensure that the model selected in chat box of Continue.dev is of type {MODEL_TYPE}\n")
    print("##############################################################################################")
    try:
        process_input_file(input_file)
        pyautogui.write("/share", interval=0.08)
        pyautogui.press('enter')
        pyautogui.press('enter')
        generate_json(MODEL_NAME)
        print("Process completed!!\n")

    except Exception as e:
        print(f"An unexpected error occurred in the main function: {e}")
