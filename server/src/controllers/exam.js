const Exam = require("../models/Exam");

// 1. Tạo đề thi mới
const createExam = async (req, res) => {
  try {
    const newExam = new Exam({
      ...req.body,
      author: req.user.id,
    });
    const savedExam = await newExam.save();
    res.status(201).json(savedExam);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 2. Lấy danh sách đề của chính Giáo viên (CRUD - Read)
const getMyExams = async (req, res) => {
  try {
    const exams = await Exam.find({ author: req.user.id });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 3. Lấy tất cả đề thi đã xuất bản (cho Member)
const getAllExamsPublished = async (req, res) => {
  try {
    const exams = await Exam.find()
      .select("title duration author")
      .populate("author", "name");
    res.json(exams);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 4. Lấy danh sách rút gọn (Chỉ title và ID)
const getExamsShortList = async (req, res) => {
  try {
    const exams = await Exam.find().select("title _id");
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 5. Lấy chi tiết 1 đề thi
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json("Không tìm thấy đề thi");
    res.json(exam);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 6. Cập nhật đề thi (Có check quyền sở hữu)
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json("Không tìm thấy đề thi");

    if (exam.author.toString() !== req.user.id) {
      return res.status(403).json("Bạn không có quyền sửa đề của người khác");
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json(updatedExam);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 7. Xóa đề thi (Có check quyền sở hữu)
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json("Không tìm thấy đề thi");

    if (exam.author.toString() !== req.user.id) {
      return res.status(403).json("Bạn không có quyền xóa đề của người khác");
    }

    await Exam.findByIdAndDelete(req.params.id);
    res.status(200).json("Đã xóa đề thi thành công");
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createExam,
  getMyExams,
  getAllExamsPublished,
  getExamsShortList,
  getExamById,
  updateExam,
  deleteExam,
};
