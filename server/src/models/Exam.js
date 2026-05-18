const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject: { type: String, required: true },
    duration: { type: Number, required: true },

    maxAttempts: {
      type: Number,
      default: 0,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    questions: [
      {
        type: {
          type: String,
          enum: ["multiple_choice", "essay", "passage_group", "instruction"],
          required: true,
        },
        content: String, // Tiêu đề câu hỏi hoặc Yêu cầu bài đọc
        passage: String, // Nội dung đoạn văn Tiếng Anh
        options: [String],
        correctAnswer: String,
        points: { type: Number, default: 1 },

        subQuestions: [
          {
            content: String, // Nội dung câu hỏi con
            options: [String], // 4 đáp án cho câu hỏi con
            correctAnswer: String, // Đáp án đúng câu hỏi con
            points: { type: Number, default: 1 },
          },
        ],
      },
    ],
  },
  { timestamps: true, strict: false },
);

const calculateTotalPoints = (questions) => {
  let total = 0;
  if (!questions || !Array.isArray(questions)) return 0;

  questions.forEach((q) => {
    if (q.type === "passage_group" && Array.isArray(q.subQuestions)) {
      q.subQuestions.forEach((subQ) => {
        total += Number(subQ.points || 0);
      });
    } else if (q.type !== "instruction") {
      // Cộng tất cả các loại câu hỏi khác trừ 'instruction'
      total += Number(q.points || 0);
    }
  });
  return total;
};

examSchema.pre("save", async function () {
  this.totalPoints = calculateTotalPoints(this.questions);
});

examSchema.pre("findOneAndUpdate", async function () {
  const updateData = this.getUpdate();

  if (updateData) {
    if (updateData.$set && updateData.$set.questions) {
      updateData.$set.totalPoints = calculateTotalPoints(
        updateData.$set.questions,
      );
    } else if (updateData.questions) {
      updateData.totalPoints = calculateTotalPoints(updateData.questions);
    }
  }
});

module.exports = mongoose.model("Exam", examSchema);
