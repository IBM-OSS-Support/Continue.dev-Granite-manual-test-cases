import os
import pyautogui
import time

# Give user time to focus VSCode window
print("You have 5 seconds to focus the VSCode window...")
time.sleep(5)

pyautogui.hotkey('command', 'shift', 'p', interval=0.1)
time.sleep(1)

# Type a command, e.g., 'View: Toggle Terminal'
pyautogui.write('Save Current Session', interval=0.05)
time.sleep(1)
# Press Enter to execute the command
pyautogui.press('enter')

# Wait for the dialog to appear
time.sleep(1)
# Open the folder input text field
pyautogui.hotkey('command', 'shift', 'g', interval=0.1)
time.sleep(1)

outputPath = '../shared_files/'
# Create the folder if it doesn't exist
if not os.path.exists(outputPath):
    os.makedirs(outputPath)

# Type the folder path
pyautogui.typewrite(outputPath, 0.1)
time.sleep(1)
# Press Enter to select the folder
pyautogui.press('enter')
time.sleep(1)


# Select the folder
pyautogui.press('enter')


print("Done interacting with VSCode UI.")