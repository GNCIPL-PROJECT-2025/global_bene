import mongoose, { Schema } from "mongoose";

const notificationRecipientSchema = new Schema({
    notificationId: {
        type: Schema.Types.ObjectId,
        ref: "Notification",
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    recipient: {
        type: String,
        required: true
    },
    deliveryStatus: {
        type: String,
        enum: ["PENDING", "SENT", "FAILED"],
        default: "PENDING"
    },
    deliveredAt: {
        type: Date
    },
    isRead: {
        type: Boolean,
        default: false
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true
});

export const NotificationRecipient = mongoose.model("NotificationRecipient", notificationRecipientSchema);