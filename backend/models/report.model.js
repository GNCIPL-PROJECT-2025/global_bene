import mongoose, { Schema } from "mongoose";

const spamPostSchema = new Schema({
    reporter_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    target_type: {
        type: String,
        enum: ['Comment', 'User', 'Post'],
        required: true
    },
    target_id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'target_type'
    },
    reason: {
        type: String,
        required: true,
        maxlength: [500, "Reason cannot be more than 500 characters"]
    },
    spamScore: {
        type: Number,
        default: null
    },
    toxicityScore: {
        type: Number,
        default: null
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    status: {
        type: String,
        enum: ['open', 'pending', 'resolved'],
        default: 'open'
    },
    action_taken: {
        type: String,
        enum: ['none', 'approved', 'removed'],
        default: 'none'
    },
    handled_by: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

export const SpamPost = mongoose.model("SpamPost", spamPostSchema, "spamposts");