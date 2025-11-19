import axios from "axios";
import { asyncHandler } from "./asyncHandler.middleware.js";

import dotenv from "dotenv";
dotenv.config();

export const spamDetector = asyncHandler(async (req, res, next) => {
    try {
        // Run spam check for any textual input (posts or comments).
        // If there is no textual `body`, skip spam detection.
        const text = req.body?.body;
        if (!text || typeof text !== "string" || text.trim() === "") {
            return next();
        }

        console.log("\n-------------\nSPAM DETECTOR MIDDLEWARE")
        // Call the external spam detection API
        const { data } = await axios.post(`${process.env.SPAM_SERVICE_API_KEY}/predict`, { text });
        console.log(data);

        const spamProbability = data.toxicity_detection.all_scores.spam
        const toxicityProbability = data.toxicity_detection.all_scores.toxic;
        const misinformationProbability = data.toxicity_detection.all_scores.misinformation;
        const unsafeProbability = data.toxicity_detection.all_scores.unsafe;
        const label = data.toxicity_detection.label;

        console.log(`Text: ${text}`)
        console.log(`toxicityProbability: ${toxicityProbability}`)
        console.log(`spamProbability: ${spamProbability}`)
        console.log(`misinformationProbability: ${misinformationProbability}`)
        console.log(`unsafeProbability: ${unsafeProbability}`)
        console.log(`Label: ${label}`)
        console.log("-------------\n")

        // Mark high-risk content as sensitive instead of blocking
        if (spamProbability > 0.90 || toxicityProbability > 0.90 || misinformationProbability > 0.90 || unsafeProbability > 0.90) {
            req.isSensitive = true;
            req.detectionLabel = label; // Attach the label as well
            return next(); // Allow creation but mark as sensitive
        }
        

        // Allow safe content
        if (label === "safe") {
            return next();
        }

        // Flag moderate-risk content by preparing a report
        if ((spamProbability > 0.50 && spamProbability < 0.90) || (toxicityProbability > 0.50 && toxicityProbability < 0.90) || (misinformationProbability > 0.50 && misinformationProbability < 0.90) || (unsafeProbability > 0.50 && unsafeProbability < 0.90)) {
            const newReport = {
                reporter_id: req.user._id, // Logged-in user as reporter
                target_type: "", // Set in controller (e.g., "Post")
                target_id: "", // Set in controller
                reason: "Spam/Toxicity detected by ML Service",
                status: "open",
                label: label,
            };
            req.newReport = newReport; // Attach to req for controller use
        }
        next();
    } catch (err) {
        console.log("spamPredict failed", err.message);
        next(err);
    }
})