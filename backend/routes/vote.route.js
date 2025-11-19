import { Router } from "express";
import { vote, getUserVotes } from "../controllers/vote.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Vote on post or comment
router.post("/:target_type/:target_id/:vote_type", vote);

// Get user's vote data
router.get("/", getUserVotes);

export default router;