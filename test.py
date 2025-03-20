def add_key_value_to_prompt(conversation, key, value):
    """
    Add a key-value pair inside the prompts under key '0'.

    :param conversation: The JSON object to be modified.
    :param key: The key to add inside the prompt of '0'.
    :param value: The value associated with the key.
    :return: The updated JSON object.
    """
    if "0" in conversation and len(conversation["0"]) > 0:
        for prompt in conversation["0"]:
            prompt[key] = value
    return conversation
    
conversation = {
    "0": [
        {
            "name": "MODEL_NAME",
            "date": "timestamp",
            "prompt": [],
            "filename": ""
        }
    ]
}

# Add a new key-value pair
key_to_add = "filename"
value_to_add = "exampleValue"
conversation = add_key_value_to_prompt(conversation, key_to_add, value_to_add)

# Continue processing
print(conversation)