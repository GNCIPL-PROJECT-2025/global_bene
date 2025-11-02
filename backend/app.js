import { config } from "dotenv";

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import session from "express-session";
import passport from './config/passport.js';
import { errorMiddleware } from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.route.js"
import adminRouter from "./routes/admin.route.js"
import communityRouter from "./routes/community.route.js"
import postRouter from "./routes/post.route.js"
import commentRouter from "./routes/comment.route.js"
import notificationRouter from "./routes/notification.route.js"
const app = express();
config({ path: "./.env" })
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ================ CORS Configuration ===================
// -const allowedOrigins = process.env.CORS_ORIGIN.split(",");
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173"];
app.use(cors({
    origin: (origin, callback) => {
      
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// ================= Health Check Route ===================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ GNCIPL_BENE Backend is Running Successfully!",
    version: "1.0.0",
    author: "Vivek Dubey (backend)",
    timestamp: new Date().toISOString(),
  });
});

// ================= Routes ===================
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/communities", communityRouter)
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/notifications", notificationRouter)

app.use(errorMiddleware)
// *End-Of-Neccessary-Middlewares
// *===================================

export { app };