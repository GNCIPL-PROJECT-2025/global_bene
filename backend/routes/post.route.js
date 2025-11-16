import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { spamDetector } from "../middlewares/spamDetector.middleware.js";
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    upvotePost,
    downvotePost,
    savePost,
    unsavePost,
    getSavedPosts,
    getPostsByUser
} from "../controllers/post.controller.js";
import { autoTaggerMiddleware } from "../middlewares/autotag.middleware.js";

const router = express.Router();

// Public routes
router.route("/").get(getAllPosts);
router.route("/saved").get(verifyJWT, getSavedPosts);
router.route("/user/:userId").get(getPostsByUser);
router.route("/:id").get(getPostById);

// Protected routes
router.route("/").post(verifyJWT, upload.single("media"), spamDetector, autoTaggerMiddleware, createPost);
router.route("/:id").put(verifyJWT, spamDetector, autoTaggerMiddleware, updatePost);
router.route("/:id").delete(verifyJWT, deletePost);
router.route("/:id/upvote").post(verifyJWT, upvotePost);
router.route("/:id/downvote").post(verifyJWT, downvotePost);
router.route("/:id/save").post(verifyJWT, savePost);
router.route("/:id/unsave").post(verifyJWT, unsavePost);

export default router;