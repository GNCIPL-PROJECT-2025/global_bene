import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    votes: {
        post: {
            target_ids: [{
                type: Schema.Types.ObjectId,
                ref: "Post"
            }],
            value: {
                type: Number,
                default: 0
            }
        },
        comment: {
            target_ids: [{
                type: Schema.Types.ObjectId,
                ref: "Comment"
            }],
            value: {
                type: Number,
                default: 0
            }
        }
    }
}, {
    timestamps: true
});

export const Vote = mongoose.model("Vote", voteSchema);