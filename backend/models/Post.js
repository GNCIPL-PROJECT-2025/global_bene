const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  mediaUrl: { type: String, default: '' },
  mediaType: { type: String, enum: ['image', 'none'], default: 'none' },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
