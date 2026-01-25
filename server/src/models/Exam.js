const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    duration: { type: Number, required: true },
    questions: [
      {
        type: {
          type: String,
          // THÊM: "passage_group" vào enum
          enum: ["multiple_choice", "essay", "passage_group", "instruction"],
          required: true,
        },
        content: String, // Tiêu đề câu hỏi hoặc Yêu cầu bài đọc
        passage: String, // THÊM: Nội dung đoạn văn Tiếng Anh
        options: [String],
        correctAnswer: String,
        points: { type: Number, default: 1 },

        // THÊM: Mảng chứa các câu hỏi trắc nghiệm của đoạn văn
        subQuestions: [
          {
            content: String, // Nội dung câu hỏi con (VD: What is the main idea?)
            options: [String], // 4 đáp án cho câu hỏi con
            correctAnswer: String, // Đáp án đúng câu hỏi con
            points: { type: Number, default: 1 },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Exam", examSchema);
