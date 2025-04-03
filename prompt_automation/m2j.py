import json
import re
import os
from datetime import datetime
import glob

def clean_content(content):
    #Remove ">" symbols from the start of each line in the content
    lines = content.split('\n')
    cleaned_lines = [re.sub(r'^>+\s*', '', line) for line in lines]
    return '\n'.join(cleaned_lines)

def parse_md_to_json(filename, MODEL_NAME, timestamp, TIMINGS):
    conversation = {
        "0": [
            {
                "name": MODEL_NAME,
                "date": timestamp,
                "file_name": "",
                "total_time": "",
                "prompt": []
            }
        ]
    }
    
    user_content = None
    assistant_content = None
    current_role = None
    current_content = []
    first_assistant_block_skipped = False
    timing_index = 0
    with open(filename, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    for line in lines:
        line = re.sub(r'^>+\s*', '', line).rstrip()

        assistant_match = re.match(r'^#### _Assistant_\s*$', line)
        user_match = re.match(r'^#### _User_\s*$', line)
        
        if not line:
            continue
            
        if assistant_match or user_match:
            if current_content and current_role:
                content = '\n'.join(line for line in current_content if line.strip())
                content = clean_content(content)
                
                if content and not content.strip().lower() == "/share":
                    if current_role == "User":
                        # If we have previous pair, save it first
                        if user_content is not None and assistant_content is not None:
                            conversation["0"][0]["prompt"].append({
                                "user": user_content,
                                "assistant": assistant_content,
                                "time": TIMINGS[timing_index] if timing_index < len(TIMINGS) else None
                            })
                            timing_index += 1
                        user_content = content
                        assistant_content = None
                    elif current_role == "Assistant" and not first_assistant_block_skipped:
                        first_assistant_block_skipped = True
                    elif current_role == "Assistant" and user_content is not None:
                        assistant_content = content
                        conversation["0"][0]["prompt"].append({
                            "user": user_content,
                            "assistant": assistant_content,
                            "time": TIMINGS[timing_index] if timing_index < len(TIMINGS) else None
                        })
                        timing_index += 1
                        user_content = None
                        assistant_content = None
            
            # Set new role
            current_role = "Assistant" if assistant_match else "User"
            current_content = []
                
        else:
            if line.strip().lower() == "/share":
                continue
            current_content.append(line)
    
    # Handle the last message
    if current_content and current_role:
        content = '\n'.join(line for line in current_content if line.strip())
        content = clean_content(content)
        if content and not content.strip().lower() == "/share":
            if current_role == "Assistant" and user_content is not None:
                conversation["0"][0]["prompt"].append({
                    "user": user_content,
                    "assistant": content,
                    "time": TIMINGS[timing_index] if timing_index < len(TIMINGS) else None
                })
                timing_index += 1
    return conversation

def get_last_created_file(folder_path):
    files = glob.glob(os.path.join(folder_path, '*'))
#    print("LISTED FILES: ", files) 
    if not files:
        return None
    
    files.sort(key=os.path.getctime, reverse=True)  
    return files[0]

def create_output_file(MODEL_NAME, result, file):

    folder_path = os.path.join(os.getcwd(), "code-assist-webUI/code-assist-web/src/prompt-results", MODEL_NAME)
    print("Folder Path: ", folder_path)
    if not os.path.isdir(folder_path):
        print(f"\nThe folder '{MODEL_NAME}' does not exist. Creating it...")
        os.makedirs(folder_path)  
    else:
        print(f"\nThe folder '{MODEL_NAME}' already exists. Adding the JSON file in the folder")
    
    output_filename = folder_path + '/' + MODEL_NAME + '_' + file.split('_')[0].split('/')[1] + '.json'
    # print("OTHER: ", other)
    print("\nFinal JSON file name: ", output_filename)
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
        
def generate_json(MODEL_NAME, TIMINGS):
    
    folder_path = os.path.join('outputfiles')
    file = get_last_created_file(folder_path)
    if file:
        print(f"\nJSON file is being created on the basis of: {file}")
    else:
        print("\nNo files found in the folder.")
        exit(0)
#    print("Value of file: ", file)
    timestamp = file.split('_')[0].split('/')[1]
    result = parse_md_to_json(file, MODEL_NAME, timestamp, TIMINGS)

    if "0" in result and len(result["0"]) > 0:
        for prompt in result["0"]:
            prompt['file_name'] = MODEL_NAME + '_' + timestamp + '.json'
            prompt['total_time'] = sum(TIMINGS)

    create_output_file(MODEL_NAME, result, file)

# 
