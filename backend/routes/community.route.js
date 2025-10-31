import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCommunity,
  getAllCommunities,
  getCommunityByName,
  updateCommunity,
  joinCommunity,
  leaveCommunity,
  assignModerator,
} from "../controllers/community.controller.js";

const router = express.Router();

// Routes
router.post("/", verifyJWT, createCommunity);
router.get("/", getAllCommunities);
router.get("/:name", getCommunityByName);
router.put("/:id", verifyJWT, updateCommunity);
router.post("/:id/join", verifyJWT, joinCommunity);
router.post("/:id/leave", verifyJWT, leaveCommunity);
router.post("/:id/mods", verifyJWT, assignModerator);

export default router;
