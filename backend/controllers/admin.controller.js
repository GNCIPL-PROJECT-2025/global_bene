// adminChangeUserRole → promote/demote users (role: user/admin)

// adminStats → quick dashboard (e.g., total users, active today, uploads count)

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import ErrorHandler from "../middlewares/error.middleware.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import crypto from "crypto"

import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Community } from "../models/community.model.js";
import { Report } from "../models/report.model.js";
import { Comment } from "../models/comment.model.js";
import { destroyOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { cloudinaryAvatarRefer } from "../utils/constants.utils.js";
import { logActivity } from "../utils/logActivity.utils.js";


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
            `Admin ${req.user.fullName} deleted user ${user.fullName}`,
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


// *Get Admin Stats
const getAdminStats = asyncHandler(async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: "admin" });
        const totalRegularUsers = totalUsers - totalAdmins;

        const totalPosts = await Post.countDocuments();
        const totalComments = await Comment.countDocuments();
        const totalCommunities = await Community.countDocuments();

        // Active users today (users who created posts today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const activeUsersToday = await Post.distinct('author_id', {
            createdAt: { $gte: today, $lt: tomorrow }
        }).then(authors => authors.length);

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalAdmins,
                totalRegularUsers,
                totalPosts,
                totalComments,
                totalCommunities,
                activeUsersToday
            }
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return next(new ErrorHandler("Error fetching stats", 500));
    }
});


// *Change User Role
const adminChangeUserRole = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.params?.id;
        const { role } = req.body;

        if (!role || !["user", "admin"].includes(role)) {
            return next(new ErrorHandler("Invalid role provided", 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        user.role = role;
        await user.save();

        await logActivity(
            req.user._id,
            "admin-change-role",
            `Admin ${req.user.fullName} changed role for ${user.fullName} to ${role}`,
            req,
            'user',
            userId
        );

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user
        });
    } catch (error) {
        console.error("Error changing role:", error);
        return next(new ErrorHandler("Error changing role", 500));
    }
});


// *Get All Posts For Admin
const getAllPostsForAdmin = asyncHandler(async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { body: { $regex: search, $options: "i" } }
                ]
            };
        }

        const posts = await Post.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("author_id", "username email")
            .populate("community_id", "title name");

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return next(new ErrorHandler("Error fetching posts", 500));
    }
});


// *Get All Communities For Admin
const getAllCommunitiesForAdmin = asyncHandler(async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { name: { $regex: search, $options: "i" } }
                ]
            };
        }

        const communities = await Community.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("creator_id._id", "username email");

        const total = await Community.countDocuments(query);

        res.status(200).json({
            success: true,
            communities,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching communities:", error);
        return next(new ErrorHandler("Error fetching communities", 500));
    }
});


// *Admin Delete Post
const adminDeletePost = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params?.id;

        const post = await Post.findById(postId);

        if (!post) {
            return next(new ErrorHandler("Post not found", 404));
        }

        await logActivity(
            req.user._id,
            "admin-delete-post",
            `Admin ${req.user.fullName} deleted post "${post.title}"`,
            req,
            'post',
            postId
        );

        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        return next(new ErrorHandler("Error deleting post", 500));
    }
});


// *Admin Add Member To Community
const adminAddMemberToCommunity = asyncHandler(async (req, res, next) => {
    try {
        const { communityId, userId } = req.body;

        if (!communityId || !userId) {
            return next(new ErrorHandler("Community ID and User ID are required", 400));
        }

        const community = await Community.findById(communityId);

        if (!community) {
            return next(new ErrorHandler("Community not found", 404));
        }

        if (community.members.includes(userId)) {
            return next(new ErrorHandler("User is already a member", 400));
        }

        community.members.push(userId);
        await community.save();

        await logActivity(
            req.user._id,
            "admin-add-member",
            `Admin ${req.user.fullName} added user ${userId} to community ${community.title}`,
            req,
            'community',
            communityId
        );

        res.status(200).json({
            success: true,
            message: "Member added successfully",
            community
        });
    } catch (error) {
        console.error("Error adding member:", error);
        return next(new ErrorHandler("Error adding member", 500));
    }
});


// *Admin Remove Member From Community
const adminRemoveMemberFromCommunity = asyncHandler(async (req, res, next) => {
    try {
        const { communityId, userId } = req.body;

        if (!communityId || !userId) {
            return next(new ErrorHandler("Community ID and User ID are required", 400));
        }

        const community = await Community.findById(communityId);

        if (!community) {
            return next(new ErrorHandler("Community not found", 404));
        }

        community.members = community.members.filter(member => member.toString() !== userId);
        await community.save();

        await logActivity(
            req.user._id,
            "admin-remove-member",
            `Admin ${req.user.fullName} removed user ${userId} from community ${community.title}`,
            req,
            'community',
            communityId
        );

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            community
        });
    } catch (error) {
        console.error("Error removing member:", error);
        return next(new ErrorHandler("Error removing member", 500));
    }
});


// *Get Spam Reports
const getSpamReports = asyncHandler(async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status = "" } = req.query;
        const skip = (page - 1) * limit;

        let query = {};
        if (status) {
            query.status = status;
        }

        const reports = await Report.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("reporter_id", "username email")
            .populate("handled_by", "username email");

        const total = await Report.countDocuments(query);

        res.status(200).json({
            success: true,
            reports,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        return next(new ErrorHandler("Error fetching reports", 500));
    }
});


// *Resolve Spam Report
const resolveSpamReport = asyncHandler(async (req, res, next) => {
    try {
        const reportId = req.params?.id;
        const { action } = req.body;

        if (!action || !["approve", "reject"].includes(action)) {
            return next(new ErrorHandler("Invalid action", 400));
        }

        const report = await Report.findById(reportId);

        if (!report) {
            return next(new ErrorHandler("Report not found", 404));
        }

        report.status = action === "approve" ? "resolved" : "rejected";
        await report.save();

        await logActivity(
            req.user._id,
            "admin-resolve-report",
            `Admin ${req.user.fullName} ${action}ed report ${reportId}`,
            req,
            'report',
            reportId
        );

        res.status(200).json({
            success: true,
            message: `Report ${action}ed successfully`,
            report
        });
    } catch (error) {
        console.error("Error resolving report:", error);
        return next(new ErrorHandler("Error resolving report", 500));
    }
});


// *Get Flagged Posts
const getFlaggedPosts = asyncHandler(async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ status: 'flagged' })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("author_id", "username email");

        const total = await Post.countDocuments({ status: 'flagged' });

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error("Error fetching flagged posts:", error);
        return next(new ErrorHandler("Error fetching flagged posts", 500));
    }
});


// *Approve Flagged Post
const approveFlaggedPost = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params?.id;

        const post = await Post.findById(postId);

        if (!post) {
            return next(new ErrorHandler("Post not found", 404));
        }

        post.status = 'active';
        await post.save();

        await logActivity(
            req.user._id,
            "admin-approve-post",
            `Admin ${req.user.fullName} approved flagged post "${post.title}"`,
            req,
            'post',
            postId
        );

        res.status(200).json({
            success: true,
            message: "Post approved successfully",
            post
        });
    } catch (error) {
        console.error("Error approving post:", error);
        return next(new ErrorHandler("Error approving post", 500));
    }
});


// *Remove Flagged Post
const removeFlaggedPost = asyncHandler(async (req, res, next) => {
    try {
        const postId = req.params?.id;

        const post = await Post.findById(postId);

        if (!post) {
            return next(new ErrorHandler("Post not found", 404));
        }

        await logActivity(
            req.user._id,
            "admin-remove-flagged-post",
            `Admin ${req.user.fullName} removed flagged post "${post.title}"`,
            req,
            'post',
            postId
        );

        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            success: true,
            message: "Post removed successfully"
        });
    } catch (error) {
        console.error("Error removing post:", error);
        return next(new ErrorHandler("Error removing post", 500));
    }
});


// *Admin Delete Community
const adminDeleteCommunity = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const community = await Community.findById(id);
        if (!community) {
            return next(new ErrorHandler("Community not found", 404));
        }

        // Get creator id before deletion for updating their count
        const creatorId = community.creator_id;

        await logActivity(
            req.user._id,
            "admin-delete-community",
            `Admin ${req.user.fullName || req.user.username} deleted community: ${community.title}`,
            req,
            'community',
            id
        );

        await Community.findByIdAndDelete(id);

        // Decrement num_communities for creator
        if (creatorId) {
            await User.findByIdAndUpdate(creatorId, { $inc: { num_communities: -1 } });
        }

        res.status(200).json({
            success: true,
            message: "Community deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting community:", error);
        return next(new ErrorHandler("Error deleting community", 500));
    }
});


export {
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
}
