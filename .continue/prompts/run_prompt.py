import requests
import yaml

# Function to parse the .prompt file
def parse_prompt_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    # Split content into the configuration part and the user message
    parts = content.split('---')
    
    # Parse the configuration (YAML format)
    config = yaml.safe_load(parts[1].strip())

    # Extract configuration values
    model = config.get('model', 'llama3.2')
    temperature = config.get('temperature', 0.7)
    max_tokens = config.get('max_tokens', 150)  # Default to 150 if -1
    top_p = config.get('top_p', 1.0)
    presence_penalty = config.get('presence_penalty', 0.0)
    frequency_penalty = config.get('frequency_penalty', 0.0)
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
    
    # Return the response from Ollama's API
    if response.status_code == 200:
        #return response.json()['choices'][0]['message']['content']
        return response.text
    else:
        return f"Error: {response.status_code} - {response.text}"

# Main function
def main():
    # Path to your .prompt file
    file_path = '/Users/hariji/repo/py/test1.prompt'

    # Parse the .prompt file
    model, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, user_message = parse_prompt_file(file_path)

    # Get the response from Ollama API
    response = send_to_ollama_api(model, temperature, max_tokens, top_p, presence_penalty, frequency_penalty, user_message)
    
    # Print the response
    print("Response from llama3.2 model:")
    print(response)

if __name__ == "__main__":
    main()
