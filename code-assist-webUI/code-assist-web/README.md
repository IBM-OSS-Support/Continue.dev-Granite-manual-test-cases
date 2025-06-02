
<h3 align="center">
    <img width="420" src="https://ibm-oss-support.github.io/Continue.dev-Granite-manual-test-cases/ibm-code-assist-logo.svg" alt="IBM Logo"/>
</h3>

A modern web interface for evaluating and comparing AI models—especially Granite models—on benchmark datasets like BigCodeBench. 
The interface enables detailed model performance comparisons, log analysis and leaderboard views.

## 🌟 Features

### ✅ Model Comparison UI
- Side-by-side comparison of Granite/Ollama models
- Response time metrics and log analysis
- Searchable execution logs with metadata
- Easy switching between question sets

### 📊 Benchmark Leaderboards
- BigCodeBench performance rankings
- Pass@1 scores for top models (GPT-4, Claude, etc.)
- Difficulty level toggles (Easy/Hard)

### 💻 Accessing the IBM Code Assist Web UI

You have two options to access the IBM Code Assist Web UI:

#### 1. Use the Prebuilt Version
-  Access the prebuilt UI directly at:
   [ <a href="https://ibm-oss-support.github.io/Continue.dev-Granite-manual-test-cases/" target="_blank">Open IBM Code Assist Web UI ↗</a> ]

#### 2. Run the UI Locally
-  You can also run the UI locally by following the setup instructions below [ <a href="#installation"> Installation </a> ].

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm (v8+)

*Note: Make sure you have Node.js and npm installed before running the above commands.*

### Installation
```bash
git clone https://github.com/IBM-OSS-Support/Continue.dev-Granite-manual-test-cases
```
Navigate to the web UI directory
```bash
cd Continue.dev-Granite-manual-test-cases/code-assist-webUI/code-assist-web
```
Install Dependencies
```bash
npm install
```
Running Locally
```bash
npm start
```
The app will be available at <a href="http://localhost:3000">http://localhost:3000</a>.

Production Build
```bash
npm run build
```
*NB: Prior to committing code, it is essential to build.*

## 🛠 Tech Stack
| Category              | Technology                      | Purpose           |
|-----------------------|---------------------------------|-------------------|
| **Frontend**          | React 18                        | UI Components     |
|                       | TypeScript                      | Type Safety       |
|                       | Redux Toolkit                   | State Management  |
|                       | React Router                    | Navigation        |
| **Styling**           | Carbon Design                   | IBM Design System |
|                       | SCSS Modules                    | Custom Styles     |
| **Build**             | Webpack                         | Bundling          |
|                       | Babel                           | Transpilation     |
| **Backend**           | Node.js                         | Runtime           |
|                       | Express                         | API Routes        |

## 🌐 Web UI
Experience the interactive model comparison interface with these key features:
- Real-time side-by-side model outputs
- Filterable execution logs
- Dynamic leaderboard views
- Responsive design across devices

Access the Web UI here: [ <a href="https://ibm-oss-support.github.io/Continue.dev-Granite-manual-test-cases/" target="_blank">Open IBM Code Assist Web UI ↗</a> ]


## 📄 License
Internal IBM OSS Support – shared for research and benchmarking use.

## 📝 Contributing
Contributions are welcome! Please feel free to submit pull requests or issues.

## 📬 Contact
For questions or support, please reach out via the GitHub issues page.