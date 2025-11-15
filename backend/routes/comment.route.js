import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { spamDetector } from "../middlewares/spamDetector.middleware.js";

import {
    createComment,
    getCommentsForPost,
    getRepliesForComment,
    updateComment,
    deleteComment,
    upvoteComment,
    downvoteComment,
    getCommentsByUser
} from "../controllers/comment.controller.js";

const router = express.Router();

// Temporary debug route (no auth) to inspect incoming requests from the frontend
router.post('/debug', (req, res) => {
    try {
        console.log('POST /comments/debug', { headers: req.headers, body: req.body, cookies: req.cookies, user: req.user?._id });
    } catch (e) {
        console.warn('Failed to log /comments/debug', e.message);
    }
    return res.status(200).json({ success: true, headers: req.headers, body: req.body, cookies: req.cookies, user: req.user?._id || null });
});

// Protected routes
router.route("/").post(verifyJWT, spamDetector, createComment);
router.route("/post/:postId").get(verifyJWT, getCommentsForPost);
router.route("/user/:userId").get(verifyJWT, getCommentsByUser);
router.route("/:commentId/replies").get(verifyJWT, getRepliesForComment);
router.route("/:id").put(verifyJWT, spamDetector, updateComment);
router.route("/:id").delete(verifyJWT, deleteComment);
router.route("/:id/upvote").post(verifyJWT, upvoteComment);
router.route("/:id/downvote").post(verifyJWT, downvoteComment);

export default router;