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
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("req.user:", req.user);
    const { title, description, name, rules } = req.body;
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
    console.log("existingCommunity:", existingCommunity);
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

    // Parse rules if provided
    let parsedRules = [];
    if (rules) {
        try {
            parsedRules = JSON.parse(rules);
        } catch (error) {
            console.log("Error parsing rules:", error);
        }
    }

// In createCommunity
const community = await Community.create({
    name: communityName.toLowerCase(),
    title: title.toLowerCase(),
    description,
    creator_id: {
        _id: creator,
        username: req.user.username || req.user.email?.split('@')[0] || 'User',
        avatar: req.user.avatar
    },
    members: [creator],
    moderators: [creator],
    avatar,
    banner,
    rules: parsedRules,
    members_count: 1
});

    await community.populate('members', '_id username email avatar');
    await community.populate('moderators', '_id username email avatar');

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
        .populate('members', '_id username email avatar')
        .select('name title description avatar banner members_count createdAt')
        .sort({ members_count: -1, createdAt: -1 });

    res.status(200).json(new ApiResponse(200, communities, "Communities fetched successfully"));
});

// Get community by ID
export const getCommunityById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const community = await Community.findById(id)
        .populate('members', '_id username email avatar')
        .populate('moderators', '_id username email avatar');

    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    res.status(200).json(new ApiResponse(200, community, "Community fetched successfully"));
});

// Get community by name
export const getCommunityByName = asyncHandler(async (req, res) => {
    const { name } = req.params;

    const community = await Community.findOne({ name: name.toLowerCase() })
        .populate('members', '_id username email avatar')
        .populate('moderators', '_id username email avatar');

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
    await community.populate('members', '_id username email avatar');

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
    await community.populate('members', '_id username email avatar');

    res.status(200).json(new ApiResponse(200, community, "Left community successfully"));
});

// Update community (only creator)
export const updateCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, rules, is_private } = req.body;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (community.creator_id._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Only creator can update community");
    }

    // Handle avatar upload
    if (req.files && req.files.find(file => file.fieldname === 'avatar')) {
        const avatarFile = req.files.find(file => file.fieldname === 'avatar');
        const avatarUpload = await uploadOnCloudinary(avatarFile.path, cloudinaryCommunityRefer, req.user, avatarFile.originalname);
        if (avatarUpload) {
            community.avatar = {
                public_id: avatarUpload.public_id,
                secure_url: avatarUpload.secure_url
            };
        }
    }

    // Handle banner upload
    if (req.files && req.files.find(file => file.fieldname === 'banner')) {
        const bannerFile = req.files.find(file => file.fieldname === 'banner');
        const bannerUpload = await uploadOnCloudinary(bannerFile.path, cloudinaryCommunityRefer, req.user, bannerFile.originalname);
        if (bannerUpload) {
            community.banner = {
                public_id: bannerUpload.public_id,
                secure_url: bannerUpload.secure_url
            };
        }
    }

    // Update other fields
    community.description = description !== undefined ? description : community.description;
    if (rules !== undefined) {
        try {
            community.rules = JSON.parse(rules);
        } catch (error) {
            console.log("Error parsing rules:", error);
        }
    }
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

// Remove member from community (only creator/moderators)
export const removeMemberFromCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    if (!memberId) {
        throw new ApiError(400, "Member ID is required");
    }

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    // Check if user is creator or moderator
    const isCreator = community.creator_id._id.toString() === userId.toString();
    const isModerator = community.moderators.some(mod => mod.toString() === userId.toString());

    if (!isCreator && !isModerator) {
        throw new ApiError(403, "Only creator or moderators can remove members");
    }

    // Check if member exists in community
    if (!community.members.includes(memberId)) {
        throw new ApiError(400, "Member not found in community");
    }

    // Prevent removing the creator
    if (community.creator_id._id.toString() === memberId.toString()) {
        throw new ApiError(400, "Cannot remove community creator");
    }

    // Remove member from community
    community.members = community.members.filter(member => member.toString() !== memberId.toString());
    community.moderators = community.moderators.filter(mod => mod.toString() !== memberId.toString());
    community.members_count = community.members.length;
    await community.save();

    // Remove community from user's followed communities
    await User.findByIdAndUpdate(memberId, { $pull: { communities_followed: id } });

    await logActivity(
        userId,
        "remove-member",
        `${req.user.username} removed a member from community: ${community.title}`,
        req,
        'community',
        id
    );

    await community.populate('members', '_id username email avatar');
    await community.populate('moderators', '_id username email avatar');

    res.status(200).json(new ApiResponse(200, community, "Member removed successfully"));
});

// Promote member to moderator (only creator)
export const promoteToModerator = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    if (!memberId) {
        throw new ApiError(400, "Member ID is required");
    }

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    // Check if user is creator
    if (community.creator_id._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Only creator can promote members to moderator");
    }

    // Check if member exists in community
    if (!community.members.includes(memberId)) {
        throw new ApiError(400, "Member not found in community");
    }

    // Check if already moderator
    if (community.moderators.includes(memberId)) {
        throw new ApiError(400, "Member is already a moderator");
    }

    // Promote to moderator
    community.moderators.push(memberId);
    await community.save();

    await logActivity(
        userId,
        "promote-moderator",
        `${req.user.username} promoted a member to moderator in community: ${community.title}`,
        req,
        'community',
        id
    );

    await community.populate('members', '_id username email avatar');
    await community.populate('moderators', '_id username email avatar');

    res.status(200).json(new ApiResponse(200, community, "Member promoted to moderator successfully"));
});

// Demote moderator to member (only creator)
export const demoteFromModerator = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    if (!memberId) {
        throw new ApiError(400, "Member ID is required");
    }

    const community = await Community.findById(id);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    // Check if user is creator
    if (community.creator_id._id.toString() !== userId.toString()) {
        throw new ApiError(403, "Only creator can demote moderators");
    }

    // Check if member is moderator
    if (!community.moderators.includes(memberId)) {
        throw new ApiError(400, "Member is not a moderator");
    }

    // Prevent demoting the creator
    if (community.creator_id._id.toString() === memberId.toString()) {
        throw new ApiError(400, "Cannot demote community creator");
    }

    // Demote from moderator
    community.moderators = community.moderators.filter(mod => mod.toString() !== memberId.toString());
    await community.save();

    await logActivity(
        userId,
        "demote-moderator",
        `${req.user.username} demoted a moderator in community: ${community.title}`,
        req,
        'community',
        id
    );

    await community.populate('members', '_id username email avatar');
    await community.populate('moderators', '_id username email avatar');

    res.status(200).json(new ApiResponse(200, community, "Moderator demoted successfully"));
});