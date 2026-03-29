const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(__dirname)); 

const API_KEY = process.env.CALLMEBOT_API_KEY || "3581131";
const ADMIN_PHONE = "13366248499";

// --- Messenger API ---
app.post('/api/messenger/send-whatsapp', async (req, res) => {
    const { message } = req.body;
    try {
        const url = `https://wa.me/message/XZ5FWOI5CSXAO1`;
        await axios.get(url);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).send("Error sending message");
    }
});

// --- Real-Time Monitoring ---
let visitors = 0;
io.on('connection', (socket) => {
    visitors++;
    io.emit('visitorUpdate', visitors);
    
    // Alert you of a new lead on the site
    axios.get(`https://api.callmebot.com/whatsapp.php?phone=${ADMIN_PHONE}&apikey=${API_KEY}&text=${encodeURIComponent("🥋 Panamerican TKD: Someone is looking at your site right now!")}`)
        .catch(() => {});

    socket.on('disconnect', () => {
        visitors--;
        io.emit('visitorUpdate', visitors);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Martial Arts Portal active on ${PORT}`));
