import { Community } from "../models/community.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js"; // ✅ Custom error class (like in your example)

// ✅ Create a new community
export const createCommunity = asyncHandler(async (req, res, next) => {
  const { name, title, description, isPrivate } = req.body;

  const existing = await Community.findOne({ name });
  if (existing)
    return next(new ErrorHandler("Community name already exists", 400));

  const community = new Community({
    name,
    title,
    description,
    creatorId: req.user._id,
    moderators: [req.user._id],
    members: [req.user._id],
    membersCount: 1,
    isPrivate,
  });

  await community.save();

  res.status(201).json({
    success: true,
    message: "Community created successfully",
    community,
  });
});

// ✅ Get all communities
export const getAllCommunities = asyncHandler(async (req, res, next) => {
  const communities = await Community.find()
    .select("name title description membersCount isPrivate createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: communities.length,
    communities,
  });
});

// ✅ Get single community by name
export const getCommunityByName = asyncHandler(async (req, res, next) => {
  const { name } = req.params;

  const community = await Community.findOne({ name })
    .populate("creatorId", "username email")
    .populate("moderators", "username email")
    .populate("members", "username email");

  if (!community) return next(new ErrorHandler("Community not found", 404));

  res.status(200).json({
    success: true,
    community,
  });
});

// ✅ Update community (moderator only)
export const updateCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id);
  if (!community) return next(new ErrorHandler("Community not found", 404));

  if (!community.moderators.includes(req.user._id))
    return next(new ErrorHandler("Only moderators can update community", 403));

  const { title, description, rules, isPrivate } = req.body;
  if (title) community.title = title;
  if (description) community.description = description;
  if (rules) community.rules = rules;
  if (typeof isPrivate !== "undefined") community.isPrivate = isPrivate;

  await community.save();

  res.status(200).json({
    success: true,
    message: "Community updated successfully",
    community,
  });
});

// ✅ Join a community
export const joinCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id);
  if (!community) return next(new ErrorHandler("Community not found", 404));

  if (community.members.includes(req.user._id))
    return next(new ErrorHandler("Already a member", 400));

  community.members.push(req.user._id);
  community.membersCount = community.members.length;
  await community.save();

  res.status(200).json({
    success: true,
    message: "Joined community successfully",
  });
});

// ✅ Leave a community
export const leaveCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id);
  if (!community) return next(new ErrorHandler("Community not found", 404));

  community.members.pull(req.user._id);
  community.membersCount = community.members.length;
  await community.save();

  res.status(200).json({
    success: true,
    message: "Left community successfully",
  });
});

// ✅ Assign a moderator (creator only)
export const assignModerator = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const community = await Community.findById(req.params.id);
  if (!community) return next(new ErrorHandler("Community not found", 404));

  if (!community.creatorId.equals(req.user._id))
    return next(new ErrorHandler("Only creator can assign moderators", 403));

  community.moderators.addToSet(userId);
  await community.save();

  res.status(200).json({
    success: true,
    message: "Moderator added successfully",
  });
});
