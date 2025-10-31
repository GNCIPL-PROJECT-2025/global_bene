import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getMyPosts,
  upvotePost,
  downvotePost,
} from "../controllers/post.controller.js";

const router = Router();

// Create post - removed array middleware since it's not defined
router.post("/", verifyJWT, createPost);

// Update post - removed array middleware since it's not defined
router.put("/:id", verifyJWT, updatePost);

// Delete post
router.delete("/:id", verifyJWT, deletePost);

// Get all posts
router.get("/", getAllPosts);

// Upvote a post
router.post("/:id/upvote", verifyJWT, upvotePost);

// Downvote a post
router.post("/:id/downvote", verifyJWT, downvotePost);

// Get logged-in user's posts
router.get("/my/posts", verifyJWT, getMyPosts);

export default router;
