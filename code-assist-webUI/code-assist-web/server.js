const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");

const app = express();
const PORT = 5005;

// ✅ Define the folder where model folders are stored
const folderPath = path.join(__dirname, "src", "prompt-results");

app.use(cors());

// ✅ API to get list of model folders (only directories)
app.get("/api/models", (req, res) => {
    console.log("📂 Checking models inside:", folderPath);

    if (!fs.existsSync(folderPath)) {
        console.error("❌ ERROR: Directory 'prompt-results' not found:", folderPath);
        return res.status(500).json({ error: `Directory 'prompt-results' not found at ${folderPath}` });
    }

    fs.readdir(folderPath, (err, folders) => {
        if (err) {
            console.error("❌ ERROR: Unable to scan directories:", err);
            return res.status(500).json({ error: "Unable to scan model directories" });
        }

        const models = folders.filter(folder =>
            fs.statSync(path.join(folderPath, folder)).isDirectory()
        );

        console.log("✅ Models found:", models);
        res.json(models);
    });
});

// ✅ API to get list of JSON files inside a selected model folder
app.get("/api/models/:modelName/files", (req, res) => {
    let { modelName } = req.params;

    // ✅ Decode special characters in URL
    modelName = decodeURIComponent(modelName);
    console.log(`📂 Checking files for model: '${modelName}'`);

    const modelPath = path.join(folderPath, modelName);

    // ✅ Debugging: Print available model folders
    const availableModels = fs.readdirSync(folderPath).filter(folder => 
        fs.statSync(path.join(folderPath, folder)).isDirectory()
    );
    console.log("✅ Available Models:", availableModels);

    // ✅ Check if model exists
    if (!availableModels.includes(modelName)) {
        console.error(`❌ ERROR: Model '${modelName}' not found in`, availableModels);
        return res.status(404).json({ error: `Model '${modelName}' not found` });
    }

    fs.readdir(modelPath, (err, files) => {
        if (err) {
            console.error("❌ ERROR: Unable to scan files:", err);
            return res.status(500).json({ error: "Unable to scan files" });
        }

        // ✅ Filter only JSON files
        const jsonFiles = files.filter(file => file.endsWith(".json"));

        console.log(`✅ Found JSON files for model '${modelName}':`, jsonFiles);
        res.json(jsonFiles);
    });
});


// ✅ API to get JSON file content
app.get("/api/models/:modelName/files/:filename", (req, res) => {
    const { modelName, filename } = req.params;
    const filePath = path.join(folderPath, modelName, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: `File '${filename}' not found in model '${modelName}'` });
    }

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file" });

        res.json(JSON.parse(data));
    });
});

// ✅ Get second non-internal IPv4 address
const getMachineIP = () => {
    const interfaces = os.networkInterfaces();
    let nonInternalIPs = [];

    for (const iface of Object.values(interfaces)) {
        for (const entry of iface) {
            if (entry.family === "IPv4" && !entry.internal) {
                nonInternalIPs.push(entry.address); // Collect all non-internal IPs
            }
        }
    }

    if (nonInternalIPs.length >= 2) {
        return nonInternalIPs[1]; // Return the second non-internal IP if available
    }
    return nonInternalIPs[0] || "127.0.0.1"; // Fallback to first or localhost
};

const machineIP = getMachineIP();

// ✅ API to get server IP
app.get("/server-ip", (req, res) => {
    res.json({ ip: machineIP, port: PORT });
});

// ✅ Bind to 0.0.0.0 instead of localhost
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server Running at ${machineIP}:${PORT}`);
});

app.get("/api/code-assist", (req, res) => {
    const filePath = path.join(__dirname, "src", "code-assist-data.json");
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Code assist data not found" });
    }

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read code assist data" });
        res.json(JSON.parse(data));
    });
});