import mongoose, { Schema } from "mongoose";

const notificationLogSchema = new Schema({
    notificationId: {
        type: Schema.Types.ObjectId,
        ref: "Notification",
        required: true
    },
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: "NotificationRecipient",
        required: true
    },
    attemptNo: {
        type: Number,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    responseCode: {
        type: String
    },
    responseBody: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const NotificationLog = mongoose.model("NotificationLog", notificationLogSchema);