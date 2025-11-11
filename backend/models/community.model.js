import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, "Community name must be at least 3 characters long"],
        maxlength: [50, "Community name cannot be more than 50 characters"]
    },
    title: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, "Community title must be at least 3 characters long"],
        maxlength: [50, "Community title cannot be more than 50 characters"]
    },
    description: {
        type: String,
        required: true,
        maxlength: [500, "Description cannot be more than 500 characters"]
    },
    // In community.model.js
    creator_id: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        username: {
            type: String,
            required: true
        },
        avatar: {
            public_id: String,
            secure_url: String
        }
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    moderators: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    avatar: {
        public_id: String,
        secure_url: String
    },
    banner: {
        public_id: String,
        secure_url: String
    },
    rules: [{
        title: String,
        description: String
    }],
    is_private: {
        type: Boolean,
        default: false
    },
    members_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export const Community = mongoose.model("Community", communitySchema);