import axios from "axios";
import { asyncHandler } from "./asyncHandler.middleware.js";
import dotenv from "dotenv";
dotenv.config();

export const spamDetector = asyncHandler(async (req, res, next) => {
    try {
        const text = req.body.content;
        if (!text || typeof text !== "string" || text.trim() === "") {
            return res.status(400).json({ error: "Invalid text input" });
        }
        // Call the external spam detection API
        const { data } = await axios.post(`${process.env.ML_SERVICE_API_KEY}/predict`, { text });


        const spamProbability = data.toxicity_detection.all_scores.spam
        const toxicityProbability = data.toxicity_detection.all_scores.toxic
        console.log("\n-------------\nSPAM DETECTOR MIDDLEWARE")
        console.log(`Text: ${text}`)
        console.log(`toxicityProbability: ${toxicityProbability}`)
        console.log(`spamProbability: ${spamProbability}`)
        console.log("-------------\n")

        if (spamProbability > 0.90 || toxicityProbability > 0.90) {
            return res.send({ message: "Your content has high spam/toxicity please modify it..!" })
        }
        if (spamProbability > 0.50 || toxicityProbability > 0.50) {
            const newReport = {
                reporter: null, //since it's system generated
                itemId: req.params.id || null,
                spamScore: spamProbability,
                reason: "Spam/Toxicity detected by ML Service",
                details: `Spam Probability: ${spamProbability}`
            };

            req.newReport = newReport; // attach the report to req for further use if needed

        }
        next();
    } catch (err) {
        console.log("spamPredict failed", err.message);
        next(err);
    }
})
