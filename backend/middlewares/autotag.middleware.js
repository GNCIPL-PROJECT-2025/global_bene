import { asyncHandler } from "./asyncHandler.middleware.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export const autoTaggerMiddleware = asyncHandler(async (req, res, next) => {
    try {
        const text = req.body.body
        if (!text) {
            return next();
        }
        console.log("\n-------------\nAUTOTAGGER MIDDLEWARE")
        const response = await axios.post(`${process.env.AUTOTAGGER_SERVICE_API_KEY}/predict`, { text });
        const allTags = response.data.results?.[0].all_tags;
        if (!allTags) {
            console.log("No tags found\n", response.data);
            return next();

        }
        const tagKeys = Object.keys(allTags);
        req.autoTags = tagKeys; // Attach the tags to req for further use

        console.log(`Text: ${text}`)
        console.log(`Auto Tags: ${tagKeys}`)
        console.log("-------------\n")

        return next();
    } catch (err) {
        console.log("AutoTagger Middleware Error:", err);
        res.status(500).json({ message: "AutoTagger Middleware Error", error: err.message });
    }
});