import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Community } from "../models/community.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { cloudinaryCommunityRefer } from "../utils/constants.utils.js";
import { logActivity } from "../utils/logActivity.utils.js";

// Create a new community
export const createCommunity = asyncHandler(async (req, res) => {
    const { title, description, name } = req.body;
    const creator = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const communityName = name || title; // Use title as fallback for name

    const existingCommunity = await Community.findOne({ 
        $or: [
            { title: title.toLowerCase() },
            { name: communityName.toLowerCase() }
        ]
    });
    if (existingCommunity) {
        throw new ApiError(400, "Community with this title or name already exists");
    }

    // Handle avatar upload
    let avatar = {};
    const avatarFile = req.files?.find(file => file.fieldname === 'avatar');
    if (avatarFile) {
        const avatarUpload = await uploadOnCloudinary(avatarFile.path, cloudinaryCommunityRefer, req.user, avatarFile.originalname);
        if (avatarUpload) {
            avatar = {
                public_id: avatarUpload.public_id,
                secure_url: avatarUpload.secure_url
            };
        }
    }

    // Handle banner upload
    let banner = {};
    const bannerFile = req.files?.find(file => file.fieldname === 'banner');
    if (bannerFile) {
        const bannerUpload = await uploadOnCloudinary(bannerFile.path, cloudinaryCommunityRefer, req.user, bannerFile.originalname);
        if (bannerUpload) {
            banner = {
                public_id: bannerUpload.public_id,
                secure_url: bannerUpload.secure_url
            };
        }
    }

// In createCommunity
const community = await Community.create({
    name: communityName.toLowerCase(),
    title: title.toLowerCase(),
    description,
    creator_id: {
        _id: creator,
        username: req.user.username,
        avatar: req.user.avatar
    },
    members: [creator],
    moderators: [creator],
    avatar,
    banner,
    members_count: 1
});

    await community.populate('members', 'username avatar');
    await community.populate('moderators', 'username avatar');

    await logActivity(
        creator,
        "community",
        `${req.user.username} created community: ${title}`,
        req,
        'community',
        community._id
    );

    // Increment num_communities for creator
    await User.findByIdAndUpdate(creator, { $inc: { num_communities: 1 } });

    res.status(201).json(new ApiResponse(201, community, "Community created successfully"));
});

// Get all communities
export const getAllCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({})
        .populate('members', 'username avatar')
        .select('name title description avatar banner members_count createdAt')
        .sort({ members_count: -1, createdAt: -1 });

    res.status(200).json(new ApiResponse(200, communities, "Communities fetched successfully"));
});

// Get community by ID or name
export const getCommunityById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let community;
    // Check if id is a valid ObjectId, if not, treat it as name
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        // It's an ObjectId
        community = await Community.findById(id)
            .populate('members', 'username avatar')
            .populate('moderators', 'username avatar');
    } else {
        // Treat as community name
        community = await Community.findOne({ name: id.toLowerCase() })
            .populate('members', 'username avatar')
            .populate('moderators', 'username avatar');
    }

    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    res.status(200).json(new ApiResponse(200, community, "Community fetched successfully"));
});

// Join community
export const joinCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (community.members.includes(userId)) {
        throw new ApiError(400, "Already a member of this community");
    }

    community.members.push(userId);
    community.members_count = community.members.length;
    await community.save();

    // Add to user's communities_followed
    await User.findByIdAndUpdate(userId, { $push: { communities_followed: id } });

    await logActivity(
        userId,
        "join-community",
        `${req.user.username} joined community: ${community.title}`,
        req,
        'community',
        id
    );

    // Populate members for consistent response
    await community.populate('members', 'username avatar');

    res.status(200).json(new ApiResponse(200, community, "Joined community successfully"));
});

// Leave community
export const leaveCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (!community.members.includes(userId)) {
        throw new ApiError(400, "Not a member of this community");
    }

    community.members = community.members.filter(member => member.toString() !== userId.toString());
    community.members_count = community.members.length;
    await community.save();

    // Remove from user's communities_followed
    await User.findByIdAndUpdate(userId, { $pull: { communities_followed: id } });

    await logActivity(
        userId,
        "leave-community",
        `${req.user.username} left community: ${community.title}`,
        req,
        'community',
        id
    );

    // Populate members for consistent response
    await community.populate('members', 'username avatar');

    res.status(200).json(new ApiResponse(200, community, "Left community successfully"));
});

// Update community (only moderators)
export const updateCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, rules, is_private } = req.body;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (!community.moderators.includes(userId)) {
        throw new ApiError(403, "Only moderators can update community");
    }

    community.description = description || community.description;
    community.rules = rules || community.rules;
    community.is_private = is_private !== undefined ? is_private : community.is_private;

    await community.save();

    await logActivity(
        userId,
        "update-community",
        `${req.user.username} updated community: ${community.title}`,
        req,
        'community',
        id
    );

    res.status(200).json(new ApiResponse(200, community, "Community updated successfully"));
});

// Delete community (only creator)
export const deleteCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (community.creator_id._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Only creator can delete community");
    }

    await logActivity(
        userId,
        "delete-community",
        `${req.user.username} deleted community: ${community.title}`,
        req,
        'community',
        id
    );

    await Community.findByIdAndDelete(id);

    // Decrement num_communities for creator
    await User.findByIdAndUpdate(userId, { $inc: { num_communities: -1 } });

    res.status(200).json(new ApiResponse(200, null, "Community deleted successfully"));
});