import { Router } from "express";
import { Community } from "../models/Community.js";
import jwt from "jsonwebtoken";

const router = Router();

// Simple JWT verification middleware
const verifyJWT = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// ✅ POST /api/v1/communities - Create a community
router.post("/", verifyJWT, async (req, res) => {
  try {
    const { name, title, description, isPrivate } = req.body;
    const existing = await Community.findOne({ name });
    if (existing)
      return res.status(400).json({ error: "Community name already exists" });

    const community = new Community({
      name,
      title,
      description,
      creatorId: req.user.id,
      moderators: [req.user.id],
      members: [req.user.id],
      membersCount: 1,
      isPrivate,
    });

    await community.save();
    res.status(201).json({ success: true, community });
  } catch (err) {
    console.error("create community err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET /api/v1/communities - Get all communities
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find()
      .select("name title description membersCount isPrivate createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: communities.length,
      communities,
    });
  } catch (err) {
    console.error("getAllCommunities err", err);
    res.status(500).json({ error: "Server error while fetching communities" });
  }
});

// ✅ GET /api/v1/communities/:name - Get single community by name
router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const community = await Community.findOne({ name })
      .populate("creatorId", "username email")
      .populate("moderators", "username email")
      .populate("members", "username email");

    if (!community)
      return res.status(404).json({ error: "Community not found" });

    res.status(200).json({
      success: true,
      community,
    });
  } catch (err) {
    console.error("getCommunityByName err", err);
    res.status(500).json({ error: "Server error while fetching community" });
  }
});

// ✅ PUT /api/v1/communities/:id - Update community (moderator only)
router.put("/:id", verifyJWT, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ error: "Community not found" });

    if (!community.moderators.includes(req.user.id))
      return res
        .status(403)
        .json({ error: "Only moderators can update community" });

    const { title, description, rules, isPrivate } = req.body;
    if (title) community.title = title;
    if (description) community.description = description;
    if (rules) community.rules = rules;
    if (typeof isPrivate !== "undefined") community.isPrivate = isPrivate;

    await community.save();
    res.json({ success: true, message: "Community updated", community });
  } catch (err) {
    console.error("updateCommunity err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /api/v1/communities/:id/join - Join community
router.post("/:id/join", verifyJWT, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ error: "Community not found" });

    if (community.members.includes(req.user.id))
      return res.status(400).json({ error: "Already a member" });

    community.members.push(req.user.id);
    community.membersCount = community.members.length;
    await community.save();

    res.json({ success: true, message: "Joined community successfully" });
  } catch (err) {
    console.error("joinCommunity err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /api/v1/communities/:id/leave - Leave community
router.post("/:id/leave", verifyJWT, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ error: "Community not found" });

    community.members.pull(req.user.id);
    community.membersCount = community.members.length;
    await community.save();

    res.json({ success: true, message: "Left community successfully" });
  } catch (err) {
    console.error("leaveCommunity err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST /api/v1/communities/:id/mods - Assign moderator
router.post("/:id/mods", verifyJWT, async (req, res) => {
  try {
    const { userId } = req.body;
    const community = await Community.findById(req.params.id);
    if (!community)
      return res.status(404).json({ error: "Community not found" });

    if (!community.creatorId.equals(req.user.id))
      return res
        .status(403)
        .json({ error: "Only creator can assign moderators" });

    community.moderators.addToSet(userId);
    await community.save();

    res.json({ success: true, message: "Moderator added successfully" });
  } catch (err) {
    console.error("assignModerator err", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
