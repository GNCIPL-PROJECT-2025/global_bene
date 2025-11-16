import express from "express";
import { verifyJWT,customRoles } from "../middlewares/auth.middleware.js";
import{
    createReport,
    getAllReports,
    getReportById,
    updateReportStatus
    // deleteReport
} from "../controllers/report.controller.js";

const router = express.Router();


router.post("/",verifyJWT,   createReport);
router.get("/",verifyJWT,  getAllReports);
router.get("/:target_type/:id",verifyJWT, getReportById);
router.put("/",verifyJWT, updateReportStatus);
// router.delete("/:id",verifyJWT, customRoles("admin"), deleteReport);


export default router;