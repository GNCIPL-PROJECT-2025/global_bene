import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.models.js";

//  Add a Comment or Reply
export const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    const { postId } = req.params;

    if (!text)
      return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      post: postId,
      author: req.user.id,
      text,
      parentComment: parentComment || null,
    });

    res.status(201).json({
      success: true,
      message: parentComment
        ? "Reply added successfully"
        : "Comment added successfully",
      comment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

//  Get Threaded Comments for a Post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("author", "username email")
      .lean();

    // Group comments by _id for nested threading
    const commentMap = {};
    comments.forEach(
      (comment) => (commentMap[comment._id] = { ...comment, replies: [] })
    );

    const rootComments = [];

    comments.forEach((comment) => {
      if (comment.parentComment) {
        const parent = commentMap[comment.parentComment];
        if (parent) parent.replies.push(commentMap[comment._id]);
      } else {
        rootComments.push(commentMap[comment._id]);
      }
    });

    res.json({
      success: true,
      count: rootComments.length,
      comments: rootComments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};

//  Update a Comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!req.body.text)
      return res
        .status(400)
        .json({ message: "Text is required to update comment" });

    const comment = await Comment.findById(commentId);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this comment" });
    }

    comment.text = req.body.text;
    await comment.save();

    res.json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating comment", error: error.message });
  }
};

//  Delete a Comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      author: req.user.id,
    });
    if (!comment)
      return res
        .status(404)
        .json({ message: "Comment not found or unauthorized" });

    // Recursive delete function to delete comment and its replies
    const deleteCommentAndReplies = async (id) => {
      const replies = await Comment.find({ parentComment: id });
      for (const reply of replies) {
        await deleteCommentAndReplies(reply._id);
      }
      await Comment.findByIdAndDelete(id);
    };

    await deleteCommentAndReplies(commentId);

    res.json({
      success: true,
      message: "Comment and replies deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};
