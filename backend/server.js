
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
    }
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

import { User } from "./models/user.model.js";
import { Community } from "./models/community.model.js";
import { Post } from "./models/post.model.js";

// Connecting to Database and starting the server
connectDB()
  .then(async () => {
    // Create default admin user if not exists
    const adminExists = await User.findOne({ email: "admin@globalbene.com" });
    if (!adminExists) {
      const admin = new User({
        username: "admin",
        email: "admin@globalbene.com",
        password: "admin123",
        role: "admin",
        phone: "9999999999",
        gender: "male"
      });
      await admin.save();
      console.log("Default admin user created: admin@globalbene.com / admin123");
    }

    // Create sample communities and posts if none exist
    const communityCount = await Community.countDocuments();
    const postCount = await Post.countDocuments();
    if (communityCount === 0 || postCount === 0) {
      console.log("Creating sample communities and posts...");

      // Create sample user
      const sampleUser = new User({
        username: "sampleuser",
        email: "user@example.com",
        password: "password123",
        role: "user",
        phone: "8888888888",
        gender: "male"
      });
      await sampleUser.save();

      // Create sample communities
      const techCommunity = new Community({
        name: "technology",
        title: "Technology",
        description: "Discuss the latest in technology, programming, and innovation.",
        creator_id: {
          _id: sampleUser._id,
          username: sampleUser.username,
          avatar: sampleUser.avatar
        },
        members: [sampleUser._id],
        moderators: [sampleUser._id],
        members_count: 1
      });
      await techCommunity.save();

      const gamingCommunity = new Community({
        name: "gaming",
        title: "Gaming",
        description: "Talk about video games, gaming news, and gaming culture.",
        creator_id: {
          _id: sampleUser._id,
          username: sampleUser.username,
          avatar: sampleUser.avatar
        },
        members: [sampleUser._id],
        moderators: [sampleUser._id],
        members_count: 1
      });
      await gamingCommunity.save();

      // Create sample posts
      const post1 = new Post({
        title: "Welcome to Global Bene!",
        body: "This is a sample post to demonstrate the platform. Feel free to explore and create your own content!",
        author: sampleUser._id,
        community_id: techCommunity._id,
        type: "text"
      });
      await post1.save();

      const post2 = new Post({
        title: "Latest Gaming Trends",
        body: "What are your thoughts on the current gaming industry? Share your favorite games and upcoming releases.",
        author: sampleUser._id,
        community_id: gamingCommunity._id,
        type: "text"
      });
      await post2.save();

      const post3 = new Post({
        title: "Programming Tips",
        body: "Here are some useful programming tips:\n\n1. Write clean, readable code\n2. Test your code thoroughly\n3. Keep learning new technologies\n4. Collaborate with others\n\nWhat are your favorite programming practices?",
        author: sampleUser._id,
        community_id: techCommunity._id,
        type: "text"
      });
      await post3.save();

      const post4 = new Post({
        title: "General Discussion",
        body: "This is a general post visible to all users on the home page. Welcome to our community platform!",
        author: sampleUser._id,
        type: "text"
      });
      await post4.save();

      console.log("Sample data created successfully!");
    }

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            const newPort = PORT + 1;
            console.log(`Port ${PORT} is busy, starting on port ${newPort}`);
            server.listen(newPort, () => {
                console.log(`Server is running on port ${newPort}`)
            });
        } else {
            console.error('Server error:', err);
        }
    });
  })
  .catch((err) => {
    console.log("Connection Failed", err)
  })