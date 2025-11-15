import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Post } from "../models/post.model.js";
import { Community } from "../models/community.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { SpamPost } from "../models/report.model.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { cloudinaryPostRefer } from "../utils/constants.utils.js";
import { logActivity } from "../utils/logActivity.utils.js";

// Create a new post
export const createPost = asyncHandler(async (req, res) => {
    const { title, body, communityId, type, url, tags } = req.body;
    const author = req.user._id;

    if (!title) {
        throw new ErrorHandler("Title is required", 400);
    }

    // Content is required for text and link posts, optional for image/video posts
    if ((type === 'text' || type === 'link') && !body) {
        throw new ErrorHandler("Body is required for text and link posts", 400);
    }

    // If communityId is provided, validate community membership
    if (communityId) {
        const community = await Community.findById(communityId);
        if (!community) {
            throw new ErrorHandler("Community not found", 404);
        }

        if (!community.members.includes(author)) {
            throw new ErrorHandler("You must be a member of the community to post", 403);
        }
    }

    let media = null;
    // Handle file upload for image posts
    if (req.file && (type === 'image' || type === 'video')) {
        const uploadedMedia = await uploadOnCloudinary(req.file.path, cloudinaryPostRefer, req.user, req.file.originalname);
        if (uploadedMedia) {
            media = {
                public_id: uploadedMedia.public_id,
                secure_url: uploadedMedia.secure_url
            };
        }
    }

    const post = await Post.create({
        title,
        body: body || "",
        author,
        community_id: communityId || null,
        type: type || "text",
        media,
        url: url || "",
        tags: tags || []
    });

    await post.populate('author', 'username avatar');
    if (communityId) {
        await post.populate('community_id', 'title');
    }

    await logActivity(
        author,
        "post",
        `${req.user.username} created a post: ${title}`,
        req,
        'post',
        post._id
    );

    // Increment num_posts for author
    await User.findByIdAndUpdate(author, { $inc: { num_posts: 1 } });

    // If spam detector attached a report object, persist it with target set to this post
    if (req.newReport) {
        try {
            const reportData = {
                reporter_id: req.newReport.reporter_id || req.user?._id,
                target_type: 'Post',
                target_id: post._id,
                reason: req.newReport.reason || 'Spam/Toxicity detected by ML Service',
                status: req.newReport.status || 'open',
                severity: req.newReport.severity || 'low',
                spamScore: req.newReport.spamScore ?? null,
                toxicityScore: req.newReport.toxicityScore ?? null
            };
            // flag the post and set scores
            post.status = 'flagged';
            post.spamScore = reportData.spamScore;
            post.toxicityScore = reportData.toxicityScore;
            await post.save();
            await SpamPost.create(reportData);
        } catch (e) {
            console.warn('Failed to persist spam report for post:', e.message);
        }
    }

    res.status(201).json({ success: true, post, message: "Post created successfully" });
});

// Get all posts (with pagination and filtering)
export const getAllPosts = asyncHandler(async (req, res) => {
    console.log('getAllPosts called with query:', req.query);
    const { page = 1, limit = 10, communityId, sortBy = "createdAt" } = req.query;

    const filter = { status: 'active' };
    if (communityId) {
        filter.community_id = communityId;
    }

    let sortOptions = {};
    if (sortBy === 'top') {
        sortOptions = { score: -1, num_comments: -1 };
    } else {
        sortOptions = { [sortBy]: -1 };
    }

    console.log('Filter:', filter);
    console.log('Sort options:', sortOptions);

    const posts = await Post.find(filter)
        .populate('author', 'username avatar')
        .populate('community_id', 'title members')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(filter);

    console.log(`Found ${posts.length} posts out of ${totalPosts} total`);

    res.status(200).json({
      success: true,
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts,
      message: "Posts fetched successfully"
    });
});

// Get posts by user
export const getPostsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt" } = req.query;

    const posts = await Post.find({ author: userId })
        .populate('author', 'username avatar')
        .populate('community_id', 'title members')
        .sort({ [sortBy]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments({ author: userId });

    res.status(200).json({
        success: true,
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        totalPosts,
        message: "User posts fetched successfully"
    });
});

// Get post by ID
export const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id)
        .populate('author', 'username avatar')
        .populate('community_id', 'title members')
        .populate('upvotes', 'username')
        .populate('downvotes', 'username');

    if (!post) {
        throw new ErrorHandler("Post not found", 404);
    }

    res.status(200).json({ success: true, post, message: "Post fetched successfully" });
});

// Update post (only author)
export const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ErrorHandler("Post not found", 404);
    }

    if (post.author.toString() !== userId.toString()) {
        throw new ErrorHandler("Only author can update post", 403);
    }

    post.title = title || post.title;
    post.body = body || post.body;

    // If spam detector attached a report object, persist it with target set to this post
    if (req.newReport) {
        try {
            const reportData = {
                reporter_id: req.newReport.reporter_id || req.user?._id,
                target_type: 'Post',
                target_id: post._id,
                reason: req.newReport.reason || 'Spam/Toxicity detected by ML Service',
                status: req.newReport.status || 'open',
                spamScore: req.newReport.spamScore ?? null,
                toxicityScore: req.newReport.toxicityScore ?? null
            };
            await SpamPost.create(reportData);
            post.status = 'flagged';
            post.spamScore = reportData.spamScore;
            post.toxicityScore = reportData.toxicityScore;
        } catch (e) {
            console.warn('Failed to persist spam report for post update:', e.message);
        }
    }

    await post.save();
    await post.populate('author', 'username avatar');
    await post.populate('community_id', 'title');

    await logActivity(
        userId,
        "update-post",
        `${req.user.username} updated post: ${post.title}`,
        req,
        'post',
        id
    );

    res.status(200).json({ success: true, post, message: "Post updated successfully" });
});

// Delete post (author or moderator)
export const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id).populate('community_id');
    if (!post) {
        throw new ErrorHandler("Post not found", 404);
    }

    const isAuthor = post.author.toString() === userId.toString();
    const isModerator = post.community_id ? post.community_id.moderators.includes(userId) : false;

    if (!isAuthor && !isModerator) {
        throw new ErrorHandler("Only author can delete this post", 403);
    }

    // If author deletes, set status to removed and clear body
    if (isAuthor) {
        post.status = 'removed';
        post.body = '';
        await post.save();
    } else {
        // Moderator deletes, actually delete
        await Post.findByIdAndDelete(id);
    }

    await logActivity(
        userId,
        "delete-post",
        `${req.user.username} deleted post: ${post.title}`,
        req,
        'post',
        id
    );

    // Decrement num_posts if author deleted
    if (isAuthor) {
        await User.findByIdAndUpdate(userId, { $inc: { num_posts: -1 } });
    }

    res.status(200).json({ success: true, message: "Post deleted successfully" });
});

// Upvote post
export const upvotePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id).populate('author');
    if (!post) {
        throw new ErrorHandler("Post not found", 404);
    }

    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (hasUpvoted) {
        // Remove upvote
        post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
        // Add upvote and remove downvote if exists
        post.upvotes.push(userId);
        if (hasDownvoted) {
            post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
        }

        await logActivity(
            userId,
            "upvote",
            `${req.user.username} upvoted post`,
            req,
            'post',
            id
        );

        // Create notification if not self-upvote
        try {
            const postAuthorId = post.author?._id ? post.author._id : post.author;
            if (postAuthorId && postAuthorId.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    user: postAuthorId,
                    type: "upvote",
                    message: `${req.user?.username || 'Someone'} upvoted your post`,
                    relatedPost: id
                });
                if (global.io) global.io.to(`user_${postAuthorId}`).emit('new-notification', notification);
            }
        } catch (e) {
            console.warn('Failed to create/emit upvote notification for post:', e.message);
        }
    }

    // Calculate score
    post.score = post.upvotes.length - post.downvotes.length;

    await post.save();

    // Emit vote update to post room
    global.io.to(`post_${id}`).emit('vote-updated', {
        postId: id,
        upvotes: post.upvotes,
        downvotes: post.downvotes
    });

    res.status(200).json({ success: true, post, message: "Post upvoted successfully" });
});

// Downvote post
export const downvotePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id).populate('author');
    if (!post) {
        throw new ErrorHandler("Post not found", 404);
    }

    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    if (hasDownvoted) {
        // Remove downvote
        post.downvotes = post.downvotes.filter(id => id.toString() !== userId.toString());
    } else {
        // Add downvote and remove upvote if exists
        post.downvotes.push(userId);
        if (hasUpvoted) {
            post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
        }

        await logActivity(
            userId,
            "downvote",
            `${req.user.username} downvoted post`,
            req,
            'post',
            id
        );

        // Create notification if not self-downvote
        try {
            const postAuthorId = post.author?._id ? post.author._id : post.author;
            if (postAuthorId && postAuthorId.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    user: postAuthorId,
                    type: "downvote",
                    message: `${req.user?.username || 'Someone'} downvoted your post`,
                    relatedPost: id
                });
                if (global.io) global.io.to(`user_${postAuthorId}`).emit('new-notification', notification);
            }
        } catch (e) {
            console.warn('Failed to create/emit downvote notification for post:', e.message);
        }
    }

    // Calculate score
    post.score = post.upvotes.length - post.downvotes.length;

    await post.save();

    // Emit vote update to post room
    global.io.to(`post_${id}`).emit('vote-updated', {
        postId: id,
        upvotes: post.upvotes,
        downvotes: post.downvotes
    });

    res.status(200).json({ success: true, post, message: "Post downvoted successfully" });
});

// Save post
export const savePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ErrorHandler("Post not found", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    // Check if post is already saved
    if (user.savedPosts.includes(id)) {
        throw new ErrorHandler("Post already saved", 400);
    }

    // Add post to user's saved posts
    user.savedPosts.push(id);
    await user.save();

    await logActivity(
        userId,
        "save-post",
        `${req.user.username} saved post`,
        req,
        'post',
        id
    );

    res.status(200).json({ success: true, message: "Post saved successfully" });
});

// Unsave post
export const unsavePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ErrorHandler("Post not found", 404);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    // Check if post is saved
    if (!user.savedPosts.includes(id)) {
        throw new ErrorHandler("Post not saved", 400);
    }

    // Remove post from user's saved posts
    user.savedPosts = user.savedPosts.filter(savedPostId => savedPostId.toString() !== id);
    await user.save();

    await logActivity(
        userId,
        "unsave-post",
        `${req.user.username} unsaved post`,
        req,
        'post',
        id
    );

    res.status(200).json({ success: true, message: "Post unsaved successfully" });
});

// Search posts, communities, and users
export const search = asyncHandler(async (req, res) => {
    const { q: query, type = 'all', page = 1, limit = 10 } = req.query;

    if (!query || query.trim() === '') {
        return res.status(200).json({
            success: true,
            results: {
                posts: [],
                communities: [],
                users: []
            },
            message: "Search query is required"
        });
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    const results = {
        posts: [],
        communities: [],
        users: []
    };

    // Search posts
    if (type === 'all' || type === 'posts') {
        const posts = await Post.find({
            $or: [
                { title: searchRegex },
                { body: searchRegex },
                { tags: searchRegex }
            ],
            status: 'active'
        })
            .populate('author', 'username avatar')
            .populate('community_id', 'title name')
            .sort({ score: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        results.posts = posts;
    }

    // Search communities
    if (type === 'all' || type === 'communities') {
        const communities = await Community.find({
            $or: [
                { title: searchRegex },
                { name: searchRegex },
                { description: searchRegex }
            ]
        })
            .select('name title description avatar members_count')
            .sort({ members_count: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        results.communities = communities;
    }

    // Search users
    if (type === 'all' || type === 'users') {
        const users = await User.find({
            $or: [
                { username: searchRegex },
                { email: searchRegex }
            ],
            isVerified: true
        })
            .select('username avatar bio num_followers num_following')
            .sort({ num_followers: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        results.users = users;
    }

    res.status(200).json({
        success: true,
        results,
        query: query.trim(),
        type,
        message: "Search completed successfully"
    });
});

// Get saved posts for the authenticated user
export const getSavedPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
        throw new ErrorHandler("User not found", 404);
    }

    const savedPostIds = user.savedPosts;

    if (savedPostIds.length === 0) {
        return res.status(200).json({
            success: true,
            posts: [],
            totalPages: 0,
            currentPage: page,
            totalPosts: 0,
            message: "No saved posts found"
        });
    }

    const posts = await Post.find({ _id: { $in: savedPostIds } })
        .populate('author', 'username avatar')
        .populate('community_id', 'title members')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPosts = savedPostIds.length;

    res.status(200).json({
        success: true,
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        totalPosts,
        message: "Saved posts fetched successfully"
    });
});