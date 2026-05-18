const Exam = require("../models/Exam");
const Submission = require("../models/Submission");
const { updateUserStats } = require("./submission");

const recalculateExamSubmissions = async (exam) => {
  try {
    // 1. Tìm tất cả các bài nộp thuộc đề thi này
    const submissions = await Submission.find({ exam: exam._id });
    if (!submissions || submissions.length === 0) return;

    console.log(
      `=> [Hệ thống] Phát hiện đáp án thay đổi. Bắt đầu tính lại điểm cho ${submissions.length} bài nộp của đề: "${exam.title}"`,
    );

    // Helper nội bộ tìm câu hỏi nhanh từ cấu trúc đề thi mới nhất (hỗ trợ cả câu hỏi lẻ lẫn bài đọc nhóm)
    const findQuestionInExamObj = (examObj, questionId) => {
      if (!examObj || !examObj.questions || !questionId) return null;
      const targetId = questionId.toString();

      let questionData = examObj.questions.find(
        (q) => q._id && q._id.toString() === targetId,
      );
      if (!questionData) {
        for (const mainQ of examObj.questions) {
          if (
            mainQ.type === "passage_group" &&
            Array.isArray(mainQ.subQuestions)
          ) {
            const subQ = mainQ.subQuestions.find(
              (sq) => sq._id && sq._id.toString() === targetId,
            );
            if (subQ) {
              questionData = subQ;
              break;
            }
          }
        }
      }
      return questionData;
    };

    // 2. Duyệt qua từng bài làm để chấm lại phần trắc nghiệm
    for (const sub of submissions) {
      let newScoreAuto = 0;

      const updatedAnswers = sub.answers.map((ans) => {
        const questionData = findQuestionInExamObj(exam, ans.questionId);
        let isCorrect = false;

        // Chỉ tính toán lại trạng thái đúng/sai nếu câu hỏi còn tồn tại và có thiết lập đáp án đúng
        if (questionData && questionData.correctAnswer) {
          isCorrect =
            String(ans.content || "").trim() ===
            String(questionData.correctAnswer || "").trim();
          if (isCorrect) {
            newScoreAuto += Number(questionData.points) || 0;
          }
        }

        return {
          ...ans.toObject(),
          isCorrect,
        };
      });

      // 3. Lưu điểm số tự động mới vào Database cho bài nộp này
      sub.answers = updatedAnswers;
      sub.scoreAuto = newScoreAuto;
      await sub.save();

      // 4. Nếu bài thi đã ở trạng thái hoàn thành (graded), tái đồng bộ Elo/Rank bằng hàm import từ submission
      if (sub.status === "graded") {
        await updateUserStats(sub.student);
      }
    }
    console.log(
      `✅ [Hệ thống] Đã cập nhật xong toàn bộ điểm số mới cho học sinh.`,
    );
  } catch (error) {
    console.error("💥 LỖI TRONG recalculateExamSubmissions:", error.message);
  }
};

// 1. Tạo đề thi mới
const createExam = async (req, res) => {
  try {
    // 🌟 TỰ ĐỘNG TÍNH TỔNG ĐIỂM (TOTAL POINTS) CHO ĐỀ THI MỚI
    let total = 0;
    if (req.body.questions && Array.isArray(req.body.questions)) {
      req.body.questions.forEach((q) => {
        if (q.type === "passage_group" && q.subQuestions) {
          // Cộng dồn điểm của các câu hỏi nhỏ nằm trong nhóm bài đọc
          q.subQuestions.forEach((sub) => {
            total += Number(sub.points || 0);
          });
        } else if (q.type !== "instruction") {
          // Cộng điểm của các câu độc lập (trừ câu hướng dẫn)
          total += Number(q.points || 0);
        }
      });
    }

    // Gán tổng điểm vừa tính toán được vào cấu trúc dữ liệu đề thi
    const examData = {
      ...req.body,
      totalPoints: total, // Đảm bảo totalPoints luôn có giá trị thật khi lưu
      author: req.user.id,
    };

    const newExam = new Exam(examData);
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

    recalculateExamSubmissions(updatedExam);

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
