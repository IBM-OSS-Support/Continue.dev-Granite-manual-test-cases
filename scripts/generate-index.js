const fs = require('fs');
const path = require('path');

const PROMPT_RESULTS_DIR = path.join(__dirname, '../code-assist-webUI/code-assist-web/src/prompt-results');
const LOGS_DIR = path.join(__dirname, '../logs'); // Directory for logs
const INDEX_FILE = path.join(PROMPT_RESULTS_DIR, 'index.json');
const LOGS_JSON_FILE = path.join(LOGS_DIR, 'logs.json'); // Path for the logs.json

function generateIndex() {
    const index = {};

    // Process model directories in prompt-results
    const modelDirs = fs.readdirSync(PROMPT_RESULTS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    modelDirs.forEach(modelDir => {
        const modelPath = path.join(PROMPT_RESULTS_DIR, modelDir);

        const files = fs.readdirSync(modelPath)
            .filter(file => file.endsWith('.json') && file !== 'index.json');

        if (files.length > 0) {
            index[modelDir] = files
                .sort((a, b) => b.localeCompare(a)) // Sort files
                .map(file => `${modelDir}/${file}`);
        } else {
            console.warn(`⚠️ No valid JSON files found in ${modelDir}`);
        }
    });

    // Process logs directory for log files
    const logFiles = fs.readdirSync(LOGS_DIR)
        .filter(file => file.endsWith('.log'));

    if (logFiles.length > 0) {
        // Write the list of log files to logs.json
        const logsIndex = logFiles
            .sort((a, b) => b.localeCompare(a)) // Sort files
            .map(file => `logs/${file}`);

        // Ensure the logs.json file exists and is written
        if (!fs.existsSync(LOGS_DIR)) {
            fs.mkdirSync(LOGS_DIR, { recursive: true });
        }

        fs.writeFileSync(LOGS_JSON_FILE, JSON.stringify(logsIndex, null, 2));
        console.log('✅ Generated logs.json with logs:', logsIndex);
    } else {
        console.warn('⚠️ No valid JSON files found in logs folder');
    }

    // Ensure the prompt-results directory exists
    if (!fs.existsSync(PROMPT_RESULTS_DIR)) {
        fs.mkdirSync(PROMPT_RESULTS_DIR, { recursive: true });
    }

    // Write the combined index to index.json
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
    console.log('✅ Generated index.json with models:', Object.keys(index));
}

// Run if called directly
if (require.main === module) {
    generateIndex();
}
