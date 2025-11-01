import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { Community } from "../models/community.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { cloudinaryCommunityRefer } from "../utils/constants.utils.js";

// Create a new community
export const createCommunity = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const creator = req.user._id;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    const existingCommunity = await Community.findOne({ name: name.toLowerCase() });
    if (existingCommunity) {
        throw new ApiError(400, "Community with this name already exists");
    }

    // Handle avatar upload
    let avatar = {};
    if (req.files?.avatar?.[0]) {
        const avatarUpload = await uploadOnCloudinary(req.files.avatar[0].path, cloudinaryCommunityRefer, req.user, req.files.avatar[0].originalname);
        if (avatarUpload) {
            avatar = {
                public_id: avatarUpload.public_id,
                secure_url: avatarUpload.secure_url
            };
        }
    }

    // Handle banner upload
    let banner = {};
    if (req.files?.banner?.[0]) {
        const bannerUpload = await uploadOnCloudinary(req.files.banner[0].path, cloudinaryCommunityRefer, req.user, req.files.banner[0].originalname);
        if (bannerUpload) {
            banner = {
                public_id: bannerUpload.public_id,
                secure_url: bannerUpload.secure_url
            };
        }
    }

// In createCommunity
const community = await Community.create({
    name: name.toLowerCase(),
    description,
    creator: {
        _id: creator,
        fullName: req.user.fullName,
        avatar: req.user.avatar
    },
    members: [creator],
    moderators: [creator],
    avatar,
    banner,
    memberCount: 1
});

    await community.populate('members', 'fullName avatar');
    await community.populate('moderators', 'fullName avatar');

    res.status(201).json(new ApiResponse(201, community, "Community created successfully"));
});

// Get all communities
export const getAllCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find({})
        .populate('members', 'fullName avatar')
        .select('name description avatar banner memberCount createdAt')
        .sort({ memberCount: -1, createdAt: -1 });

    res.status(200).json(new ApiResponse(200, communities, "Communities fetched successfully"));
});

// Get community by ID
export const getCommunityById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const community = await Community.findById(id)
        .populate('members', 'fullName avatar')
        .populate('moderators', 'fullName avatar');

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
    community.memberCount = community.members.length;
    await community.save();

    // Populate members for consistent response
    await community.populate('members', 'fullName avatar');

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
    community.memberCount = community.members.length;
    await community.save();

    // Populate members for consistent response
    await community.populate('members', 'fullName avatar');

    res.status(200).json(new ApiResponse(200, community, "Left community successfully"));
});

// Update community (only moderators)
export const updateCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, rules, isPrivate } = req.body;
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
    community.isPrivate = isPrivate !== undefined ? isPrivate : community.isPrivate;

    await community.save();

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

    if (community.creator._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Only creator can delete community");
    }

    await Community.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, "Community deleted successfully"));
});