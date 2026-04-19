const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    originalName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ["pdf", "text"],
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    summaryPreview: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Document", documentSchema);
