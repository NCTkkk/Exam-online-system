const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        content: String,
        isCorrect: Boolean,
      },
    ],
    scoreAuto: { type: Number, default: 0 },
    scoreManual: { type: Number, default: 0 },
    feedback: { type: String, default: "" }, // THÊM TRƯỜNG NÀY
    status: { type: String, enum: ["pending", "graded"], default: "pending" },
    timeSpent: Number,
    startTime: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Submission", submissionSchema);
