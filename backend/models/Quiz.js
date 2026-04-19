const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mcq", "short"],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      default: []
    },
    correctAnswer: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      default: ""
    }
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true
    },
    questions: {
      type: [quizQuestionSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
