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

        console.log("\n-------------\nSPAM DETECTOR MIDDLEWARE")

        let spamScore = 0;
        let toxicityScore = 0;
        let severity = 'low';

        // Try external API first
        if (process.env.SPAM_SERVICE_API_KEY && process.env.SPAM_SERVICE_API_KEY.trim() !== "") {
            try {
                const resp = await axios.post(`${process.env.SPAM_SERVICE_API_KEY}/predict`, { text });
                const data = resp.data;
                spamScore = data?.toxicity_detection?.all_scores?.spam ?? 0;
                toxicityScore = data?.toxicity_detection?.toxicity_score ?? 0;

                console.log(`External API - Text: ${text}`)
                console.log(`toxicityProbability: ${toxicityScore}`)
                console.log(`spamProbability: ${spamScore}`)
            } catch (err) {
                console.warn('spamDetector: external service call failed, using local detection:', err.message);
            }
        }

        // If external API failed or not configured, use local keyword-based detection
        if (spamScore === 0 && toxicityScore === 0) {
            const lowerText = text.toLowerCase();

            // Spam keywords
            const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'free money', 'bitcoin', 'crypto', 'investment opportunity', 'work from home', 'make money fast'];
            const spamMatches = spamKeywords.filter(keyword => lowerText.includes(keyword)).length;

            // Toxicity keywords
            const toxicKeywords = ['fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap', 'stupid', 'idiot', 'moron', 'retard'];
            const toxicMatches = toxicKeywords.filter(keyword => lowerText.includes(keyword)).length;

            // Calculate scores based on keyword matches and text length
            spamScore = Math.min(spamMatches * 0.3 + (text.length > 500 ? 0.2 : 0), 1);
            toxicityScore = Math.min(toxicMatches * 0.4 + (text.length > 500 ? 0.1 : 0), 1);

            console.log(`Local detection - Text: ${text}`)
            console.log(`Spam keywords found: ${spamMatches}, Toxicity keywords found: ${toxicMatches}`)
            console.log(`Calculated spamScore: ${spamScore}, toxicityScore: ${toxicityScore}`)
        }

        // Determine severity from probabilities
        severity = (spamScore > 0.7 || toxicityScore > 0.7) ? 'high'
            : ((spamScore > 0.3 || toxicityScore > 0.3) ? 'medium' : 'low');

        console.log(`Final severity: ${severity}`)
        console.log("-------------\n")

        // Attach report for medium/high severity
        if (severity === 'high' || severity === 'medium') {
            const newReport = {
                reporter_id: req.user?._id || null, // may be null for anonymous
                target_type: "",    // will be set in controller
                target_id: "", // will be set in controller
                reason: "Spam/Toxicity detected",
                status: "open",
                severity,
                spamScore,
                toxicityScore
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
