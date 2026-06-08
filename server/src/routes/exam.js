const router = require("express").Router();
const examController = require("../controllers/exam.js");
const { verifyToken, isTeacher } = require("../middlewares/auth.js");

// Các route dành cho Giáo viên (Cần check isTeacher)
router.post("/create", verifyToken, isTeacher, examController.createExam);
router.get("/my-exams", verifyToken, isTeacher, examController.getMyExams);
router.get("/all", verifyToken, examController.getAllExamsPublished);
router.get("/", examController.getExamsShortList);

router.get("/:id", verifyToken, examController.getExamById);
router.put("/:id", verifyToken, isTeacher, examController.updateExam);
router.delete("/:id", verifyToken, isTeacher, examController.deleteExam);

module.exports = router;
