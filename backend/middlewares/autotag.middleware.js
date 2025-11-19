import { asyncHandler } from "./asyncHandler.middleware.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const autoTaggerMiddleware = asyncHandler(async (req, res, next) => {
    try {
        const text = req.body.body;
        if (!text) {
            return next(); // Skip if no text
        }
        if (!process.env.AUTOTAGGER_SERVICE_API_KEY) {
            console.log("AUTOTAGGER_SERVICE_API_KEY not set, skipping autotagging");
            return next(); // Skip if no API key
        }

        console.log("\n-------------\nAUTOTAGGER MIDDLEWARE");
        const response = await axios.post(`${process.env.AUTOTAGGER_SERVICE_API_KEY}/predict`, { text });
        const allTags = response.data.results?.[0].all_tags;
        if (!allTags) {
            console.log("No tags found\n", response.data);
            return next();
        }

        const tagKeys = Object.keys(allTags); // Extract tag names
        req.autoTags = tagKeys; // Attach to req

        console.log(`Text: ${text}`);
        console.log(`Auto Tags: ${tagKeys}`);
        console.log("-------------\n");

        next();
    } catch (err) {
        console.log("AutoTagger Middleware Error:", err);
        next(err); // Pass error (or handle as needed)
    }
});