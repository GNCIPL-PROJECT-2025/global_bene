import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: ["upvote", "downvote", "comment", "reply", "mention", "follow", "community_invite"]
    },
    message: {
        type: String
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
    },
    // New fields for notification system
    notificationCategory: {
        type: String
    },
    channel: {
        type: String,
        enum: ["EMAIL", "MOBILE"]
    },
    templateId: {
        type: Schema.Types.ObjectId,
        ref: "NotificationTemplate"
    },
    scheduledAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ["PENDING", "SENT", "FAILED"],
        default: "PENDING"
    }
}, {
    timestamps: true
});

export const Notification = mongoose.model("Notification", notificationSchema);