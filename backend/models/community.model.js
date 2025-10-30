//const mongoose = require('mongoose');
import mongoose, { Schema } from "mongoose";
const CommunitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    description: { type: String },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    membersCount: { type: Number, default: 0 },
    rules: [{ id: String, text: String }],
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Community = mongoose.model("Community", CommunitySchema);
//module.exports = mongoose.model('Community', CommunitySchema);