const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 📌 MongoDB Connection
connectDB();

// 📌 Auth Routes
app.use("/api/auth", authRoutes);

let users = {}; // 🔹 Store connected users

// 📌 WebSocket Connection
io.on("connection", (socket) => {
    console.log(`✅ A user connected: ${socket.id}`);

    // 🔹 Handle New User Joining
    socket.on("new user", (username) => {
        if (!username) username = `Guest_${socket.id.substring(0, 5)}`;
        users[socket.id] = username;
        console.log(`🔹 ${username} joined the chat`);
        io.emit("user list", Object.values(users));
    });

    // 🔹 Handle Chat Messages
    socket.on("chat message", (data) => {
        const user = users[socket.id] || `Guest_${socket.id.substring(0, 5)}`;
        const message = data.message?.trim();
        const time = new Date().toLocaleTimeString(); 

        if (message) {
            console.log(`💬 ${user}: ${message} (${time})`);
            io.emit("chat message", { user, message, time }); 
        }
    });

    // 🔹 Handle User Disconnection
    socket.on("disconnect", () => {
        console.log(`❌ ${users[socket.id] || "Guest"} disconnected`);
        delete users[socket.id];
        io.emit("user list", Object.values(users));
    });
});

// 📌 Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
