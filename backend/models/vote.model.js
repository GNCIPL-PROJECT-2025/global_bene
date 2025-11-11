import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    target_type: {
        type: String,
        enum: ['Comment', 'Post'],
        required: true
    },
    target_id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'target_type'
    },
    value: {
        type: Number,
        enum: [-1, 1], // -1 for downvote, 1 for upvote
        required: true
    }
}, {
    timestamps: true
});

export const Vote = mongoose.model("Vote", voteSchema);