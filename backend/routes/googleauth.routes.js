import express from 'express';

import { googleAuth } from "../controllers/googleauth.controller.js"
const router = express.Router();

// POST /api/v1/auth/google
router.post('/google', googleAuth);

export default router;
