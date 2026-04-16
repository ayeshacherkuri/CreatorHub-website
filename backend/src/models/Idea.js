const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ideaSchema.index({ userId: 1, createdAt: -1 });
ideaSchema.index({ userId: 1, status: 1 });
ideaSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model("Idea", ideaSchema);

