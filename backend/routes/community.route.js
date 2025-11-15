import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

import {
    createCommunity,
    getAllCommunities,
    getCommunityById,
    joinCommunity,
    leaveCommunity,
    updateCommunity,
    addModerator,
    removeModerator,
    deleteCommunity
} from "../controllers/community.controller.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'public/temp/' });

// Public routes
router.route("/").get(getAllCommunities);
router.route("/:id").get(getCommunityById);

// Protected routes
router.route("/").post(verifyJWT, upload.any(), createCommunity);
router.route("/:id/join").post(verifyJWT, joinCommunity);
router.route("/:id/leave").post(verifyJWT, leaveCommunity);
router.route("/:id").put(verifyJWT, updateCommunity);
router.route("/:id/moderator").post(verifyJWT, addModerator);
router.route("/:id/moderator").delete(verifyJWT, removeModerator);
router.route("/:id").delete(verifyJWT, deleteCommunity);

export default router;