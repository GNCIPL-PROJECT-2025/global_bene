// models/activityLog.model.js
import mongoose, { Schema } from "mongoose";

const activitySchema = new Schema(
  {
    event_type: {
      type: String,
      required: true,
      enum: [
        "upload",
        "delete",
        "download",
        "analytics",
        "update",
        "login",
        "logout",
        "register",
        "reset-password",
        "change-password",
        "update-profile",
        "avatar",
        "delete-user",
        "verify-otp",
        "post",
        "update-post",
        "delete-post",
        "reply",
        "update-reply",
        "delete-reply",
        "admin-update-profile",
        "admin-update-avatar",
        "admin-delete-user",
        "clear-logs",
        "community",
        "update-community",
        "delete-community",
        "join-community",
        "leave-community",
        "save-post",
        "unsave-post",
        "upvote",
        "downvote",
        "read-notification",
        "delete-notification",
        "view",
        "click",
        "share"
      ],
    },

    description: { type: String, default: "" },
    entity_type: { type: String },
    entity_id: { type: Schema.Types.ObjectId },
    session_id: { type: String },

    // FIX: ALLOW ANY SHAPE (avoid cast errors)
    props: {
      type: Schema.Types.Mixed,
      default: {}
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  }
);

const activityLogSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    activities: [activitySchema],
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

