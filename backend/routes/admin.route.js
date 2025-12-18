import express from "express";
import { customRoles, verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";
import {
    getAllUsers,
    getOneUser,
    adminUpdateUserProfile,
    adminUpdateUserAvatar,
    adminDeleteUser,
    getAdminStats,
    adminChangeUserRole,
    getAllPostsForAdmin,
    getAllCommunitiesForAdmin,
    adminDeletePost,
    adminDeleteCommunity,
    adminAddMemberToCommunity,
    adminRemoveMemberFromCommunity,
    getSpamReports,
    resolveSpamReport,
    getFlaggedPosts,
    approveFlaggedPost,
    removeFlaggedPost
} from "../controllers/admin.controller.js";

const router = express.Router()

// All routes require JWT verification and admin role
router.use(verifyJWT, customRoles("admin"));

// User management
router.route("/users").get(getAllUsers)
router.route("/user/:id")
    .get(getOneUser)
    .put(adminUpdateUserProfile)
    .delete(adminDeleteUser)

router.route("/user-avatar/:id").put(upload.single("avatar"), adminUpdateUserAvatar)

// User role management
router.route("/change-role/:id").put(adminChangeUserRole)

// Stats
router.route("/stats").get(getAdminStats)

// Posts management
router.route("/posts").get(getAllPostsForAdmin)
router.route("/post/:id").delete(adminDeletePost)

// Communities management
router.route("/communities").get(getAllCommunitiesForAdmin)
router.route("/community/:id").delete(adminDeleteCommunity)
router.route("/community/add-member").post(adminAddMemberToCommunity)
router.route("/community/remove-member").post(adminRemoveMemberFromCommunity)

// Spam reports
router.route("/spam-reports").get(getSpamReports)
router.route("/spam-reports/:id/resolve").put(resolveSpamReport)

// Flagged posts
router.route("/flagged-posts").get(getFlaggedPosts)
router.route("/flagged-posts/:id/approve").put(approveFlaggedPost)
router.route("/flagged-posts/:id/remove").delete(removeFlaggedPost)

export default router;
