import subprocess
import os
import time
from datetime import datetime
import signal
import psutil
from typing import Optional

class OllamaServer:
    def __init__(self):
        os.environ['OLLAMA_DEBUG'] = '1'
        self.log_dir = 'logs'
        self.current_log_file = None
        self.process = None
        
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)

    def start_server(self) -> bool:    
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.current_log_file = f'{self.log_dir}/ollama_server_{timestamp}.log'
        
        if self._is_ollama_running():
            print("Warning: Ollama server is already running. Stopping and restarting...")
            self._kill_existing_server()
            time.sleep(3)
        
        try:
            with open(self.current_log_file, 'w') as f:
                self.process = subprocess.Popen(
                    ['ollama', 'serve'],
                    stdout=f,
                    stderr=subprocess.STDOUT,
                    universal_newlines=True
                )

            time.sleep(10)            
            print(f"Ollama server started. Process ID: {self.process.pid}")
            print(f"Server logs are being written to: {self.current_log_file}")
            return True
            
        except Exception as e:
            print(f"Error starting ollama server: {str(e)}")
            return False

    def get_latest_logs(self, num_lines: int = 10) -> list:
        """Get the most recent lines from the server log"""
        if not self.current_log_file:
            return []
        
        try:
            with open(self.current_log_file, 'r') as f:
                lines = f.readlines()
                return lines[-num_lines:]
        except Exception as e:
            print(f"Error reading logs: {str(e)}")
            return []

    def search_logs(self, search_term: str) -> list:
        """Search for specific terms in the log file"""
        print("To be searched: ", search_term)
        if not self.current_log_file:
            return []
        
        matching_lines = []
        try:
            with open(self.current_log_file, 'r') as f:
                for line in f:
                    if search_term in line:
                        matching_lines.append(line.strip())
            return matching_lines
        except Exception as e:
            print(f"Error searching logs: {str(e)}")
            return []

    def stop_server(self):
        """Stop the ollama server"""
        if self.process:
            self.process.terminate()
            print("Ollama server stopped.")
        self._kill_existing_server()

    def _is_ollama_running(self) -> bool:
        for proc in psutil.process_iter(['name']):
            if 'ollama' in proc.info['name']:
                return True
        return False

    def _kill_existing_server(self):
        """Kill any existing ollama processes"""
        for proc in psutil.process_iter(['name']):
            if 'ollama' in proc.info['name']:
                proc.kill()
