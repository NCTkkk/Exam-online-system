const Submission = require("../models/Submission");
const Exam = require("../models/Exam");

const findQuestionInExam = (exam, questionId) => {
  // Nếu đề thi bị xóa (exam null) hoặc không có câu hỏi, trả về null luôn
  if (!exam || !exam.questions) return null;

  // Đảm bảo questionId tồn tại
  if (!questionId) return null;

  let questionData = exam.questions.find(
    (q) => q._id.toString() === questionId.toString(),
  );

  if (!questionData) {
    for (const mainQ of exam.questions) {
      if (mainQ.type === "passage_group" && mainQ.subQuestions) {
        const subQ = mainQ.subQuestions.find(
          (sq) => sq._id.toString() === questionId.toString(),
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

const submitExam = async (req, res) => {
  try {
    const { examId, answers, timeSpent } = req.body;
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json("Đề thi không tồn tại");

    let scoreAuto = 0;

    const processedAnswers = answers.map((ans) => {
      let isCorrect = false;
      const questionData = findQuestionInExam(exam, ans.questionId);

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
    res.status(500).json(err);
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const submissions = await Submission.find({ exam: req.params.examId })
      .populate("student", "name")
      .lean();

    const leaderboard = submissions.map((s) => ({
      studentName: s.student?.name || "Ẩn danh",
      totalScore: s.scoreAuto + (s.scoreManual || 0),
      timeSpent: s.timeSpent || 0,
      submittedAt: s.createdAt,
    }));

    leaderboard.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.timeSpent - b.timeSpent;
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getMyResults = async (req, res) => {
  try {
    const results = await Submission.find({ student: req.user.id })
      .populate("exam", "title subject")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
};

const gradeSubmission = async (req, res) => {
  try {
    console.log("Dữ liệu nhận từ FE:", req.body);
    const { scoreManual, feedback, scoreManualDetails } = req.body;
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { $set: { scoreManual, feedback, scoreManualDetails, status: "graded" } },
      { new: true },
    );
    if (!updatedSubmission)
      return res.status(404).json("Không tìm thấy bài nộp");
    res.json(updatedSubmission);
  } catch (err) {
    res.status(500).json("Lỗi khi cập nhật điểm");
  }
};

const getSubmissionsByExam = async (req, res) => {
  try {
    const submissions = await Submission.find({ exam: req.params.examId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json("Lỗi server khi tải danh sách bài nộp");
  }
};

const getReview = async (req, res) => {
  try {
    const submission = await Submission.findById(
      req.params.submissionId,
    ).populate("exam");
    if (!submission) return res.status(404).json("Không tìm thấy bài nộp");

    const fullData = submission.toObject();
    fullData.answers = fullData.answers.map((ans) => ({
      ...ans,
      questionId: findQuestionInExam(fullData.exam, ans.questionId),
    }));

    res.json(fullData);
  } catch (err) {
    res.status(500).json("Lỗi server");
  }
};

const getSubmissionDetail = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate("student", "name email")
      .populate("exam");

    if (!submission) return res.status(404).json("Không tìm thấy bài làm");

    const fullData = submission.toObject();
    // KIỂM TRA: Nếu đề thi vẫn tồn tại mới thực hiện map câu hỏi
    if (fullData.exam && fullData.exam.questions) {
      fullData.answers = fullData.answers.map((ans) => ({
        ...ans,
        questionId: findQuestionInExam(fullData.exam, ans.questionId),
      }));
    } else {
      // Nếu đề đã xóa, ta giữ nguyên mảng answers (hoặc xử lý tối giản)
      // để tránh lỗi hàm findQuestionInExam
      fullData.exam = null;
    }

    res.json(fullData);
  } catch (error) {
    res.status(500).json("Lỗi server");
  }
};

const getActivityLog = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Lấy 10 bài nộp mới nhất của các đề thi do giáo viên này tạo
    // Chúng ta cần tìm các Exam của giáo viên này trước
    const myExams = await Exam.find({ author: teacherId }).select("_id title");
    const examIds = myExams.map((e) => e._id);

    const latestSubmissions = await Submission.find({ exam: { $in: examIds } })
      .populate("student", "name")
      .populate("exam", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    // 2. Lấy 10 đề thi vừa được cập nhật/tạo mới của giáo viên
    const latestExamActions = await Exam.find({ author: teacherId })
      .sort({ updatedAt: -1 })
      .limit(10);

    // 3. Trộn (Merge) và định dạng lại để Frontend dễ hiển thị
    const logs = [
      ...latestSubmissions.map((s) => ({
        id: s._id,
        // examId: s.exam?._id,
        type: "STUDENT_SUBMIT",
        title: `${s.student?.name || "Ẩn danh"} đã nộp bài`,
        desc: `Đề thi: ${s.exam?.title || "Đề đã xóa"}`,
        time: s.createdAt,
        status: s.status === "graded" ? "success" : "warning",
      })),
      ...latestExamActions.map((e) => ({
        id: e._id,
        // examId: e._id,
        type: "TEACHER_ACTION",
        title: `Bạn đã cập nhật đề thi`,
        desc: `Nội dung: ${e.title}`,
        time: e.updatedAt,
        status: "info",
      })),
    ];

    // Sắp xếp tất cả theo thời gian mới nhất
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(logs.slice(0, 20)); // Trả về 20 hoạt động gần nhất
  } catch (error) {
    res.status(500).json("Lỗi server khi lấy nhật ký");
  }
};

module.exports = { getActivityLog };

module.exports = {
  submitExam,
  getLeaderboard,
  getMyResults,
  gradeSubmission,
  getSubmissionsByExam,
  getSubmissionDetail,
  getReview,
  getActivityLog,
};
