# **IBM Code Assist Web UI Project**
## Overview
This project is a testing suite for the VS Code Granite Project. It focuses on manual test cases and evaluations of different models against a set of scenarios/questions.

## Purpose
The main goals of this project are:

- To evaluate the performance of various models (Granite-code:8b-instruct, granite3-dense:8b, Llama3.1:8b, Codestral-Mamba:7b, Starcoder2:7b) against specific test cases.
- To measure the accuracy, precision, and consistency of these models in handling the given scenarios.

## Key Features
- Manual test case evaluation
- Comparison of different AI models
- Data visualization for model performance
- User-friendly interface for selecting and comparing models

## Technologies Used
- Python (for backend operations)
- React (for frontend UI)
- TypeScript (for enhanced type safety)
- Various libraries for data processing and visualization

## Project Structure
The project is organized into several directories:

- chat-results: Stores output for each iteration of running scenarios.
- code-assist-webUI: Contains the web UI component.
- context-providers: Houses context provider related files.
- docs: Includes documentation related files.
- features: Contains interest calculator and loan manager related files.
- outputfiles: Stores session markdown files.
- tasks: Contains file I/O and manager related files.
- test-code: Scripts for data cleaning, feature creation, regression, etc.
- tests: Test files for file I/O and manager.
- utils: Contains validation related files.

## Getting Started
To run the project locally:

1) Clone the repository (git clone https://github.com/IBM-OSS-Support/IBM-Code-Assist-Web-UI.git)
2) Install dependencies (npm install)
3) Run the development server (npm start)
4) Access the application via localhost

## Contributing
Contributions are welcome! Please feel free to submit pull requests or issues.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Special thanks to the VS Code team for providing the Granite Project models.
- Thanks to all contributors who have helped shape this project.
