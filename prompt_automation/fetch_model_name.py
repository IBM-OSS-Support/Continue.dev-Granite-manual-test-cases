import subprocess
import time

def get_model_name():
    timeout = 30  
    start_time = time.time()
    
    print("Waiting to fetch the model name...")

    while time.time() - start_time < timeout:
        elapsed_time = time.time() - start_time
        remaining_time = int(timeout - elapsed_time)
        
        progress = int((elapsed_time / timeout) * timeout)
        progress_bar = '[' + '#' * progress + '-' * (timeout - progress) + ']'
        print(f"\r{progress_bar} {remaining_time} seconds remaining", end="")

        result = subprocess.run(['ollama', 'ps'], capture_output=True, text=True)

        lines = result.stdout.splitlines()

        if len(lines) > 1:
            model_name_line = lines[1].strip()
            
            if model_name_line:
                model_name = model_name_line.split()[0]
                return model_name
        time.sleep(1)

    raise RuntimeError("No Granite model detected. Please check if the model is running.")

# try:
#     model_name = get_model_name()
#     print(f"Model Name: {model_name}")
# except RuntimeError as e:
#     print(str(e))