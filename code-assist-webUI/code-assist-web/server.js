const express = require("express");
const cors = require("cors");
const os = require("os");

const app = express();
const PORT = 5001;

// Get the machine's local IP
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const entry of iface) {
            if (entry.family === "IPv4" && !entry.internal) {
                return entry.address;
            }
        }
    }
    return "127.0.0.1";
};

const IP_ADDRESS = getLocalIP();
console.log(`Server running at http://${IP_ADDRESS}:${PORT}`);

// Allow requests from both localhost and Fyre frontend
app.use(cors({
    origin: ["http://localhost:3000", `http://9.20.192.160:3000`], // Allow frontend
    methods: "GET,POST",
    credentials: true
}));

// API to return the server IP
app.get("/server-ip", (req, res) => {
    res.json({ ip: IP_ADDRESS });
});

// Start server on 0.0.0.0 to allow external access
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is accessible at http://${IP_ADDRESS}:${PORT}`);
});
