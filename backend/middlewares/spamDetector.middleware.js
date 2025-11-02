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

        // since data is not in json format, we need to parse it
        const resArrayForm = data.split("\n");
        // the last 2 lines contain the spam info
        const isSpam = resArrayForm[resArrayForm.length - 2].split(" / ")[0].trim() === "Spam";
        const spamProbability = parseFloat(resArrayForm[resArrayForm.length - 1].split(": ")[1])

        console.log("\n-------------\nSPAM DETECTOR MIDDLEWARE")
        console.log(`Text: ${text}`)
        console.log(`isSpam: ${isSpam}`)
        console.log(`spamProbability: ${spamProbability}`)
        console.log("-------------\n")

        if (isSpam && spamProbability > 0.75) {
            return res.status(304).send({ message: "Spam/Toxicity detected in your comment please modify it!", isSpam: true, spamProbability });
        }
        next();
    } catch (err) {
        console.warn("spamPredict failed", err.message);

        next(err);
    }
})
