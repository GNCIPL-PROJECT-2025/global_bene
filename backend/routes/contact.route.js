import express from "express";
import { sendContactMessage, getAdminContactInfo } from "../controllers/contact.controller.js";

const router = express.Router();

// Public route for contact form
router.route("/").post(sendContactMessage);

// Get admin contact info
router.route("/admin-info").get(getAdminContactInfo);

export default router;