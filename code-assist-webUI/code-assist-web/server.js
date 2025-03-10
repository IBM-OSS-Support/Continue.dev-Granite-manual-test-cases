const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");

const app = express();
const PORT = 5001;

// Get the correct IP address of the machine
function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const entry of iface) {
            if (entry.family === "IPv4" && !entry.internal) {
                return entry.address; // Return the first non-internal IPv4
            }
        }
    }
    return "127.0.0.1"; // Fallback
}

const IP_ADDRESS = getIPAddress();
console.log(`Server running at http://${IP_ADDRESS}:${PORT}`);

// Enable CORS with specific allowed origin
app.use(cors({
    origin: "http://9.20.192.160:3000" // Change this to match your frontend URL
}));

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

app.get('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(folderPath, filename);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read file' });
        }
        res.json(JSON.parse(data));
    });
});

// Start server on 0.0.0.0 to make it accessible from other machines
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://${IP_ADDRESS}:${PORT}`);
});
