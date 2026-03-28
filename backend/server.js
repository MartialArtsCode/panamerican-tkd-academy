const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname)); // Serves your index.html and assets

// --- Environment Variables ---
const API_KEY = process.env.CALLMEBOT_API_KEY || "3581131";
const ADMIN_PHONE = "13366248499";

// --- WhatsApp Messaging Route ---
app.post('/api/messenger/send-whatsapp', async (req, res) => {
    const { message } = req.body;
    
    if (!message) return res.status(400).send("No message provided");

    try {
        // Construct CallMeBot URL
        const url = `https://api.callmebot.com/whatsapp.php?phone=${ADMIN_PHONE}&apikey=${API_KEY}&text=${encodeURIComponent(message)}`;
        
        await axios.get(url);
        console.log(`Notification sent: ${message}`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("CallMeBot Error:", error.message);
        res.status(500).json({ error: "Failed to send WhatsApp message" });
    }
});

// --- Real-time Visitor Tracking ---
let visitorCount = 0;
io.on('connection', (socket) => {
    visitorCount++;
    io.emit('visitorUpdate', visitorCount);
    
    // Notify Admin of a new site visit via WhatsApp
    axios.get(`https://api.callmebot.com/whatsapp.php?phone=${ADMIN_PHONE}&apikey=${API_KEY}&text=${encodeURIComponent("New visitor on Panamerican TKD site!")}`)
        .catch(e => console.log("Visit alert failed"));

    socket.on('disconnect', () => {
        visitorCount--;
        io.emit('visitorUpdate', visitorCount);
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
    🥋 Panamerican Academy Server Online
    - Port: ${PORT}
    - Monitoring: Active
    `);
});
