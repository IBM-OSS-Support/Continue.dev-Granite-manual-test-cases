import pyautogui
import time
from m2j import generate_json

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

MODEL_NAME = "gpt-4o"
sleep_time = 5

def automate_continue_dev(input_text):
    try:
        time.sleep(5)
        pyautogui.write(input_text, interval=0.05)
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
    input_file = 'prompts_list.txt'
    print(f"\nExecuting prompts from {input_file}")
    print("##############################################################################################")
    print(f"\n[WARNING] Please ensure that the model selected in chat box of Continue.dev is {MODEL_NAME}\n")
    print("##############################################################################################")
    try:
        process_input_file(input_file)
        pyautogui.write("/share", interval=0.08)
        pyautogui.press('enter')
        pyautogui.press('enter')
        generate_json(MODEL_NAME)
    except Exception as e:
        print(f"An unexpected error occurred in the main function: {e}")
