import requests
import json
import os

def read_config(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return None

    with open(file_path, 'r') as file:
        config_data = json.load(file)

    return config_data

# Function to parse the .prompt file
def parse_prompt_file(file_path, config):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return None

    with open(file_path, 'r') as file:
        content = file.read()
    #with open(file_path, 'r') as file:
       # content = file.read()

    # Split content into the configuration part and the user message
    parts = content.split('---')
    
    # Parse the configuration (YAML format)
    #config = yaml.safe_load(parts[1].strip())

    # Extract configuration values
    model = config_data['models'][0]['model']
    temperature = config_data['models'][0]['completionOptions']['temperature']
    max_tokens = config_data['models'][0]['completionOptions']['maxTokens']
    top_p = config_data['models'][0]['completionOptions']['topP']
    presence_penalty = config_data['models'][0]['completionOptions']['presencePenalty']
    frequency_penalty = config_data['models'][0]['completionOptions']['frequencyPenalty']
    user_message = parts[2].strip().replace('<user>', '').strip()
    
    return model, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, user_message

# Function to send the request to Ollama's API (local or cloud-based endpoint)
def send_to_ollama_api(model, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, user_message):
    url = 'http://localhost:11434/api/chat'  # Ollama's local API endpoint (adjust if using cloud)
    
    headers = {
        'Content-Type': 'application/json',  # No token needed for Ollama
    }

    # Construct the payload for the request
    payload = {
        'model': model,
        'temperature': temperature,
        'max_tokens': max_tokens if max_tokens != -1 else 150,  # Replace -1 with a valid number
        'top_p': top_p,
        'presence_penalty': presence_penalty,
        'frequency_penalty': frequency_penalty,
        'messages': [
            {"role": "system", "content": "You are a friendly assistant."},  # System message
            {"role": "user", "content": user_message}  # User message
        ]
    }
    
    # Send the request to Ollama's API
    response = requests.post(url, json=payload, headers=headers)
    
    # Check if the request was successful (HTTP 200)
    if response.status_code == 200:
        try:
            formatted_text = format_json(response.text)
            # Attempt to parse the response as JSON
            return append_content(json.loads(formatted_text)) # This will return a Python dictionary (JSON)
        except json.JSONDecodeError:
            # Handle the case where the response is not valid JSON
            return f"Error: Response is not in valid JSON format. Response content: {formatted_text}"
    else:
        return f"Error: {response.status_code} - {response.text}"

def format_json(text):
    # Split the text into lines
    lines = text.splitlines()

    # Add a comma at the end of each line except the last one
    formatted_lines = [line + ',' if i < len(lines) - 1 else line for i, line in enumerate(lines)]

    # Join the lines with a newline character and wrap with square brackets
    formatted_text = '[\n' + '\n'.join(formatted_lines) + '\n]'

    return formatted_text

def append_content(json_data):
    # Initialize an empty list to store content values
    content_list = []

    # Loop through each item in the JSON array
    for item in json_data:
        # Check if 'message' and 'content' keys exist in the current item
        if 'message' in item and 'content' in item['message']:
            # Append the content value to the list
            content_list.append(item['message']['content'].strip())

    # Join the content values into a single line with space separating them
    combined_content = ' '.join(content_list)
    combined_content = '{\n"name":"'+item['model'].strip()+'",\n"created_at":"'+item['created_at'].strip()+'",\n"prompt": \n{\t"'+item['message']['role'].strip()+'":"' + combined_content+'"\n}}'
    return combined_content

config_file_path = '/Users/hariji/.continue/config.json'
config_data = read_config(config_file_path)

# Function to process multiple prompt files
def process_multiple_prompts(prompt_files):
    print('[')
    count=0
    for prompt_file in prompt_files:
        count = count+1
        if os.path.exists(prompt_file):
            # Parse the .prompt file
            model, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, user_message = parse_prompt_file(prompt_file, config_data)

            # Get the response from Ollama API
            response = send_to_ollama_api(model, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, user_message)

            # Print the response (it should now be a Python dictionary)
            if count != len(prompt_files):
                print(response+',')  # This will print the response as a Python dictionary (JSON)
            else:
                print(response)
        else:
            print(f"Error: {prompt_file} does not exist.")
    print(']')

# Main function
def main():
    if config_data:
    # List of .prompt files to process
        prompt_files = [
            '/Users/hariji/repo/Continue.dev-Granite-manual-test-cases/.continue/prompts/lambda.prompt',
            '/Users/hariji/repo/Continue.dev-Granite-manual-test-cases/.continue/prompts/optimize.prompt',
        ]

    # Process each prompt file
    process_multiple_prompts(prompt_files)

if __name__ == "__main__":
    main()
