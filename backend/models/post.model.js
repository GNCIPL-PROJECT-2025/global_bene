import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: [300, "Title cannot be more than 300 characters"]
    },
    body: {
        type: String
    },
    url: {
        type: String,
        default: ""
    },
    tags: [{
        type: String
    }],
    author_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    community_id: {
        type: Schema.Types.ObjectId,
        ref: "Community",
        required: true
    },
    type: {
        type: String,
        default: "text"
    },
    media: {
        public_id: String,
        secure_url: String
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    num_comments: {
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
    isPinned: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
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

export const Post = mongoose.model("Post", postSchema);