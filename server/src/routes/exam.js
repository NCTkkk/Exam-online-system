const router = require("express").Router();
const Exam = require("../models/Exam");
const { verifyToken, isTeacher } = require("../middlewares/auth.js");

// API Tạo đề mới
router.post("/create", verifyToken, isTeacher, async (req, res) => {
  try {
    const newExam = new Exam({
      ...req.body,
      author: req.user.id, // Lấy ID từ Token
    });
    const savedExam = await newExam.save();
    res.status(201).json(savedExam);
  } catch (err) {
    res.status(500).json(err);
  }
});

// API Lấy danh sách đề của chính User đó (CRUD - Read)
router.get("/my-exams", verifyToken, isTeacher, async (req, res) => {
  try {
    const exams = await Exam.find({ author: req.user.id });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json(err);
  }
});

// API lấy tất cả đề thi đã xuất bản (cho Member)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const exams = await Exam.find()
      .select("title duration author")
      .populate("author", "name");
    res.json(exams);
  } catch (err) {
    res.status(500).json(err);
  }
});

// API lấy chi tiết 1 đề thi khi bắt đầu làm
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    res.json(exam);
  } catch (err) {
    res.status(500).json(err);
  }
});

// server/routes/exam.js
router.get("/my-exams", verifyToken, isTeacher, async (req, res) => {
  try {
    const exams = await Exam.find({ author: req.user.id });
    res.json(exams);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Cập nhật đề thi
router.put("/:id", verifyToken, isTeacher, async (req, res) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json(updatedExam);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", verifyToken, isTeacher, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json("Không tìm thấy đề thi");

    // Kiểm tra xem có đúng là chủ sở hữu đề thi không
    if (exam.author.toString() !== req.user.id) {
      return res.status(403).json("Bạn không có quyền xóa đề của người khác");
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.status(200).json("Đã xóa đề thi thành công");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const exams = await Exam.find().select("title _id"); // Chỉ lấy tiêu đề và ID cho nhẹ
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
