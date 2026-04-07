const router = require("express").Router();
const submission = require("../controllers/submission.js");
const { verifyToken, isTeacher } = require("../middlewares/auth.js");

// 1. Nộp bài thi
router.post("/submit", verifyToken, submission.submitExam);

// 2. Lấy bảng xếp hạng (ĐÃ CẬP NHẬT LOGIC THỜI GIAN)
router.get("/leaderboard/:examId", submission.getLeaderboard);

// --- CÁC ROUTE KHÁC GIỮ NGUYÊN ---

router.get("/my-results", verifyToken, submission.getMyResults);

router.put(
  "/grade/:submissionId",
  verifyToken,
  isTeacher,
  submission.gradeSubmission,
);

// server/routes/submission.js
router.get("/review/:submissionId", verifyToken, submission.getReview);

// 1. Sửa Route /exam/:examId (Dành cho danh sách bài nộp của giáo viên)
// Sửa route lấy danh sách bài nộp theo đề thi
router.get(
  "/exam/:examId",
  verifyToken,
  isTeacher,
  submission.getSubmissionsByExam,
);

// 2. Sửa Route /detail/:submissionId (Dùng chung cho cả Chấm điểm và Review)
router.get(
  "/detail/:submissionId",
  verifyToken,
  submission.getSubmissionDetail,
);

module.exports = router;
