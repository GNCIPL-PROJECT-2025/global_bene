import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Community } from "../models/community.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Search communities
export const searchCommunities = asyncHandler(async (req, res) => {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(200).json(new ApiResponse(200, [], "Search query too short"));
    }

    const communities = await Community.find({
        $or: [
            { name: { $regex: q.trim(), $options: 'i' } },
            { title: { $regex: q.trim(), $options: 'i' } },
            { description: { $regex: q.trim(), $options: 'i' } }
        ]
    })
    .select('name title description category avatar members_count createdAt')
    .sort({ members_count: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json(new ApiResponse(200, communities, "Communities searched successfully"));
});

// Search posts
export const searchPosts = asyncHandler(async (req, res) => {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(200).json(new ApiResponse(200, [], "Search query too short"));
    }

    const posts = await Post.find({
        status: 'active',
        $or: [
            { title: { $regex: q.trim(), $options: 'i' } },
            { body: { $regex: q.trim(), $options: 'i' } },
            { tags: { $in: [new RegExp(q.trim(), 'i')] } }
        ]
    })
    .populate('author_id', 'username avatar')
    .populate('community_id', 'title name')
    .select('title body author_id community_id createdAt score upvotes downvotes type media url')
    .sort({ score: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json(new ApiResponse(200, posts, "Posts searched successfully"));
});

// Search users
export const searchUsers = asyncHandler(async (req, res) => {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(200).json(new ApiResponse(200, [], "Search query too short"));
    }

    const users = await User.find({
        $or: [
            { username: { $regex: q.trim(), $options: 'i' } },
            { email: { $regex: q.trim(), $options: 'i' } }
        ]
    })
    .select('username email avatar createdAt num_posts num_comments karma')
    .sort({ karma: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json(new ApiResponse(200, users, "Users searched successfully"));
});

// Combined search
export const searchAll = asyncHandler(async (req, res) => {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(200).json(new ApiResponse(200, {
            communities: [],
            posts: [],
            users: []
        }, "Search query too short"));
    }

    const [communities, posts, users] = await Promise.all([
        Community.find({
            $or: [
                { name: { $regex: q.trim(), $options: 'i' } },
                { title: { $regex: q.trim(), $options: 'i' } },
                { description: { $regex: q.trim(), $options: 'i' } }
            ]
        })
        .select('name title description category avatar members_count createdAt')
        .sort({ members_count: -1, createdAt: -1 })
        .limit(parseInt(limit)),

        Post.find({
            status: 'active',
            $or: [
                { title: { $regex: q.trim(), $options: 'i' } },
                { body: { $regex: q.trim(), $options: 'i' } },
                { tags: { $in: [new RegExp(q.trim(), 'i')] } }
            ]
        })
        .populate('author_id', 'username avatar')
        .populate('community_id', 'title name')
        .select('title body author_id community_id createdAt score upvotes downvotes type media url')
        .sort({ score: -1, createdAt: -1 })
        .limit(parseInt(limit)),

        User.find({
            $or: [
                { username: { $regex: q.trim(), $options: 'i' } },
                { email: { $regex: q.trim(), $options: 'i' } }
            ]
        })
        .select('username email avatar createdAt num_posts num_comments')
        .sort({ num_posts: -1, createdAt: -1 })
        .limit(parseInt(limit))
    ]);

    res.status(200).json(new ApiResponse(200, {
        communities,
        posts,
        users
    }, "Search completed successfully"));
});
