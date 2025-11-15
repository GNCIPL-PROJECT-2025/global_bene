import express from "express";
import { customRoles, verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";
import {
    getAllUsers,
    getOneUser,
    adminUpdateUserProfile,
    adminUpdateUserAvatar,
    adminChangeUserRole,
    adminStats,
    adminDeleteUser,
    adminAddMemberToCommunity,
    adminRemoveMemberFromCommunity,
    adminDeletePost,
    adminDeleteCommunity
} from "../controllers/admin.controller.js";

import {
    getSpamReports,
    getSpamReportById,
    resolveSpamReport,
    getFlaggedPosts,
    adminApproveFlaggedPost,
    adminRemoveFlaggedPost
} from "../controllers/admin.controller.js";

const router = express.Router()


// *all access
router.route("/users").get(verifyJWT, customRoles("admin"), getAllUsers)
router.route("/user/:id").get(verifyJWT, customRoles("admin"), getOneUser)
    .put(verifyJWT, customRoles("admin"), adminUpdateUserProfile)
    .delete(verifyJWT, customRoles("admin"), adminDeleteUser)


router.route("/user-avatar/:id").put(verifyJWT, customRoles("admin"), upload.single("avatar"), adminUpdateUserAvatar)

router.route("/change-role/:userId").put(verifyJWT, customRoles("admin"), adminChangeUserRole)

router.route("/stats").get(verifyJWT, customRoles("admin"), adminStats)

// Community management
router.route("/community/add-member").post(verifyJWT, customRoles("admin"), adminAddMemberToCommunity)
router.route("/community/remove-member").post(verifyJWT, customRoles("admin"), adminRemoveMemberFromCommunity)
router.route("/community/:communityId").delete(verifyJWT, customRoles("admin"), adminDeleteCommunity)

// Post management
router.route("/post/:postId").delete(verifyJWT, customRoles("admin"), adminDeletePost)

// Spam reports / flagged posts management
router.route('/spam-reports').get(verifyJWT, customRoles('admin'), getSpamReports);
router.route('/spam-reports/:id').get(verifyJWT, customRoles('admin'), getSpamReportById);
router.route('/spam-reports/:id/resolve').put(verifyJWT, customRoles('admin'), resolveSpamReport);

router.route('/flagged-posts').get(verifyJWT, customRoles('admin'), getFlaggedPosts);
router.route('/flagged-posts/:postId/approve').put(verifyJWT, customRoles('admin'), adminApproveFlaggedPost);
router.route('/flagged-posts/:postId/remove').delete(verifyJWT, customRoles('admin'), adminRemoveFlaggedPost);

export default router;