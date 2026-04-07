const Submission = require("../models/Submission");
const Exam = require("../models/Exam");

const findQuestionInExam = (exam, questionId) => {
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
      .populate("exam", "title")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { scoreManual, feedback } = req.body;
    const updatedSubmission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { $set: { scoreManual, feedback, status: "graded" } },
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
    fullData.answers = fullData.answers.map((ans) => ({
      ...ans,
      questionId: findQuestionInExam(fullData.exam, ans.questionId),
    }));

    res.json(fullData);
  } catch (error) {
    res.status(500).json("Lỗi server");
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
};
