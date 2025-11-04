import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

    // Create notification for post author if not self-comment
    if (post.author.toString() !== author.toString()) {
        const notification = await Notification.create({
            user: post.author,
            type: "comment",
            message: `${req.user.fullName} commented on your post`,
            relatedPost: postId,
            relatedComment: comment._id
        });

        // Emit real-time notification
        global.io.to(`user_${post.author}`).emit('new-notification', notification);
    }

    // Create notification for parent comment author if replying
    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId).populate('author');
        if (parentComment.author._id.toString() !== author.toString()) {
            const replyNotification = await Notification.create({
                user: parentComment.author._id,
                type: "reply",
                message: `${req.user.fullName} replied to your comment`,
                relatedPost: postId,
                relatedComment: comment._id
            });

            // Emit real-time notification
            global.io.to(`user_${parentComment.author._id}`).emit('new-notification', replyNotification);
        }
    }

    // Emit comment update to post room
    global.io.to(`post_${postId}`).emit('comment-added', {
        comment: await comment.populate('author', 'fullName avatar'),
        postId
    });

    res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"));
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

    comment.content = content || comment.content;
    await comment.save();

    await comment.populate('author', 'fullName avatar');

    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
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

    const comment = await Comment.findById(id).populate('author').populate('post');
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    let notification = null;
    if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
        comment.upvotes.push(userId);
        if (hasDownvoted) {
            comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
        }

        // Create notification if not self-vote
        if (comment.author._id.toString() !== userId.toString()) {
            notification = await Notification.create({
                user: comment.author._id,
                type: "upvote",
                message: `${req.user.fullName} upvoted your comment`,
                relatedPost: comment.post._id,
                relatedComment: id
            });
        }
    }

    await comment.save();
    await comment.populate('upvotes', 'fullName');
    await comment.populate('downvotes', 'fullName');

    // Emit vote update to post room
    global.io.to(`post_${comment.post._id}`).emit('comment-vote-updated', {
        commentId: id,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes
    });

    // Emit notification if created
    if (notification) {
        global.io.to(`user_${comment.author._id}`).emit('new-notification', notification);
    }

    res.status(200).json(new ApiResponse(200, comment, "Comment upvoted successfully"));
});

// Downvote comment
export const downvoteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id).populate('author').populate('post');
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    let notification = null;
    if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId.toString());
    } else {
        comment.downvotes.push(userId);
        if (hasUpvoted) {
            comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId.toString());
        }

        // Create notification if not self-vote
        if (comment.author._id.toString() !== userId.toString()) {
            notification = await Notification.create({
                user: comment.author._id,
                type: "downvote",
                message: `${req.user.fullName} downvoted your comment`,
                relatedPost: comment.post._id,
                relatedComment: id
            });
        }
    }

    await comment.save();
    await comment.populate('upvotes', 'fullName');
    await comment.populate('downvotes', 'fullName');

    // Emit vote update to post room
    global.io.to(`post_${comment.post._id}`).emit('comment-vote-updated', {
        commentId: id,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes
    });

    // Emit notification if created
    if (notification) {
        global.io.to(`user_${comment.author._id}`).emit('new-notification', notification);
    }

    res.status(200).json(new ApiResponse(200, comment, "Comment downvoted successfully"));
});