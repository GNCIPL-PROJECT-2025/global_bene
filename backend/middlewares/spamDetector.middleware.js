import axios from "axios";
import { asyncHandler } from "./asyncHandler.middleware.js";

import dotenv from "dotenv";
dotenv.config();

export const spamDetector = asyncHandler(async (req, res, next) => {
    try {
        // Accept multiple possible field names from the client
        const text = req.body.body || req.body.text || req.body.comment || "";
        // If there's no text to analyze, skip detection and allow controller validation to run
        if (!text || typeof text !== "string" || text.trim() === "") {
            return next();
        }

        // Skip spam detection if API key is not configured
        if (!process.env.SPAM_SERVICE_API_KEY) {
            console.log("Spam service API key not configured, skipping spam detection");
            return next();
        }

        console.log("\n-------------\nSPAM DETECTOR MIDDLEWARE")
        // If no spam service is configured, skip detection
        if (!process.env.SPAM_SERVICE_API_KEY || process.env.SPAM_SERVICE_API_KEY.trim() === "") {
            return next();
        }

        // Call the external spam detection API (guarded)
        let data;
        try {
            const resp = await axios.post(`${process.env.SPAM_SERVICE_API_KEY}/predict`, { text });
            data = resp.data;
        } catch (err) {
            console.warn('spamDetector: external service call failed, skipping detection:', err.message);
            return next();
        }

        const spamProbability = data?.toxicity_detection?.all_scores?.spam ?? 0;
        const toxicityProbability = data?.toxicity_detection?.toxicity_score ?? 0;

        console.log(`Text: ${text}`)
        console.log(`toxicityProbability: ${toxicityProbability}`)
        console.log(`spamProbability: ${spamProbability}`)
        console.log("-------------\n")

            // Determine severity from probabilities
            const severity = (spamProbability > 0.90 || toxicityProbability > 0.90) ? 'high'
                : ((spamProbability > 0.50 || toxicityProbability > 0.50) ? 'medium' : 'low');

            // Only attach report for high severity
            if (severity === 'high') {
                const newReport = {
                    reporter_id: req.user?._id || null, // may be null for anonymous
                    target_type: "",    // will be set in controller
                    target_id: "", // will be set in controller
                    reason: "Spam/Toxicity detected by ML Service",
                    status: "open",
                    severity,
                    spamScore: spamProbability,
                    toxicityScore: toxicityProbability
                };

                // Attach the report for controllers to persist/handle
                req.newReport = newReport;
            }
            next();
    } catch (err) {
        console.log("spamPredict failed", err.message);
        next(err);
    }
})
