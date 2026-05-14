const Submission = require("../models/Submission");
const Exam = require("../models/Exam");

const findQuestionInExam = (exam, questionId) => {
  if (!exam || !exam.questions || !questionId) return null;

  // 1. Ép kiểu ID về String để so sánh chính xác nhất
  const targetId = questionId.toString();

  // 2. Tìm ở cấp độ câu hỏi chính (Trắc nghiệm đơn, tự luận đơn)
  let questionData = exam.questions.find(
    (q) => q._id && q._id.toString() === targetId,
  );

  // 3. Nếu không thấy, tìm sâu vào trong các nhóm bài đọc (passage_group)
  if (!questionData) {
    for (const mainQ of exam.questions) {
      if (mainQ.type === "passage_group" && Array.isArray(mainQ.subQuestions)) {
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
const submitExam = async (req, res) => {
  try {
    const { examId, answers, timeSpent } = req.body;
    const studentId = req.user.id;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json("Đề thi không tồn tại");

    if (exam.maxAttempts && exam.maxAttempts > 0) {
      const attemptCount = await Submission.countDocuments({
        exam: examId,
        student: studentId,
      });

      if (attemptCount >= exam.maxAttempts) {
        return res.status(403).json({
          message: `Bạn đã hết lượt thi. Số lần thi tối đa cho phép là ${exam.maxAttempts} lần.`,
        });
      }
      console.log("=> KẾT QUẢ: CHO PHÉP (Còn lượt)");
    }

    let hasEssay = false;
    if (exam.questions && exam.questions.length > 0) {
      for (const q of exam.questions) {
        if (q.type === "essay" || q.type === "essay") {
          hasEssay = true;
          break;
        }
        if (q.type === "passage_group" && q.subQuestions) {
          const hasSubEssay = q.subQuestions.some(
            (subQ) => subQ.type === "essay" || subQ.type === "essay",
          );
          if (hasSubEssay) {
            hasEssay = true;
            break;
          }
        }
      }
    }
    const submissionStatus = hasEssay ? "pending" : "graded";

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
      status: submissionStatus,
    });

    await newSubmission.save();
    res.status(201).json({
      message: "Nộp bài thành công",
      scoreAuto,
      totalPoints: exam.totalPoints || 0,
      status: submissionStatus,
    });
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
      .populate("exam", "title subject maxAttempts totalPoints questions")
      .sort({ createdAt: -1 });

    const formattedResults = results.map((result) => {
      const submissionObj = result.toObject();

      if (submissionObj.exam) {
        if (
          !submissionObj.exam.totalPoints ||
          submissionObj.exam.totalPoints === 0
        ) {
          let tempTotal = 0;
          submissionObj.exam.questions?.forEach((q) => {
            if (q.type === "passage_group") {
              q.subQuestions?.forEach(
                (sq) => (tempTotal += Number(sq.points || 0)),
              );
            } else if (q.type !== "instruction") {
              tempTotal += Number(q.points || 0);
            }
          });
          submissionObj.exam.totalPoints = tempTotal;
        }

        return {
          ...submissionObj,
          attemptInfo: {
            max: submissionObj.exam.maxAttempts || 0,
            isUnlimited:
              !submissionObj.exam.maxAttempts ||
              submissionObj.exam.maxAttempts === 0,
          },
        };
      }
      return submissionObj;
    });

    res.json(formattedResults);
  } catch (err) {
    console.error("Lỗi getMyResults:", err);
    res.status(500).json(err);
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { scoreManual, feedback, scoreManualDetails, essayAnswers } =
      req.body;
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      {
        $set: {
          scoreManual,
          essayAnswers,
          feedback,
          scoreManualDetails,
          status: "graded",
        },
      },
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

    if (
      fullData.exam &&
      (!fullData.exam.totalPoints || fullData.exam.totalPoints === 0)
    ) {
      let tempTotal = 0;
      fullData.exam.questions?.forEach((q) => {
        if (q.type === "passage_group") {
          q.subQuestions?.forEach(
            (sq) => (tempTotal += Number(sq.points || 0)),
          );
        } else if (q.type !== "instruction") {
          tempTotal += Number(q.points || 0);
        }
      });
      fullData.exam.totalPoints = tempTotal;
    }

    if (fullData.exam && fullData.exam.questions) {
      fullData.answers = fullData.answers.map((ans) => ({
        ...ans,
        questionId: findQuestionInExam(fullData.exam, ans.questionId),
      }));
    }

    res.json(fullData);
  } catch (err) {
    console.error("Lỗi getReview:", err);
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

    if (
      fullData.exam &&
      (fullData.exam.totalPoints === 0 || !fullData.exam.totalPoints)
    ) {
      let tempTotal = 0;
      fullData.exam.questions?.forEach((q) => {
        if (q.type === "passage_group") {
          q.subQuestions?.forEach(
            (sub) => (tempTotal += Number(sub.points || 0)),
          );
        } else if (q.type !== "instruction") {
          tempTotal += Number(q.points || 0);
        }
      });
      fullData.exam.totalPoints = tempTotal;
    }

    if (fullData.exam && fullData.exam.questions) {
      fullData.answers = fullData.answers.map((ans) => ({
        ...ans,
        questionId: findQuestionInExam(fullData.exam, ans.questionId),
      }));
    } else {
      fullData.exam = null;
    }

    res.json(fullData);
  } catch (error) {
    console.error(error);
    res.status(500).json("Lỗi server");
  }
};
const getActivityLog = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const myExams = await Exam.find({ author: teacherId }).select("_id title");
    const examIds = myExams.map((e) => e._id);

    const latestSubmissions = await Submission.find({ exam: { $in: examIds } })
      .populate("student", "name")
      .populate("exam", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    const latestExamActions = await Exam.find({ author: teacherId })
      .sort({ updatedAt: -1 })
      .limit(10);

    const logs = [
      ...latestSubmissions.map((s) => ({
        id: s._id,
        type: "STUDENT_SUBMIT",
        title: `${s.student?.name || "Ẩn danh"} đã nộp bài`,
        desc: `Đề thi: ${s.exam?.title || "Đề đã xóa"}`,
        time: s.createdAt,
        status: s.status === "graded" ? "success" : "warning",
      })),
      ...latestExamActions.map((e) => ({
        id: e._id,
        type: "TEACHER_ACTION",
        title: `Bạn đã cập nhật đề thi`,
        desc: `Nội dung: ${e.title}`,
        time: e.updatedAt,
        status: "info",
      })),
    ];

    logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    res.json(logs.slice(0, 20));
  } catch (error) {
    res.status(500).json("Lỗi server khi lấy nhật ký");
  }
};

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
