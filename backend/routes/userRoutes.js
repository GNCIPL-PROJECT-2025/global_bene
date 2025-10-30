import { Router } from "express";
const router = Router();
import { authRequired } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/userController.js";

//  Get current user profile
// router.get('/me', authRequired, getProfile);

//  Update profile (name, bio, social links)
// router.put('/update', authRequired, updateProfile);

//  If avatar is being sent as a file (multipart/form-data)
// router.put('/avatar', authRequired, upload.single('avatar'), changeAvatar);

//  Follow user
router.post("/follow/:id", authRequired, followUser);

//  Unfollow user
router.post("/unfollow/:id", authRequired, unfollowUser);

//  Get followers list
router.get("/followers", authRequired, getFollowers);

//  Get following list
router.get("/following", authRequired, getFollowing);

export default router;
