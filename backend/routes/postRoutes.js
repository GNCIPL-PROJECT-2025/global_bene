import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getMyPosts,
} from "../controllers/postController.js";

const router = Router();

// Create post - removed array middleware since it's not defined
router.post("/", authRequired, createPost);

// Update post - removed array middleware since it's not defined
router.put("/:id", authRequired, updatePost);

// Delete post
router.delete("/:id", authRequired, deletePost);

// Get all posts
router.get("/", getAllPosts);

// Get logged-in user's posts
router.get("/my/posts", authRequired, getMyPosts);

export default router;
