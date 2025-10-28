const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getProfile,
    updateProfile,
    changeAvatar,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} = require('../controllers/userController');

//  Get current user profile
// router.get('/me', authRequired, getProfile);

//  Update profile (name, bio, social links)
// router.put('/update', authRequired, updateProfile);

//  If avatar is being sent as a file (multipart/form-data)
// router.put('/avatar', authRequired, upload.single('avatar'), changeAvatar);

//  Follow user
router.post('/follow/:id', authRequired, followUser);

//  Unfollow user
router.post('/unfollow/:id', authRequired, unfollowUser);

//  Get followers list
router.get('/followers', authRequired, getFollowers);

//  Get following list
router.get('/following', authRequired, getFollowing);

module.exports = router;
