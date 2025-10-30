import dotenv from "dotenv";
import express, { json } from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// Import routes
import communityRoutes from "./routes/communityRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// Configure dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to database
connectDB();

// Middlewares
app.use(cors());
app.use(json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/communities", communityRoutes);

app.get("/", (req, res) => res.send("GNCIPl backend running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
