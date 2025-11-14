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

    // const reports = await Report.find()
    //     .populate("target_id")
    //     .populate("reporter_id", "username avatar")
    //     .populate("community_id", "name");
    let reports = await Report.find().populate("reporter_id", "username avatar ").populate("target_id").lean();
        res.json(new ApiResponse(200, reports, "All reports fetched"));
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


