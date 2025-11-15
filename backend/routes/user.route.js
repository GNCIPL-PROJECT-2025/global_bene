import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from '../config/passport.js';

import {
    registerUser,
    loginUser,
    logoutUser,
    sendOtpToUser,
    verifyOtpForUser,
    sendResetPasswordLinkToUser,
    resetPassword,
    changeCurrentPassword,
    getLoggedInUserInfo,
    updateUserProfile,
    deleteUser,
    updateUserAvatar,
    followUser,
    unfollowUser,
    getUserFollowers,
    getUserFollowing,
    getUserProfileByUsername,
    googleAuthCallback,
    refreshAccessToken,
    sendEmailVerification,
    verifyEmail
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router()

// *==========================
// *User Routes

// *Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleAuthCallback);

// *Register and login routes
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

// *OTP routes
router.route("/send-otp").post(sendOtpToUser)
router.route("/verify-otp").post(verifyOtpForUser)

// *Forgot password flow
router.route("/password/forgot-password").post(sendResetPasswordLinkToUser)
router.route("/password/forgot-password/:token").post(resetPassword)

// *Authenticated user routes
router.route("/password/update-password").put(verifyJWT, changeCurrentPassword)
router.route("/dashboard").get(verifyJWT, getLoggedInUserInfo)
router.route("/update-profile").put(verifyJWT, updateUserProfile)
router.route("/update-avatar").put(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/delete-profile").delete(verifyJWT, deleteUser)
router.route("/follow/:targetUserId").post(verifyJWT, followUser)
router.route("/unfollow/:targetUserId").post(verifyJWT, unfollowUser)
router.route("/:userId/followers").get(verifyJWT, getUserFollowers)
router.route("/:userId/following").get(verifyJWT, getUserFollowing)
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/profile/:username").get(verifyJWT, getUserProfileByUsername)
router.route("/refresh-token").post(refreshAccessToken)

// *Email verification routes
router.route("/send-email-verification").post(verifyJWT, sendEmailVerification)
router.route("/verify-email").post(verifyJWT, verifyEmail)


export default router;