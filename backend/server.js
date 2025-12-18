
import { app } from "./app.js";
import connectDB from "./database/dbConnection.js";
import { createServer } from "http";
import { Server } from "socket.io";
// import { getRedisAdapter } from "./utils/socket.utils.js"; // Uncomment when Redis is available

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN.split(","),
        credentials: true
    },
    transports: ['websocket', 'polling'], // Support both transports
    pingTimeout: 60000, // Increase ping timeout for production
    pingInterval: 25000, // Ping interval
});

// TODO: Enable Redis adapter for scaling when Redis server is available
// try {
//     const redisAdapter = getRedisAdapter();
//     io.adapter(redisAdapter);
//     console.log('Redis adapter enabled for Socket.IO scaling');
// } catch (error) {
//     console.log('Redis not available, using default adapter:', error.message);
// }

// Socket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room for personal notifications
    socket.on('join-user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

    // Join post room for post-specific updates
    socket.on('join-post', (postId) => {
        socket.join(`post_${postId}`);
        console.log(`User joined room post_${postId}`);
    });

    // Leave post room
    socket.on('leave-post', (postId) => {
        socket.leave(`post_${postId}`);
        console.log(`User left room post_${postId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Make io available globally
global.io = io;

// Connecting to Database and starting the server
connectDB()
    .then(() => {
        server.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        });
    })
    .catch((err) => {
        console.log("Connection Failed", err)
    })
