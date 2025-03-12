import os

model_name = "claude3.5-sonnet"
current_directory = os.getcwd()
folder_path = os.path.join(os.getcwd(), "code-assist-webUI/code-assist-web/src/prompt-results", model_name)

print("Folder Path: ", folder_path)

if not os.path.isdir(folder_path):
    print(f"The folder '{model_name}' does not exist. Creating it...")
    os.makedirs(folder_path)  # Create the folder if it doesn't exist
else:
    print(f"The folder '{model_name}' already exists.")
