import mongoose, { Schema } from "mongoose";

const notificationTemplateSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    subject: {
        type: String
    },
    channel: {
        type: String,
        enum: ["EMAIL", "MOBILE"],
        required: true
    }
}, {
    timestamps: true
});

export const NotificationTemplate = mongoose.model("NotificationTemplate", notificationTemplateSchema);