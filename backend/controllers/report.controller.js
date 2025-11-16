import { Report } from "../models/report.model.js";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Community } from "../models/community.model.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
// import { ErrorHandler } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Create a new report
export const createReport = asyncHandler(async (req, res, next) => {
    const { target_type, target_id, reason } = req.body;

    if (!target_type || !target_id || !reason) {
        return res.status(404).json(new ApiResponse(404, null, "All fields are required"));
    }

    if (target_type === 'comment') {
        const targetComment = await Comment.findById(target_id);
        if (!targetComment) {
            return res.status(404).json(new ApiResponse(404, null, "Comment not found"));

        }
        targetComment.status = 'flagged';
        await targetComment.save();
    }



    if (target_type === 'post') {
        const targetPost = await Comment.findById(target_id);
        if (!targetPost) {
            return res.status(404).json(new ApiResponse(404, null, "Post not found"));

        }
        targetPost.status = 'flagged';
        await targetPost.save();
    }

    const report = await Report.create({
        reporter_id: req.user._id,
        target_type,
        target_id,
        reason,
        status: "open"
    });
    return res.status(201).json({
        success: true,
        message: "Report created successfully",
        report
    });
});

// Get all reports (Admin only)
export const getAllReports = asyncHandler(async (req, res) => {

    const postReports = await Report.find({ target_type: 'Post' })
        .populate("reporter_id", "username avatar")
        .populate({
            path: "target_id",
            populate: [{
                path: "author_id",
                select: "username avatar",
            }
                , {
                path: "community_id",
                select: "moderators"
            }]

        })
        .lean();


    // For Comments  
    const commentReports = await Report.find({ target_type: 'Comment' })
        .populate("reporter_id", "username avatar")
        .populate({
            path: "target_id",
            populate: [
                {
                    path: "author_id",
                    select: "username avatar"
                },
                {
                    path: "post_id",
                    select: "community_id",
                    populate: {
                        path: "community_id",
                        select: " moderators"
                    }
                }
            ]
        })
        .lean();
    const userReports = await Report.find({ target_type: 'User' })
        .populate({
            path: "reporter_id",
            select: "username avatar communities_followed",
            populate: {
                path: "communities_followed",
                select: "moderators"
            }
        })
        .populate("target_id", "username avatar")
        .lean();

    // Combine all reports

    const allReports = {
        userReports: userReports,
        postReports: postReports,
        commentReports: commentReports
    };

    if (req.user.role === 'admin') {
        return res.json(new ApiResponse(200, allReports, "All reports fetched"));
    }

    const filteredPostReports = postReports.filter(report => {
        if (report.target_id &&
            report.target_id.community_id &&
            report.target_id.community_id.moderators) {

            // Check if moderatorId exists in the moderators array
            const hasAccess = report.target_id.community_id.moderators.some(modId =>
                modId.toString() === req.user._id.toString()
            );
            return hasAccess;
        }
        return false;
    });
    const filteredCommentReports = commentReports.filter(report => {
        if (report.target_id &&
            report.target_id.post_id &&
            report.target_id.post_id.community_id &&
            report.target_id.post_id.community_id.moderators) {

            // Check if moderatorId exists in the moderators array
            const hasAccess = report.target_id.post_id.community_id.moderators.some(modId =>
                modId.toString() === req.user._id.toString()
            );
            return hasAccess;
        }
        return false;
    });

    const filteredUserReports = userReports.filter(report => {
        if (report.reporter_id && report.reporter_id.communities_followed) {
            // Check if moderatorId exists in ANY of the reporter's communities moderators arrays
            return report.reporter_id.communities_followed.some(community =>
                community.moderators &&
                community.moderators.some(modId =>
                    modId.toString() === req.user._id.toString()
                )
            );
        }
        return false;
    });

    const filteredAllReports = {
        userReports: filteredUserReports,
        postReports: filteredPostReports,
        commentReports: filteredCommentReports
    };

    return res.json(new ApiResponse(200, filteredAllReports, "All reports fetched"));
});

// Get report by ID (Admin and Moderator)
export const getReportById = asyncHandler(async (req, res) => {
    // api/v1/reports/:target_type/:id
    const reportId = req.params.id;
    const target_type = req.params.target_type.toLowerCase();

    if (target_type !== 'post' && target_type !== 'comment' && target_type !== 'user') {
        return res.status(400).json(new ApiResponse(400, null, "Invalid target type"));
    }

    let foundReport = {};

    if (target_type === 'post' && target_type !== 'comment' && target_type !== 'user') {

        foundReport = await Report.findById(reportId)
            .populate("reporter_id", "username avatar")
            .populate({
                path: "target_id",
                populate: [{
                    path: "author_id",
                    select: "username avatar",
                }
                    , {
                    path: "community_id",
                    select: "moderators"
                }]

            })
            .lean();
    }


    if (target_type === 'comment') {
        // For Comments  
        foundReport = await Report.findById(reportId)
            .populate("reporter_id", "username avatar")
            .populate({
                path: "target_id",
                populate: [
                    {
                        path: "author_id",
                        select: "username avatar"
                    },
                    {
                        path: "post_id",
                        select: "community_id",
                        populate: {
                            path: "community_id",
                            select: " moderators"
                        }
                    }
                ]
            })
            .lean();
    }


    if (target_type === 'user') {
        foundReport = await Report.findById(reportId)
            .populate({
                path: "reporter_id",
                select: "username avatar communities_followed",
                populate: {
                    path: "communities_followed",
                    select: "moderators"
                }
            })
            .populate("target_id", "username avatar")
            .lean();
    }


    if (!foundReport) {
        return res.status(404).json(new ApiResponse(404, null, "Report not found"));
    }



    console.log("Found Report:", foundReport);
    if (req.user.role === 'admin') {
        return res.json(new ApiResponse(200, foundReport, "All reports fetched"));
    }

    const report = foundReport;


    if (target_type === 'post' && report.target_id &&
        report.target_id.community_id &&
        report.target_id.community_id.moderators) {

        // Check if moderatorId exists in the moderators array
        const hasAccess = report.target_id.community_id.moderators.some(modId =>
            modId.toString() === req.user._id.toString()
        );
        if (hasAccess) {
            return res.json(new ApiResponse(200, foundReport, "All reports fetched"));
        }
    }
    if (target_type === 'comment' && report.target_id &&
        report.target_id.post_id &&
        report.target_id.post_id.community_id &&
        report.target_id.post_id.community_id.moderators) {

        // Check if moderatorId exists in the moderators array
        const hasAccess = report.target_id.post_id.community_id.moderators.some(modId =>
            modId.toString() === req.user._id.toString()
        );
        return res.json(new ApiResponse(200, foundReport, "All reports fetched"));
    }


    if (target_type === 'user' && report.reporter_id && report.reporter_id.communities_followed) {
        // Check if moderatorId exists in ANY of the reporter's communities moderators arrays
        if (report.reporter_id.communities_followed.some(community =>
            community.moderators &&
            community.moderators.some(modId =>
                modId.toString() === req.user._id.toString()
            )
        )) {
            return res.json(new ApiResponse(200, foundReport, "All reports fetched"));
        }
    }
    return res.status(403).json(new ApiResponse(403, null, "Access denied for moderator"));
});

// Update report status (Admin only)
export const updateReportStatus = asyncHandler(async (req, res, next) => {
    const { action, target_type, reportId } = req.body;

    if (!action || !target_type || !reportId) {
        return res.status(403).json(new ApiResponse(403, null, "All fields are required"));
    }

    if (action !== 'ban-user' && action !== 'remove-post' && action !== "remove-comment" && action !== 'unflag') {

        return res.status(403).json(new ApiResponse(403, null, "Invalid Action"));
    }
    const report = await Report.findById(reportId);
    if (!report) {
        return next(new ApiResponse(404, null, "Report not found"));
    }

    // action: 'ban|remove |unflag

    if (target_type === "user") {

        if (action !== 'ban-user') {
            return res.status(200).json(new ApiResponse(200, null, "Invalid action for report type :user"));
        }
        const targetDoc = await User.findById(report.target_id);
        if (!targetDoc) return next(new ApiResponse(404, null, "User not found"));

        if (action === "ban-user") {
            targetDoc.isBanned = true;
            await targetDoc.save();
            report.status = "resolved";
            await report.save()
            return res.status(200).json(new ApiResponse(200, null, "User banned successfully"));
        }
        return res.status(304).json(new ApiResponse(304, null, "Failed to ban user"))

    }

    if (target_type === "post") {

        if (action !== 'ban-user' && action !== 'remove-post' && action !== 'unflag') {
            return res.status(200).json(new ApiResponse(200, null, "Invalid action for report type :user"));
        }
        const targetDoc = await Post.findById(report.target_id);

        if (!targetDoc) return next(new ApiResponse(404, null, "Post not found"));

        if (action === "remove-post") {
            targetDoc.status = 'removed';
            await targetDoc.save()
            report.status = "resolved";
            await report.save()
            return res.status(200).json(new ApiResponse(200, targetDoc, "Post removed successfully"))

        }

        if (action === "ban-user") {
            const targetAccount = await User.findById(targetDoc.author_id);
            targetAccount.isBanned = true;
            await targetAccount.save();
            targetDoc.status = 'removed';
            await targetDoc.save();
            report.status = "resolved";
            await report.save()
            return res.status(200).json(new ApiResponse(200, targetAccount, "User banned successfully"));
        }

        if (action === 'unflag') {
            targetDoc.status = "active"
            await targetDoc.save();
            return res.status(200).json(new ApiResponse(200, targetDoc, "Post unflagged successfully"));
        }
        return res.status(304).json(new ApiResponse(304, null, "an unexpected error occur"))
    }

    if (target_type === "comment") {
        const targetDoc = await Comment.findById(report.target_id);

        if (!targetDoc) return next(new ApiResponse(404, null, "Comment not found"));

        if (action === "remove-comment") {
            targetDoc.status = 'removed';
            await targetDoc.save();
            report.status = "resolved";
            await report.save();
            return res.status(200).json(new ApiResponse(200, targetDoc, "Comment removed  successfully"));
        }


        if (action === "ban-user") {
            const targetAccount = await User.findById(targetDoc.author_id);
            targetAccount.isBanned = true;
            await targetAccount.save();
            targetDoc.status = 'removed';
            await targetDoc.save();
            report.status = "resolved";
            await report.save()
            return res.status(200).json(new ApiResponse(200, targetAccount, "User banned successfully"));
        }

        if (action === 'unflag') {
            targetDoc.status = "active"
            await targetDoc.save();
            return res.status(200).json(new ApiResponse(200, targetDoc, "Comment unflagged successfully"));
        }
        return res.status(304).json(new ApiResponse(304, null, "An unexpected error occur"))
    }

    report.handled_by = req.user._id;
    await report.save();
    res.status(200).json(new ApiResponse(200, report, "Report updated successfully"));
});



