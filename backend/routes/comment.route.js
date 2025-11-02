import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
import { spamDetector } from "../middlewares/spamDetector.middleware.js";

const router = express.Router();

// Protected routes
router.route("/").post(verifyJWT, spamDetector, createComment); //goes through auth & spam detector middleware
router.route("/post/:postId").get(verifyJWT, getCommentsForPost);
router.route("/user/:userId").get(verifyJWT, getCommentsByUser);
router.route("/:commentId/replies").get(verifyJWT, getRepliesForComment);
router.route("/:id").put(verifyJWT, spamDetector, updateComment); //goes through auth & spam detector middleware
router.route("/:id").delete(verifyJWT, deleteComment);
router.route("/:id/upvote").post(verifyJWT, upvoteComment);
router.route("/:id/downvote").post(verifyJWT, downvoteComment);

export default router;