import express from "express";
import {
  addComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = express.Router();

//  Add Comment or Reply
router.post("/:postId", authRequired, addComment);

//  Get Threaded Comments
router.get("/:postId", getCommentsByPost);

//  Update Comment
router.put("/:commentId", authRequired, updateComment);

//  Delete Comment (and replies)
router.delete("/:commentId", authRequired, deleteComment);

export default router;
