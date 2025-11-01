import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["upvote", "downvote", "comment", "reply", "mention", "follow", "community_invite"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedPost: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    relatedComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    relatedCommunity: {
        type: Schema.Types.ObjectId,
        ref: "Community"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Notification = mongoose.model("Notification", notificationSchema);