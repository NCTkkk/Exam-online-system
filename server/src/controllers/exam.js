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
    const exams = await Exam.find({ author: req.user.id }).lean();

    const updatedExams = exams.map((exam) => {
      let total = 0;
      exam.questions?.forEach((q) => {
        if (q.type === "passage_group") {
          q.subQuestions?.forEach((subQ) => {
            total += Number(subQ.points) || 0;
          });
        } else {
          total += Number(q.points) || 0;
        }
      });

      return {
        ...exam,
        totalPoints: exam.totalPoints || total,
      };
    });

    res.status(200).json(updatedExams);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 3. Lấy tất cả đề thi đã xuất bản (cho Member)
const getAllExamsPublished = async (req, res) => {
  try {
    const studentId = req.user.id;

    const exams = await Exam.find()
      .select("title duration author subject maxAttempts totalPoints")
      .populate("author", "name")
      .lean();

    const Submission = require("../models/Submission");

    const examsWithAttemptCount = await Promise.all(
      exams.map(async (exam) => {
        const count = await Submission.countDocuments({
          exam: exam._id,
          student: studentId,
        });

        return {
          ...exam,
          currentAttempts: count,
        };
      }),
    );

    res.json(examsWithAttemptCount);
  } catch (err) {
    res.status(500).json(err);
  }
};

// 4. Lấy danh sách rút gọn (Chỉ title và ID)
const getExamsShortList = async (req, res) => {
  try {
    const exams = await Exam.find().select("title _id subject");
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

    // 1. KIỂM TRA VÀ TÍNH TOÁN ĐIỂM (Nếu DB đang lưu là 0)
    const examObj = exam.toObject();
    if (!examObj.totalPoints || examObj.totalPoints === 0) {
      let total = 0;
      examObj.questions?.forEach((q) => {
        if (q.type === "passage_group") {
          q.subQuestions?.forEach((sub) => (total += Number(sub.points || 0)));
        } else if (q.type !== "instruction") {
          total += Number(q.points || 0);
        }
      });
      examObj.totalPoints = total;
    }

    // 2. NẾU LÀ HỌC SINH (MEMBER), KIỂM TRA LƯỢT THI
    if (req.user.role === "member" && examObj.maxAttempts > 0) {
      const Submission = require("../models/Submission");
      const attemptCount = await Submission.countDocuments({
        exam: examObj._id,
        student: req.user.id,
      });

      if (attemptCount >= examObj.maxAttempts) {
        return res.status(403).json({
          message: `Bạn đã hết lượt làm bài thi này (Tối đa: ${examObj.maxAttempts} lần).`,
        });
      }
    }

    // Trả về object đã được xử lý điểm
    res.json(examObj);
  } catch (err) {
    console.error("Lỗi getExamById:", err);
    res.status(500).json(err);
  }
};

// 6. Cập nhật đề thi (Có check quyền sở hữu)
const updateExam = async (req, res) => {
  try {
    // 1. Lấy dữ liệu hiện tại từ DB nếu trong req.body không gửi đủ questions
    const currentExam = await Exam.findById(req.params.id);
    if (!currentExam) return res.status(404).json("Không tìm thấy đề thi");

    // 2. Xác định mảng questions dùng để tính điểm
    // Ưu tiên mảng questions mới từ req.body, nếu không có thì dùng mảng cũ trong DB
    const questionsToCalculate = req.body.questions || currentExam.questions;

    let total = 0;
    if (questionsToCalculate && Array.isArray(questionsToCalculate)) {
      questionsToCalculate.forEach((q) => {
        if (q.type === "passage_group" && q.subQuestions) {
          q.subQuestions.forEach((sub) => {
            total += Number(sub.points || 0);
          });
        } else if (q.type !== "instruction") {
          total += Number(q.points || 0);
        }
      });
    }

    // 3. Gán totalPoints vào body để cập nhật vào DB
    req.body.totalPoints = total;

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
