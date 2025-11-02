import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Report } from "../models/report.model.js";

// Create a new comment
export const createComment = asyncHandler(async (req, res) => {
    const { content, postId, parentCommentId } = req.body;
    const author = req.user._id;

    if (!content || !postId) {
        throw new ApiError(400, "Content and postId are required");
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new ApiError(404, "Parent comment not found");
        }
    }

    const comment = await Comment.create({
        content,
        author,
        post: postId,
        parentComment: parentCommentId || null
    });

    // Update comments count on post
    post.commentsCount += 1;
    await post.save();

    // If replying to a comment, update replies count
    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        parentComment.repliesCount += 1;
        await parentComment.save();
    }

    await comment.populate('author', 'fullName avatar');
    await comment.populate('post', 'title');

    if (req.newReport) {
        req.newReport.itemId = comment._id;
        req.newReport.itemType = "comment";
        const report = Report(req.newReport);
        await report.save();
        comment.status = "flagged";  //flag the comment for review by moderators
        comment.save();
        console.log("Spam report created for comment:", req.newReport);
    }

    // Create notification for post author if not self-comment
    if (post.author.toString() !== author.toString()) {
        await Notification.create({
            user: post.author,
            type: "comment",
            message: `${req.user.fullName} commented on your post`,
            relatedPost: postId,
            relatedComment: comment._id
        });
    }

    res.status(201).json(new ApiResponse(201, comment, req.newReport ? "Comment created and flagged" : "Comment created successfully"));
});

// Get comments for a post
export const getCommentsForPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const comments = await Comment.find({ post: postId, parentComment: null })
        .populate('author', 'fullName avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalComments = await Comment.countDocuments({ post: postId, parentComment: null });

    res.status(200).json(new ApiResponse(200, {
        comments,
        totalPages: Math.ceil(totalComments / limit),
        currentPage: page,
        totalComments
    }, "Comments fetched successfully"));
});

// Get comments by user
export const getCommentsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt" } = req.query;

    const comments = await Comment.find({ author: userId })
        .populate('author', 'fullName avatar')
        .populate('post', 'title')
        .sort({ [sortBy]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalComments = await Comment.countDocuments({ author: userId });

    res.status(200).json(new ApiResponse(200, {
        comments,
        totalPages: Math.ceil(totalComments / limit),
        currentPage: page,
        totalComments
    }, "User comments fetched successfully"));
});

// Get replies for a comment
export const getRepliesForComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const replies = await Comment.find({ parentComment: commentId })
        .populate('author', 'fullName avatar')
        .sort({ createdAt: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalReplies = await Comment.countDocuments({ parentComment: commentId });

    res.status(200).json(new ApiResponse(200, {
        replies,
        totalPages: Math.ceil(totalReplies / limit),
        currentPage: page,
        totalReplies
    }, "Replies fetched successfully"));
});

// Update comment (only author)
export const updateComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.author.toString() !== userId.toString()) {
        throw new ApiError(403, "Only author can update comment");
    }

    if (req.newReport) {
        req.newReport.itemId = comment._id;
        req.newReport.itemType = "comment";
        const report = Report(req.newReport);
        await report.save();
        comment.status = "flagged";  //flag the comment for review by moderators
        console.log("Spam report created for comment:", req.newReport);
    }


    comment.content = content || comment.content;
    await comment.save();

    await comment.populate('author', 'fullName avatar');

    res.status(200).json(new ApiResponse(200, comment, req.newReport ? "Comment updated succesfully and flagged" : "Comment updated successfully"));
});

// Delete comment (author or moderator)
export const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id).populate('post');
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const isAuthor = comment.author.toString() === userId.toString();
    const isModerator = comment.post.community.moderators.includes(userId);

    if (!isAuthor && !isModerator) {
        throw new ApiError(403, "Only author or moderator can delete comment");
    }

    // Update counts
    const post = await Post.findById(comment.post);
    post.commentsCount -= 1;
    await post.save();

    if (comment.parentComment) {
        const parentComment = await Comment.findById(comment.parentComment);
        parentComment.repliesCount -= 1;
        await parentComment.save();
    }

    await Comment.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

// Upvote comment
export const upvoteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
        comment.upvotes.push(userId);
        if (hasDownvoted) {
            comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
        }
    }

    await comment.save();
    await comment.populate('upvotes', 'fullName');
    await comment.populate('downvotes', 'fullName');

    res.status(200).json(new ApiResponse(200, comment, "Comment upvoted successfully"));
});

// Downvote comment
export const downvoteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
    } else {
        comment.downvotes.push(userId);
        if (hasUpvoted) {
            comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
        }
    }

    await comment.save();
    await comment.populate('upvotes', 'fullName');
    await comment.populate('downvotes', 'fullName');

    res.status(200).json(new ApiResponse(200, comment, "Comment downvoted successfully"));
});