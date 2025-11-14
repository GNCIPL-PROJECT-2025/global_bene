import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

import {
    createCommunity,
    getAllCommunities,
    getCommunityById,
    getCommunityByName,
    joinCommunity,
    leaveCommunity,
    updateCommunity,
    deleteCommunity,
    removeMemberFromCommunity,
    promoteToModerator,
    demoteFromModerator
} from "../controllers/community.controller.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: '../public/temp/' });

// Public routes
router.route("/").get(getAllCommunities);
router.route("/name/:name").get(getCommunityByName);
router.route("/:id").get(getCommunityById);

// Protected routes
router.route("/").post(verifyJWT, upload.any(), createCommunity);
router.route("/:id/join").post(verifyJWT, joinCommunity);
router.route("/:id/leave").post(verifyJWT, leaveCommunity);
router.route("/:id").put(verifyJWT, upload.any(), updateCommunity);
router.route("/:id").delete(verifyJWT, deleteCommunity);

// Member management routes (creator/moderator only)
router.route("/:id/remove-member").post(verifyJWT, removeMemberFromCommunity);
router.route("/:id/promote-moderator").post(verifyJWT, promoteToModerator);
router.route("/:id/demote-moderator").post(verifyJWT, demoteFromModerator);

export default router;