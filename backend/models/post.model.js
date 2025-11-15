import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxlength: [300, "Title cannot be more than 300 characters"]
    },
    body: {
        type: String,
        required: function() {
            // Content is required for text and link posts, optional for image/video posts
            return this.type === 'text' || this.type === 'link';
        }
    },
    url: {
        type: String,
        default: ""
    },
    tags: [{
        type: String
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    community_id: {
        type: Schema.Types.ObjectId,
        ref: "Community",
        required: false
    },
    type: {
        type: String,
        enum: ["text", "link", "image", "video"],
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
    spamScore: {
        type: Number,
        default: null
    },
    toxicityScore: {
        type: Number,
        default: null
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
    }
}, {
    timestamps: true
});

export const Post = mongoose.model("Post", postSchema);