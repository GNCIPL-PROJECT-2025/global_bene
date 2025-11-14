import axios from "axios";
import { asyncHandler } from "./asyncHandler.middleware.js";

import dotenv from "dotenv";
dotenv.config();

export const spamDetector = asyncHandler(async (req, res, next) => {
    try {
        const text = req.body.body;
        // console.log("Body", req.body);
        if (!text || typeof text !== "string" || text.trim() === "") {
            return res.status(400).json({ error: "Invalid text input" });
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

        if (spamProbability > 0.90 || toxicityProbability > 0.90 || misinformationProbability > 0.90 || unsafeProbability > 0.90) {
            return res.send({ message: "Your content has high spam/toxicity please modify it..!" })
        }
        if (label === "safe") {
            next();
        }

        if ((spamProbability > 0.50 && spamProbability < 0.90) || (toxicityProbability > 0.50 && toxicityProbability < 0.90) || (misinformationProbability > 0.50 && misinformationProbability < 0.90) || (unsafeProbability > 0.50 && unsafeProbability < 0.90)) {
            const newReport = {
                reporter_id: req.user._id, // defaulted to the logged in user
                target_type: "",    //will be set in controller
                target_id: "", //will be set in controller
                reason: "Spam/Toxicity detected by ML Service",
                status: "open",
                label: label,
            };

            req.newReport = newReport; // attach the report to req for further use if needed

        }
        next();
    } catch (err) {
        console.log("spamPredict failed", err.message);
        next(err);
    }
})
