const router = require("express").Router();
const Submission = require("../models/Submission.js");
const Exam = require("../models/Exam.js");
const { verifyToken, isTeacher } = require("../middlewares/auth.js");

// 1. Nộp bài thi
router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { examId, answers, timeSpent } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json("Đề thi không tồn tại");

    let scoreAuto = 0;

    // answers lúc này là mảng: [{ questionId: "...", content: "..." }]
    const processedAnswers = answers.map((ans) => {
      let isCorrect = false;
      let points = 0;

      // Bước 1: Tìm xem đây là câu hỏi đơn hay câu hỏi con
      // Tìm trong câu hỏi chính
      let questionData = exam.questions.find(
        (q) => q._id.toString() === ans.questionId,
      );

      // Nếu không thấy, tìm trong subQuestions của các câu passage_group
      if (!questionData) {
        for (const mainQ of exam.questions) {
          if (mainQ.type === "passage_group" && mainQ.subQuestions) {
            const subQ = mainQ.subQuestions.find(
              (sq) => sq._id.toString() === ans.questionId,
            );
            if (subQ) {
              questionData = subQ;
              break;
            }
          }
        }
      }

      // Bước 2: Chấm điểm nếu là trắc nghiệm
      if (questionData && questionData.correctAnswer) {
        isCorrect = ans.content === questionData.correctAnswer;
        if (isCorrect) scoreAuto += questionData.points || 0;
      }

      return {
        questionId: ans.questionId,
        content: ans.content,
        isCorrect,
      };
    });

    const newSubmission = new Submission({
      exam: examId,
      student: req.user.id,
      answers: processedAnswers,
      scoreAuto,
      timeSpent: timeSpent || 0,
      status: "graded",
    });

    await newSubmission.save();
    res.status(201).json({ message: "Nộp bài thành công", scoreAuto });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 2. Lấy bảng xếp hạng (ĐÃ CẬP NHẬT LOGIC THỜI GIAN)
router.get("/leaderboard/:examId", async (req, res) => {
  try {
    const submissions = await Submission.find({ exam: req.params.examId })
      .populate("student", "name")
      .lean();

    const leaderboard = submissions.map((s) => {
      return {
        studentName: s.student?.name || "Ẩn danh",
        totalScore: s.scoreAuto + (s.scoreManual || 0),
        timeSpent: s.timeSpent || 0, // Lấy trực tiếp trường timeSpent trong DB
        submittedAt: s.createdAt,
      };
    });

    // SẮP XẾP: 1. Điểm cao nhất -> 2. Thời gian ít nhất (nhanh nhất)
    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return a.timeSpent - b.timeSpent;
    });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- CÁC ROUTE KHÁC GIỮ NGUYÊN ---

router.get("/my-results", verifyToken, async (req, res) => {
  try {
    const results = await Submission.find({ student: req.user.id })
      .populate("exam", "title")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/grade/:submissionId", verifyToken, async (req, res) => {
  try {
    const { scoreManual, feedback } = req.body; // Lấy feedback từ body gửi lên

    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        $set: {
          scoreManual: scoreManual,
          feedback: feedback, // ĐẢM BẢO CÓ DÒNG NÀY
          status: "graded", // Đánh dấu là đã chấm xong
        },
      },
      { new: true },
    );

    if (!updatedSubmission) {
      return res.status(404).json("Không tìm thấy bài nộp");
    }

    res.json(updatedSubmission);
  } catch (err) {
    console.error(err);
    res.status(500).json("Lỗi khi cập nhật điểm");
  }
});

// server/routes/submission.js
router.get("/review/:submissionId", verifyToken, async (req, res) => {
  try {
    // 1. Tìm bài nộp
    const submission = await Submission.findById(
      req.params.submissionId,
    ).populate("exam");

    // 2. Vì questions nằm TRONG exam, chúng ta sẽ map thông tin từ exam sang answers
    const fullData = submission.toObject();
    fullData.answers = fullData.answers.map((ans) => {
      // Tìm nội dung câu hỏi gốc trong đề thi dựa vào questionId
      const originalQuestion = fullData.exam.questions.find(
        (q) => q._id.toString() === ans.questionId.toString(),
      );
      return {
        ...ans,
        questionId: originalQuestion, // Bây giờ questionId đã là một Object chứa type, content...
      };
    });

    res.json(fullData);
  } catch (err) {
    res.status(500).json("Lỗi server");
  }
});

// 1. Sửa Route /exam/:examId (Dành cho danh sách bài nộp của giáo viên)
// Sửa route lấy danh sách bài nộp theo đề thi
router.get("/exam/:examId", verifyToken, isTeacher, async (req, res) => {
  try {
    const submissions = await Submission.find({ exam: req.params.examId })
      .populate("student", "name email")
      // Không populate answers.questionId ở đây để tránh lỗi 500
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error("Lỗi Server:", err);
    res.status(500).json("Lỗi server khi tải danh sách bài nộp");
  }
});

// 2. Sửa Route /detail/:submissionId (Dùng chung cho cả Chấm điểm và Review)
router.get("/detail/:submissionId", verifyToken, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate("student", "name email")
      .populate("exam");

    if (!submission) return res.status(404).json("Không tìm thấy bài làm");

    const fullData = submission.toObject();

    fullData.answers = fullData.answers.map((ans) => {
      // Tìm trong câu hỏi chính
      let originalQuestion = fullData.exam.questions.find(
        (q) => q._id.toString() === ans.questionId.toString(),
      );

      // NẾU KHÔNG THẤY (Nghĩa là đây là câu hỏi con trong Reading)
      if (!originalQuestion) {
        for (const mainQ of fullData.exam.questions) {
          if (mainQ.type === "passage_group" && mainQ.subQuestions) {
            const subQ = mainQ.subQuestions.find(
              (sq) => sq._id.toString() === ans.questionId.toString(),
            );
            if (subQ) {
              originalQuestion = subQ;
              break;
            }
          }
        }
      }

      return {
        ...ans,
        questionId: originalQuestion,
      };
    });

    res.json(fullData);
  } catch (err) {
    res.status(500).json("Lỗi server");
  }
});

module.exports = router;
