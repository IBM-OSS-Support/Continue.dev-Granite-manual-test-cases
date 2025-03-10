const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");

const app = express();
const PORT = 5001;

// Enable CORS for all routes
app.use(cors());

// Define the folder where JSON files are stored
const folderPath = path.join(__dirname, "src", "prompt-results");

// API to get list of JSON files
app.get("/api/files", (req, res) => {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Unable to scan directory" });
        }
        res.json(files.filter(file => file.endsWith(".json")));
    });
});

// API to get JSON file content
app.get("/api/files/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(folderPath, filename);
    
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read file" });
        }
        res.json(JSON.parse(data));
    });
});

// ✅ Updated Function to get the second non-internal IPv4
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
    return nonInternalIPs[0] || "localhost"; // Fallback to the first or localhost
};

const machineIP = getMachineIP();
console.log(`✅ Using second non-internal IP: ${machineIP}`);

// ✅ API to get server IP
app.get("/server-ip", (req, res) => {
    res.json({ ip: machineIP, port: PORT });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server accessible at http://${machineIP}:${PORT}`);
});
