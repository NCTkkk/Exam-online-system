const router = require("express").Router();
const examController = require("../controllers/exam.js");
const { verifyToken, isTeacher } = require("../middlewares/auth.js");

// Các route dành cho Giáo viên (Cần check isTeacher)
router.post("/create", verifyToken, isTeacher, examController.createExam);
router.get("/my-exams", verifyToken, isTeacher, examController.getMyExams);
router.put("/:id", verifyToken, isTeacher, examController.updateExam);
router.delete("/:id", verifyToken, isTeacher, examController.deleteExam);

// Các route dành cho Member/Học sinh
router.get("/all", verifyToken, examController.getAllExamsPublished);
router.get("/:id", verifyToken, examController.getExamById);

// Route công khai hoặc danh sách rút gọn
router.get("/", examController.getExamsShortList);

module.exports = router;
