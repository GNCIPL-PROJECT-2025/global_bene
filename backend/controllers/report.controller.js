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
        return next(new ErrorHandler("All fields are required", 400));
    }
    const report = await Report.create({
        reporter_id: req.user._id,
        target_type,
        target_id,
        reason,
        status: "open"
    });
    res.status(201).json({
        success: true,
        message: "Report created successfully",
        report
    });
});

// Get all reports (Admin only)
export const getAllReports = asyncHandler(async (req, res) => {

    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
        return res.status(403).json(new ApiResponse(403, null, "Access denied"));
    }

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

    // for user reports
    // const userReports = await Report.find({ target_type: 'User' })
    //     .populate("reporter_id", "username avatar")
    //     .populate({
    //         "path": "communities_followed",
    //         "select": "moderators"
    //     })
    //     .lean();

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

    return res.json(new ApiResponse(200, filteredUserReports, "All reports fetched"));
});

// export const getAllReports = async (req, res) => {
//     try {
//         if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
//             return res.status(403).json(new ApiResponse(403, null, "Access denied"));
//         }
//         // ✅ THIS LINE IS REQUIRED
//         const reports = await Report.find();


//         for (let r of reports) {

//             // populate reporter
//             r.reporter = await User.findById(r.reporter_id)
//                 .select("username avatar");

//             // populate target user (if exists)
//              if (r.target_type === "User") {
//                 r.target = await User.findById(r.target_id)
//                     .select("username avatar");
//             }

//             // populate post
//             if (r.target_type === "Post") {
//                 r.target = await Post.findById(r.target_id)
//                     .select("title content");
//             }

//             // populate community
//             if (r.target_type === "Community") {
//                 r.target = await Community.findById(r.target_id)
//                     .select("name description");
//             }
//         }

//         return res.status(200).json({
//             success: true,
//             data: reports
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong"
//         });
//     }
// };




// Get report by ID (Admin only)
export const getReportById = asyncHandler(async (req, res, next) => {
    const report = await Report.findById(req.params.id).populate('reporter_id', 'username email').populate('handled_by', 'username email');

    if (!report) {
        return res.status(404).json(new ApiResponse(404, null, "Report not found"));
    }
});



// Update report status (Admin only)
export const updateReportStatus = asyncHandler(async (req, res, next) => {
    const { reportId } = req.params;
    const { status } = req.body;
    const report = await Report.findById(reportId);
    if (!report) {
        return next(new ErrorHandler("Report not found", 404));
    }
    report.status = status || report.status;
    report.handled_by = req.user._id;
    await report.save();
    res.status(200).json(new ApiResponse(200, report, "Report updated successfully"));
});


