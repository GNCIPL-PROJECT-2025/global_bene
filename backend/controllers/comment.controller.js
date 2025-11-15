import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { SpamPost } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { logActivity } from "../utils/logActivity.utils.js";

// Create a new comment
export const createComment = asyncHandler(async (req, res) => {
    // Accept multiple possible client field names for robustness
    const body = req.body.body || req.body.text || req.body.comment;
    const postId = req.body.postId || req.body.post || req.body.post_id;
    const parentCommentId = req.body.parentCommentId || req.body.parent_comment_id || req.body.parentId || null;
    const author = req.user && req.user._id;
    
    // Debug: log incoming request shape to help diagnose 400s from frontend
    console.log('createComment called', {
        path: req.originalUrl,
        user: req.user?._id,
        body: req.body,
        extractedBody: body,
        extractedPostId: postId
    });

    if (!author) {
        console.error('No author/user found');
        throw new ApiError(401, "Authentication required");
    }

    if (!body || typeof body !== 'string' || body.trim() === '') {
        console.warn('createComment: invalid/missing body', { receivedBody: req.body, extractedBody: body });
        return res.status(400).json({ success: false, message: "Comment body is required", payload: req.body });
    }

    if (!postId) {
        console.warn('createComment: missing postId', { receivedBody: req.body, extractedPostId: postId });
        return res.status(400).json({ success: false, message: "postId is required to attach the comment to a post", payload: req.body });
    }

    const post = await Post.findById(postId);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    let parentComment = null;
    if (parentCommentId) {
        parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new ApiError(404, "Parent comment not found");
        }
    }

    // Create comment without relying on _id inside the initial payload
    let comment = new Comment({
        body,
        author_id: author,
        post_id: postId,
        parent_id: parentCommentId || null,
        path: ""
    });

    console.log('About to save comment:', { body, author_id: author, post_id: postId });
    await comment.save();
    console.log('Comment saved successfully:', comment._id);

    // Set path after _id is available
    comment.path = `${postId}/${comment._id}`;
    await comment.save();
    console.log('Comment path updated');

    // Update num_comments on post
    post.num_comments = (post.num_comments || 0) + 1;
    await post.save();
    console.log('Post comment count updated');

    // If replying to a comment, update replies count
    if (parentComment) {
        parentComment.replies_count = (parentComment.replies_count || 0) + 1;
        await parentComment.save();
        console.log('Parent comment replies count updated');
    }

    await logActivity(
        author,
        "reply",
        `${req.user?.username || 'unknown'} created a comment`,
        req,
        'comment',
        comment._id
    );
    console.log('Activity logged');

    // Increment num_comments for user
    if (author) {
        await User.findByIdAndUpdate(author, { $inc: { num_comments: 1 } });
        console.log('User comment count incremented');
    }
    // If spam detector attached a report object, persist it with target set to this comment
    if (req.newReport) {
        try {
            const reportData = {
                reporter_id: req.newReport.reporter_id || req.user?._id,
                target_type: 'Comment',
                target_id: comment._id,
                reason: req.newReport.reason || 'Spam/Toxicity detected by ML Service',
                status: req.newReport.status || 'open',
                severity: req.newReport.severity || 'low',
                spamScore: req.newReport.spamScore ?? 0,
                toxicityScore: req.newReport.toxicityScore ?? 0
            };
            // flag the comment if high severity and set scores
            if (req.newReport.severity === 'high') {
                comment.status = 'flagged';
            }
            comment.spamScore = reportData.spamScore;
            comment.toxicityScore = reportData.toxicityScore;
            await comment.save();

            await SpamPost.create(reportData);
            console.log('Spam report persisted for comment');
        } catch (e) {
            console.warn('Failed to persist spam report for comment:', e.message);
        }
    }

    // Emit comment update to post room (use actual post id)
    try {
        const room = `post_${postId}`;
        if (global.io) global.io.to(room).emit('comment-added', { comment, postId });
        console.log('Socket event emitted for comment-added');
    } catch (e) {
        // don't block response on socket errors
        console.warn('Socket emit failed for comment-added:', e.message);
    }

    console.log('createComment response about to send', { commentId: comment._id, status: 201 });
    res.status(201).json(new ApiResponse(201, comment, "Comment created successfully"));
    console.log('createComment response sent successfully');
});

// Get comments for a post
export const getCommentsForPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const comments = await Comment.find({ post_id: postId, parent_id: null })
        .populate('author_id', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

    const totalComments = await Comment.countDocuments({ post_id: postId, parent_id: null });

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt';

    const comments = await Comment.find({ author_id: userId })
        .populate('author_id', 'username avatar')
        .populate('post_id', 'title')
        .sort({ [sortBy]: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

    const totalComments = await Comment.countDocuments({ author_id: userId });

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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const replies = await Comment.find({ parent_id: commentId })
        .populate('author_id', 'username avatar')
        .sort({ createdAt: 1 })
        .limit(limit)
        .skip((page - 1) * limit);

    const totalReplies = await Comment.countDocuments({ parent_id: commentId });

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
    const { body } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.author_id.toString() !== userId.toString()) {
        throw new ApiError(403, "Only author can update comment");
    }

    // If spam detector attached a report object, persist it with target set to this comment
    if (req.newReport) {
        try {
            const reportData = {
                reporter_id: req.newReport.reporter_id || req.user?._id,
                target_type: 'Comment',
                target_id: comment._id,
                reason: req.newReport.reason || 'Spam/Toxicity detected by ML Service',
                status: req.newReport.status || 'open',
                severity: req.newReport.severity || 'low',
                spamScore: req.newReport.spamScore ?? 0,
                toxicityScore: req.newReport.toxicityScore ?? 0
            };
            await SpamPost.create(reportData);
            // flag the comment if high severity and set scores
            if (req.newReport.severity === 'high') {
                comment.status = 'flagged';
            }
            comment.spamScore = reportData.spamScore;
            comment.toxicityScore = reportData.toxicityScore;
        } catch (e) {
            console.warn('Failed to persist spam report for comment update:', e.message);
        }
    }

    comment.body = body || comment.body;
    await comment.save();

    await logActivity(
        userId,
        "update-reply",
        `${req.user.username} updated comment`,
        req,
        'comment',
        id
    );

    res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// Delete comment (author or moderator)
export const deleteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id).populate({
        path: 'post_id',
        populate: {
            path: 'community_id',
            select: 'moderators'
        }
    });
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const isAuthor = comment.author_id.toString() === userId.toString();
    const isModerator = Array.isArray(comment.post_id.community_id?.moderators)
        ? comment.post_id.community_id.moderators.some(m => m.toString() === userId.toString())
        : false;

    if (!isAuthor && !isModerator) {
        throw new ApiError(403, "Only author or moderator can delete comment");
    }

    await logActivity(
        userId,
        "delete-reply",
        `${req.user.username} deleted comment`,
        req,
        'comment',
        id
    );

    // Update counts
    // post_id may be populated or an id; derive id and update safely
    const postId = comment.post_id?._id ? comment.post_id._id : comment.post_id;
    const post = await Post.findById(postId);
    if (post) {
        post.num_comments = Math.max(0, (post.num_comments || 0) - 1);
        await post.save();
    }

    if (comment.parent_id) {
        const parentComment = await Comment.findById(comment.parent_id);
        if (parentComment) {
            parentComment.replies_count = Math.max(0, (parentComment.replies_count || 0) - 1);
            await parentComment.save();
        }
    }

    if (isAuthor) {
        // Author deletes: set status to removed, clear body
        comment.status = 'removed';
        comment.body = '';
        await comment.save();
        // Decrement num_comments for user
        await User.findByIdAndUpdate(userId, { $inc: { num_comments: -1 } });
    } else {
        // Moderator deletes: delete completely
        await Comment.findByIdAndDelete(id);
    }

    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

// Upvote comment
export const upvoteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id).populate('author_id').populate('post_id');
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    // Ensure arrays exist
    comment.upvotes = Array.isArray(comment.upvotes) ? comment.upvotes : [];
    comment.downvotes = Array.isArray(comment.downvotes) ? comment.downvotes : [];

    const hasUpvoted = comment.upvotes.some(u => u.toString() === userId.toString());
    const hasDownvoted = comment.downvotes.some(d => d.toString() === userId.toString());

    if (hasUpvoted) {
        comment.upvotes = comment.upvotes.filter(u => u.toString() !== userId.toString());
    } else {
        comment.upvotes.push(userId);
        if (hasDownvoted) {
            comment.downvotes = comment.downvotes.filter(d => d.toString() !== userId.toString());
        }

        await logActivity(
            userId,
            "upvote",
            `${req.user?.username || 'unknown'} upvoted comment`,
            req,
            'comment',
            id
        );

        // Create notification if not self-upvote
        try {
            const commentAuthorId = comment.author_id?._id ? comment.author_id._id : comment.author_id;
            if (commentAuthorId && commentAuthorId.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    user: commentAuthorId,
                    type: "upvote",
                    message: `${req.user?.username || 'Someone'} upvoted your comment`,
                    relatedPost: comment.post_id?._id ? comment.post_id._id : comment.post_id,
                    relatedComment: id
                });
                if (global.io) global.io.to(`user_${commentAuthorId}`).emit('new-notification', notification);
            }
        } catch (e) {
            console.warn('Failed to create/emit upvote notification for comment:', e.message);
        }
    }

    // Calculate score
    comment.score = (comment.upvotes.length || 0) - (comment.downvotes.length || 0);

    await comment.save();

    // Emit vote update to post room safely
    try {
        const postId = comment.post_id?._id ? comment.post_id._id : comment.post_id;
        if (global.io) global.io.to(`post_${postId}`).emit('comment-vote-updated', {
            commentId: id,
            upvotes: comment.upvotes,
            downvotes: comment.downvotes
        });
    } catch (e) {
        console.warn('Socket emit failed for comment-vote-updated (upvote):', e.message);
    }

    res.status(200).json(new ApiResponse(200, comment, "Comment upvoted successfully"));
});

// Downvote comment
export const downvoteComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id).populate('author_id').populate('post_id');
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    // Ensure arrays exist
    comment.upvotes = Array.isArray(comment.upvotes) ? comment.upvotes : [];
    comment.downvotes = Array.isArray(comment.downvotes) ? comment.downvotes : [];

    const hasUpvoted = comment.upvotes.some(u => u.toString() === userId.toString());
    const hasDownvoted = comment.downvotes.some(d => d.toString() === userId.toString());

    if (hasDownvoted) {
        comment.downvotes = comment.downvotes.filter(d => d.toString() !== userId.toString());
    } else {
        comment.downvotes.push(userId);
        if (hasUpvoted) {
            comment.upvotes = comment.upvotes.filter(u => u.toString() !== userId.toString());
        }

        await logActivity(
            userId,
            "downvote",
            `${req.user?.username || 'unknown'} downvoted comment`,
            req,
            'comment',
            id
        );

        // Create notification if not self-downvote
        try {
            const commentAuthorId = comment.author_id?._id ? comment.author_id._id : comment.author_id;
            if (commentAuthorId && commentAuthorId.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    user: commentAuthorId,
                    type: "downvote",
                    message: `${req.user?.username || 'Someone'} downvoted your comment`,
                    relatedPost: comment.post_id?._id ? comment.post_id._id : comment.post_id,
                    relatedComment: id
                });
                if (global.io) global.io.to(`user_${commentAuthorId}`).emit('new-notification', notification);
            }
        } catch (e) {
            console.warn('Failed to create/emit downvote notification for comment:', e.message);
        }
    }

    // Calculate score
    comment.score = (comment.upvotes.length || 0) - (comment.downvotes.length || 0);

    await comment.save();

    // Emit vote update to post room safely
    try {
        const postId = comment.post_id?._id ? comment.post_id._id : comment.post_id;
        if (global.io) global.io.to(`post_${postId}`).emit('comment-vote-updated', {
            commentId: id,
            upvotes: comment.upvotes,
            downvotes: comment.downvotes
        });
    } catch (e) {
        console.warn('Socket emit failed for comment-vote-updated (downvote):', e.message);
    }

    res.status(200).json(new ApiResponse(200, comment, "Comment downvoted successfully"));
});