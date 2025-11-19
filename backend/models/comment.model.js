import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
    body: {
        type: String,
        required: true,
        maxlength: [1000, "Comment cannot be more than 1000 characters"]
    },
    author_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post_id: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    parent_id: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    path: {
        type: String,
        required: true
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    replies_count: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['flagged', 'removed', 'active'],
        default: 'active'
    },
    score: {
        type: Number,
        default: 0
    },
    label:{
        type: String,
        default: 'safe'
    },
    isSensitive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Comment = mongoose.model("Comment", commentSchema);