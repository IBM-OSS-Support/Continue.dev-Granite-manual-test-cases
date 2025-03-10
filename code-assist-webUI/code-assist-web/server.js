const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");

const app = express();
const PORT = 5001;

// Function to get the machine's IP
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const entry of iface) {
            if (entry.family === "IPv4" && !entry.internal) {
                return entry.address;
            }
        }
    }
    return "127.0.0.1"; // Fallback
};

const IP_ADDRESS = getLocalIP();
console.log(`Server running at http://${IP_ADDRESS}:${PORT}`);

// Enable CORS for both local and Fyre machine
app.use(cors({
    origin: ["http://localhost:3000", `http://${IP_ADDRESS}:3000`], // Allow both local and Fyre frontend
    methods: "GET,POST",
    credentials: true
}));

// API to return the server IP
app.get("/server-ip", (req, res) => {
    res.json({ ip: IP_ADDRESS });
});

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

// API to read a JSON file
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

// Start the server on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is accessible at http://${IP_ADDRESS}:${PORT}`);
});
