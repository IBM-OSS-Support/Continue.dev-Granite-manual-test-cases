const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

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
        // Filter only .json files
        res.json(files.filter(file => file.endsWith(".json")));
    });
});

app.get('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(folderPath, filename); // Update the file to use folderPath
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read file' });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});