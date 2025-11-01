import mongoose from "mongoose";
import dotenv from "dotenv";
import { Post } from "./models/post.model.js";

dotenv.config();

const fixPostMediaUrls = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Update all posts with media.secure_url containing "GNCIPL/posts" to "GNCIPL/files"
        const result = await Post.updateMany(
            { "media.secure_url": { $regex: "GNCIPL/posts" } },
            [
                {
                    $set: {
                        "media.secure_url": {
                            $replaceOne: {
                                input: "$media.secure_url",
                                find: "GNCIPL/posts",
                                replacement: "GNCIPL/files"
                            }
                        }
                    }
                }
            ]
        );

        console.log(`Updated ${result.modifiedCount} posts`);
    } catch (error) {
        console.error("Error fixing URLs:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

fixPostMediaUrls();