// adminChangeUserRole → promote/demote users (role: user/admin)

// adminStats → quick dashboard (e.g., total users, active today, uploads count)

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import crypto from "crypto"

import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Community } from "../models/community.model.js";
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { cloudinaryAvatarRefer } from "../utils/constants.utils.js";
import { logActivity } from "../utils/logActivity.utils.js";
import { SpamPost } from "../models/report.model.js";


// *================================================================================
const getAllUsers = asyncHandler(async (req, res, next) => {
    const allUsers = await User.find({})

    if (!allUsers) {
        return next(new ErrorHandler("No user find, please check the database for more info", 404))
    }

    return res.status(200).json({
        success: true,
        allUsers,
        message: "Found successfully"
    })
});

// *Single user
const getOneUser = asyncHandler(async (req, res, next) => {
    const { userId } = req.params?.id
    console.log(req.params)
    const user = await User.findOne(userId)

    if (!user) {
        return next(new ErrorHandler("No user exist/found, please check the id for debud info", 404))
    }

    return res.status(200).json({
        success: true,
        user,
        message: "User Found successfully"
    })
})



// *Update Profile
const adminUpdateUserProfile = asyncHandler(async (req, res, next) => {
    const userId = req.params?.id
    const { username, email, phone, gender, social_links = {} } = req.body
    console.log("req.body[registerUser]:\n", req.body)

    const requiredFields = [email, phone]
    // console.log("requiredFields", requiredFields)

    const checkFields = { email, phone }
    // console.log("Check Fields", checkFields)

    // *Required Fields_____________________________________________
    if (!username || !email || !phone) {
        console.error("emptyError")
        return next(new ErrorHandler("All Fields are required", 400))
    }


    // *Check for an existing User__________________________________________________
    const existingUser = await User.findOne({
        _id: { $ne: userId }, // Exclude the current user
        $or: Object.entries(checkFields).map(([key, value]) => ({ [key]: value }))
    })

    if (existingUser) {
        const duplicateField = Object.keys(checkFields).find(key => existingUser[key].toString().toLowerCase() === checkFields[key].toString().toLowerCase())
        // console.log("duplicateFiels:\n", duplicateField, checkFields[duplicateField], existingUser[duplicateField])
        return res.status(400).json({
            success: false,
            message: `User already exist with the same ${duplicateField}: "${checkFields[duplicateField]}"\nPlease try unique one!`,
            duplicateField
        })
        // return next(new ErrorHandler(`User already exist with the same ${duplicateField}: "${checkFields[duplicateField]}"\nPlease try unique one!`, 400))
    }

    try {
        Object.entries(social_links).forEach(([platform, url]) => {
            if (url) {
                try {
                    // Ensure URL is valid
                    const parsed = new URL(url);

                    // 1. Protocol must be HTTPS
                    if (parsed.protocol !== "https:") {
                        throw new Error(`${platform} link must start with https://`);
                    }

                    // 2. Hostname must contain platform domain (except for website)
                    if (platform !== "website" && !parsed.hostname.includes(`${platform}.com`)) {
                        throw new Error(`${platform} link must be a valid ${platform}.com domain`);
                    }

                } catch (e) {
                    throw new Error(`${platform} link is invalid. Please enter a valid full https link.`);
                }
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(403).json({
            error: "You must provide full links with http(s) included"
        });
    }




    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, email, phone, gender, social_links },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        return next(new ErrorHandler("User not found", 404));
    }

    await logActivity(
        req.user._id,
        "admin-update-profile",
        `Admin ${req.user.username} updated profile for ${updatedUser.username}`,
        req,
        'user',
        updatedUser._id
    );

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
    });


})


// *Update Profile User
const adminUpdateUserAvatar = asyncHandler(async (req, res, next) => {
    console.log("reques.files: ", req.file?.path)
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        return next(new ErrorHandler("Avatar File is Missing", 401))
    }

    const user = await User.findById(req?.params?.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // *Delete the previous file
    // ----------------------------------------------------------------
    const previousAvatar = user.avatar?.public_id;
    console.log("previousAvatar", previousAvatar)

    if (previousAvatar) {
        const deleteAvatarResponse = await destroyOnCloudinary(previousAvatar);
        console.log("deletedAvatarr:response--", deleteAvatarResponse);
    } else {
        console.log("No previous avatr found")
    }
    // ----------------------------------------------------------------


    // *UPLOADING NEW AVATAR
    const newAvatar = await uploadOnCloudinary(avatarLocalPath, cloudinaryAvatarRefer, { fullName: user.fullName }, req.file.originalname);
    console.log("Previous URL: ", newAvatar)

    if (!newAvatar || !newAvatar.url || !newAvatar.public_id) {
        return next(new ErrorHandler("Error while uploading avatar!", 500));
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.params?.id,
        {
            $set: {
                "avatar.public_id": newAvatar.public_id,
                "avatar.secure_url": newAvatar.secure_url,
            },
        },
        { new: true }
    ).select("-password")

    await logActivity(
        req.user._id,
        "admin-update-avatar",
        `Admin ${req.user.fullName} updated avatar for ${updatedUser.fullName}`,
        req,
        'user',
        updatedUser._id
    );

    console.log("NEW URL: ", newAvatar);
    console.log("NEW URL: ", updatedUser.avatar);
    console.log("Updated User Avatar URL:", updatedUser.avatar.secure_url);

    return res
        .status(200)
        .json({
            success: true,
            user: updatedUser,
            message: "Avatar Updated Successfully!"
        })
})


// *Change User Role
const adminChangeUserRole = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
        return next(new ErrorHandler("Invalid role. Must be 'user' or 'admin'", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role === role) {
        return next(new ErrorHandler(`User is already ${role}`, 400));
    }

    user.role = role;
    await user.save();

    await logActivity(
        req.user._id,
        "admin-change-role",
        `Admin ${req.user.username} changed role of ${user.username} to ${role}`,
        req,
        'user',
        userId
    );

    return res.status(200).json({
        success: true,
        message: `User role updated to ${role}`,
        user: { _id: user._id, username: user.username, role: user.role }
    });
});

// *Admin Stats
const adminStats = asyncHandler(async (req, res, next) => {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalCommunities = await Community.countDocuments();

    // Active users today (users who joined today or have recent activity)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeUsersToday = await User.countDocuments({ joined_at: { $gte: today } });

    return res.status(200).json({
        success: true,
        stats: {
            totalUsers,
            totalPosts,
            totalComments,
            totalCommunities,
            activeUsersToday
        }
    });
});

// *Delete User
const adminDeleteUser = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.params?.id;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User Not Found", 404))

        }

        await logActivity(
            req.user._id,
            "admin-delete-user",
            `Admin ${req.user.username} deleted user ${user.username}`,
            req,
            'user',
            userId
        );

        // *Delete the previous file
        // ----------------------------------------------------------------
        const userAvatar = user.avatar?.public_id;
        console.log("userAvatar", userAvatar)

        if (userAvatar) {
            const deleteAvatarResponse = await destroyOnCloudinary(userAvatar, cloudinaryAvatarRefer);
            console.log("deletedAvatarr:response--", deleteAvatarResponse);
        } else {
            console.log("No avatr found")
        }



        // Delete the user
        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return next(new ErrorHandler("Internal Server Error", 500))
    }
});

// *Admin Add Member to Community
const adminAddMemberToCommunity = asyncHandler(async (req, res, next) => {
    const { communityId, userId } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
        return next(new ErrorHandler("Community not found", 404));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (community.members.includes(userId)) {
        return next(new ErrorHandler("User is already a member of this community", 400));
    }

    community.members.push(userId);
    community.members_count = community.members.length;
    await community.save();

    // Add to user's communities_followed
    await User.findByIdAndUpdate(userId, { $push: { communities_followed: communityId } });

    await logActivity(
        req.user._id,
        "admin-add-member",
        `Admin ${req.user.username} added ${user.username} to community ${community.title}`,
        req,
        'community',
        communityId
    );

    res.status(200).json({ success: true, message: "Member added to community successfully" });
});

// *Admin Remove Member from Community
const adminRemoveMemberFromCommunity = asyncHandler(async (req, res, next) => {
    const { communityId, userId } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
        return next(new ErrorHandler("Community not found", 404));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (!community.members.includes(userId)) {
        return next(new ErrorHandler("User is not a member of this community", 400));
    }

    community.members = community.members.filter(member => member.toString() !== userId.toString());
    community.members_count = community.members.length;
    await community.save();

    // Remove from user's communities_followed
    await User.findByIdAndUpdate(userId, { $pull: { communities_followed: communityId } });

    await logActivity(
        req.user._id,
        "admin-remove-member",
        `Admin ${req.user.username} removed ${user.username} from community ${community.title}`,
        req,
        'community',
        communityId
    );

    res.status(200).json({ success: true, message: "Member removed from community successfully" });
});

// *Admin Delete Post
const adminDeletePost = asyncHandler(async (req, res, next) => {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate('author');
    if (!post) {
        return next(new ErrorHandler("Post not found", 404));
    }

    await logActivity(
        req.user._id,
        "admin-delete-post",
        `Admin ${req.user.username} deleted post: ${post.title}`,
        req,
        'post',
        postId
    );

    // Delete the post
    await Post.findByIdAndDelete(postId);

    // Decrement num_posts for author
    await User.findByIdAndUpdate(post.author._id, { $inc: { num_posts: -1 } });

    res.status(200).json({ success: true, message: "Post deleted successfully" });
});

// *Admin Delete Community
const adminDeleteCommunity = asyncHandler(async (req, res, next) => {
    const { communityId } = req.params;

    const community = await Community.findById(communityId).populate('creator_id');
    if (!community) {
        return next(new ErrorHandler("Community not found", 404));
    }

    await logActivity(
        req.user._id,
        "admin-delete-community",
        `Admin ${req.user.username} deleted community: ${community.title}`,
        req,
        'community',
        communityId
    );

    // Remove community from all members' communities_followed
    await User.updateMany(
        { communities_followed: communityId },
        { $pull: { communities_followed: communityId } }
    );

    // Delete all posts in the community
    const posts = await Post.find({ community_id: communityId });
    for (const post of posts) {
        await Post.findByIdAndDelete(post._id);
        // Decrement num_posts for authors
        await User.findByIdAndUpdate(post.author, { $inc: { num_posts: -1 } });
    }

    // Delete the community
    await Community.findByIdAndDelete(communityId);

    res.status(200).json({ success: true, message: "Community deleted successfully" });
});


// ----------------- Spam Reports / Flagged Posts -----------------
const getSpamReports = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const reports = await SpamPost.find({})
        .populate('reporter_id', 'username email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await SpamPost.countDocuments({});

    res.status(200).json({ success: true, reports, totalPages: Math.ceil(total / limit), currentPage: page, total });
});

const getSpamReportById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const report = await SpamPost.findById(id).populate('reporter_id', 'username email').populate('handled_by', 'username');
    if (!report) return next(new ErrorHandler('Report not found', 404));
    res.status(200).json({ success: true, report });
});

const resolveSpamReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'remove'

    const report = await SpamPost.findById(id);
    if (!report) return next(new ErrorHandler('Report not found', 404));

    report.status = 'resolved';
    report.handled_by = req.user._id;

    // Take action if requested
    if (action === 'approve') {
        // If the target is a post, unflag it
        if (report.target_type === 'Post') {
            const post = await Post.findById(report.target_id);
            if (post) {
                post.status = 'active';
                post.spamScore = null;
                post.toxicityScore = null;
                await post.save();
            }
        }
        report.action_taken = 'approved';
    } else if (action === 'remove') {
        if (report.target_type === 'Post') {
            const post = await Post.findById(report.target_id);
            if (post) {
                post.status = 'removed';
                await post.save();
                // Decrement user's post count
                await User.findByIdAndUpdate(post.author, { $inc: { num_posts: -1 } });
            }
        }
        report.action_taken = 'removed';
    }

    await report.save();

    await logActivity(req.user._id, 'admin-handle-spam', `Admin ${req.user.username} resolved spam report ${id}`, req, 'spam', id);

    res.status(200).json({ success: true, report, message: 'Report resolved' });
});

const getFlaggedPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const posts = await Post.find({ status: 'flagged' })
        .populate('author', 'username email')
        .populate('community_id', 'title')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Post.countDocuments({ status: 'flagged' });

    res.status(200).json({ success: true, posts, totalPages: Math.ceil(total / limit), currentPage: page, total });
});

const adminApproveFlaggedPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return next(new ErrorHandler('Post not found', 404));

    post.status = 'active';
    post.spamScore = null;
    post.toxicityScore = null;
    await post.save();

    // Mark related reports as resolved
    await SpamPost.updateMany({ target_type: 'Post', target_id: postId }, { $set: { status: 'resolved', action_taken: 'approved', handled_by: req.user._id } });

    await logActivity(req.user._id, 'admin-approve-post', `Admin ${req.user.username} approved post ${postId}`, req, 'post', postId);

    res.status(200).json({ success: true, post, message: 'Post approved and unflagged' });
});

const adminRemoveFlaggedPost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return next(new ErrorHandler('Post not found', 404));

    post.status = 'removed';
    await post.save();

    await SpamPost.updateMany({ target_type: 'Post', target_id: postId }, { $set: { status: 'resolved', action_taken: 'removed', handled_by: req.user._id } });

    // Decrement author's post count
    await User.findByIdAndUpdate(post.author, { $inc: { num_posts: -1 } });

    await logActivity(req.user._id, 'admin-remove-post', `Admin ${req.user.username} removed post ${postId}`, req, 'post', postId);

    res.status(200).json({ success: true, message: 'Post removed' });
});



export {
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
    ,
    // spam admin handlers
    getSpamReports,
    getSpamReportById,
    resolveSpamReport,
    getFlaggedPosts,
    adminApproveFlaggedPost,
    adminRemoveFlaggedPost
}