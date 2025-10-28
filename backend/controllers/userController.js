const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

//  Get profile
// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

//  Update basic profile info
// exports.updateProfile = async (req, res) => {
//   try {
//     const { displayName, bio, socialLinks } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { displayName, bio, socialLinks },
//       { new: true }
//     ).select('-password');

//     res.json({ message: 'Profile updated', user });
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

//  Change avatar using cloudinary

// exports.changeAvatar = async (req, res) => {
//   try {
    
//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded. Use form-data with key "avatar"' });
//     }

    
//     const result = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { folder: 'avatars' },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );
//       uploadStream.end(req.file.buffer);
//     });

//     // Update user in DB
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { avatarUrl: result.secure_url },
//       { new: true }
//     ).select('-password');

//     res.json({ message: 'Avatar updated successfully', avatarUrl: result.secure_url });
//   } catch (error) {
//     console.error('Avatar Upload Error:', error);
//     res.status(500).json({ message: 'Upload Failed', error: error.message });
//   }
// };

// Follow User
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId }
    });

    res.json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Unfollow User
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId }
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId }
    });

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Get Followers list
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('followers', 'username displayName avatarUrl');
    res.json({ followers: user.followers });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//  Get Following list
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', 'username displayName avatarUrl');
    res.json({ following: user.following });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
