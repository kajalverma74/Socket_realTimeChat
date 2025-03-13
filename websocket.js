
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static("public"));

// Store users
let users = {};

// Serve the frontend file
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/websocket.html");
});

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle new user joining
    socket.on("new user", (username) => {
        users[socket.id] = username;
        io.emit("user list", Object.values(users));
    });

    // Handle chat messages
    socket.on("chat message", (data) => {
        io.emit("chat message", { user: users[socket.id], message: data });
    });

    // Handle private messages
    socket.on("private message", ({ recipient, message }) => {
        const recipientSocket = Object.keys(users).find(id => users[id] === recipient);
        if (recipientSocket) {
            io.to(recipientSocket).emit("private message", { user: users[socket.id], message });
        }
    });

    // Handle typing event
    socket.on("typing", () => {
        socket.broadcast.emit("typing", `${users[socket.id]} is typing...`);
    });

    // Handle stop typing event
    socket.on("stop typing", () => {
        socket.broadcast.emit("typing", "");
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("A user disconnected");
        delete users[socket.id];
        io.emit("user list", Object.values(users));
    });
});

// Start server
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});


// sab kaam vhi kar rha hai 
