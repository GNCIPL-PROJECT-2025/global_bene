import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Post } from "../models/post.model.js";
import { Community } from "../models/community.model.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { cloudinaryPostRefer } from "../utils/constants.utils.js";

// Create a new post
export const createPost = asyncHandler(async (req, res) => {
    const { title, content, communityId, type } = req.body;
    const author = req.user._id;

    if (!title || !communityId) {
        throw new ApiError(400, "Title and communityId are required");
    }

    // Content is required for text and link posts, optional for image/video posts
    if ((type === 'text' || type === 'link') && !content) {
        throw new ApiError(400, "Content is required for text and link posts");
    }

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (!community.members.includes(author)) {
        throw new ApiError(403, "You must be a member of the community to post");
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
        content: content || "", // Default to empty string if not provided
        author,
        community: communityId,
        type: type || "text",
        media
    });

    await post.populate('author', 'fullName avatar');
    await post.populate('community', 'name');

    res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});

// Get all posts (with pagination and filtering)
export const getAllPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, communityId, sortBy = "createdAt" } = req.query;

    const filter = {};
    if (communityId) {
        filter.community = communityId;
    }

    const posts = await Post.find(filter)
        .populate('author', 'fullName avatar')
        .populate('community', 'name members')
        .sort({ [sortBy]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, {
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        totalPosts
    }, "Posts fetched successfully"));
});

// Get posts by user
export const getPostsByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt" } = req.query;

    const posts = await Post.find({ author: userId })
        .populate('author', 'fullName avatar')
        .populate('community', 'name members')
        .sort({ [sortBy]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments({ author: userId });

    res.status(200).json(new ApiResponse(200, {
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        totalPosts
    }, "User posts fetched successfully"));
});

// Get post by ID
export const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id)
        .populate('author', 'fullName avatar')
        .populate('community', 'name members')
        .populate('upvotes', 'fullName')
        .populate('downvotes', 'fullName');

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    res.status(200).json(new ApiResponse(200, post, "Post fetched successfully"));
});

// Update post (only author)
export const updatePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.author.toString() !== userId.toString()) {
        throw new ApiError(403, "Only author can update post");
    }

    post.title = title || post.title;
    post.content = content || post.content;

    await post.save();
    await post.populate('author', 'fullName avatar');
    await post.populate('community', 'name');

    res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

// Delete post (author or moderator)
export const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id).populate('community');
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const isAuthor = post.author.toString() === userId.toString();
    const isModerator = post.community.moderators.includes(userId);

    if (!isAuthor && !isModerator) {
        throw new ApiError(403, "Only author or moderator can delete post");
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});

// Upvote post
export const upvotePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(404, "Post not found");
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
    }

    await post.save();
    await post.populate('upvotes', 'fullName');
    await post.populate('downvotes', 'fullName');

    res.status(200).json(new ApiResponse(200, post, "Post upvoted successfully"));
});

// Downvote post
export const downvotePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(404, "Post not found");
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
    }

    await post.save();
    await post.populate('upvotes', 'fullName');
    await post.populate('downvotes', 'fullName');

    res.status(200).json(new ApiResponse(200, post, "Post downvoted successfully"));
});

// Save post
export const savePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if post is already saved
    if (user.savedPosts.includes(id)) {
        throw new ApiError(400, "Post already saved");
    }

    // Add post to user's saved posts
    user.savedPosts.push(id);
    await user.save();

    res.status(200).json(new ApiResponse(200, null, "Post saved successfully"));
});

// Unsave post
export const unsavePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if post is saved
    if (!user.savedPosts.includes(id)) {
        throw new ApiError(400, "Post not saved");
    }

    // Remove post from user's saved posts
    user.savedPosts = user.savedPosts.filter(savedPostId => savedPostId.toString() !== id);
    await user.save();

    res.status(200).json(new ApiResponse(200, null, "Post unsaved successfully"));
});

// Get saved posts for the authenticated user
export const getSavedPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const savedPostIds = user.savedPosts;

    if (savedPostIds.length === 0) {
        return res.status(200).json(new ApiResponse(200, {
            posts: [],
            totalPages: 0,
            currentPage: page,
            totalPosts: 0
        }, "No saved posts found"));
    }

    const posts = await Post.find({ _id: { $in: savedPostIds } })
        .populate('author', 'fullName avatar')
        .populate('community', 'name members')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const totalPosts = savedPostIds.length;

    res.status(200).json(new ApiResponse(200, {
        posts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        totalPosts
    }, "Saved posts fetched successfully"));
});