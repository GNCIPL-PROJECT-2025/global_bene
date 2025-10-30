import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"
import { errorMiddleware } from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.route.js"
import adminRouter from "./routes/admin.route.js"
import communityRoutes from "./routes/community.route.js";

const app = express();

config({ path: "./.env" })

// *===================================
// *Neccessary-Middlewares
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
// ================ CORS Configuration ===================
const allowedOrigins = process.env.CORS_ORIGIN.split(",");
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
app.use("/api/v1/communities", communityRoutes);

app.use(errorMiddleware)
// *End-Of-Neccessary-Middlewares
// *===================================

export { app };