import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null → auto-flagged by ML
    itemType: { type: String, enum: ["post", "comment"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed", "action_taken"], default: "pending" },
    spamScore: Number,
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdAt: { type: Date, default: Date.now }
});
export const Report = mongoose.model("Report", reportSchema);
