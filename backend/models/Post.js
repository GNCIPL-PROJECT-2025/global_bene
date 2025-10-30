import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "none"], default: "none" },
  },
  { timestamps: true }
);

export default model("Post", PostSchema);
