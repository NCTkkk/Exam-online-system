import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineChevronLeft,
  HiOutlinePencilSquare,
  HiOutlineCheckBadge,
  HiOutlineDocumentText,
  HiOutlineUserCircle,
} from "react-icons/hi2";

const GradeSubmission = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [itemScores, setItemScores] = useState({});
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Kiểm tra quyền truy cập
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin" && user.role !== "user") {
      alert("Bạn không có quyền truy cập trang chấm điểm!");
      navigate("/");
      return;
    }

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/submissions/detail/${submissionId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setSubmission(res.data);
        if (res.data.feedback) setFeedback(res.data.feedback);

        // Load lại điểm chi tiết nếu đã chấm trước đó
        if (res.data.scoreManualDetails) {
          setItemScores(res.data.scoreManualDetails);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        alert("Không thể tải bài làm này.");
      }
    };
    if (submissionId) fetchDetail();
  }, [submissionId, navigate]);

  const handleUpdateGrade = async () => {
    // Tính tổng điểm tự luận từ các ô nhập chi tiết
    const totalManual = Object.values(itemScores).reduce(
      (a, b) => a + Number(b || 0),
      0,
    );

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/submissions/grade/${submissionId}`,
        {
          scoreManual: totalManual,
          feedback: feedback,
          scoreManualDetails: itemScores, // Đồng bộ lưu chi tiết từng câu
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Đã lưu điểm và lời phê thành công!");
      navigate(-1);
    } catch (err) {
      alert("Lỗi khi lưu điểm");
    }
  };

  if (!submission)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );

  // Tính tổng điểm hiển thị thời gian thực
  const currentTotal =
    (submission.scoreAuto || 0) +
    Object.values(itemScores).reduce((a, b) => a + Number(b || 0), 0);

  // Helper tìm câu trả lời của học sinh
  const getStudentAnswer = (qId) => {
    return submission.answers?.find(
      (ans) => (ans.questionId?._id || ans.questionId) === qId,
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <style>{`
        mark { background-color: #fef08a; color: #854d0e; padding: 0 2px; border-radius: 2px; }
        u { text-decoration-color: #6366f1; text-underline-offset: 4px; }
        .prose-invert mark { background-color: #ca8a04; color: white; }
      `}</style>

      {/* HEADER ĐỒNG BỘ */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <HiOutlineChevronLeft size={24} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <HiOutlineUserCircle size={40} className="text-slate-300" />
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase leading-none">
                  {submission.student?.name}
                </h2>
                <p className="text-[10px] text-indigo-500 font-bold uppercase mt-1 tracking-wider">
                  Chấm bài: {submission.exam?.title}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl shadow-xl flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              Tổng điểm dự kiến
            </span>
            <span className="text-2xl font-black text-yellow-400">
              {currentTotal.toFixed(2)}đ
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 px-4 space-y-8">
        {/* Tóm tắt tình trạng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-xl text-green-600">
              <HiOutlineCheckBadge size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Điểm máy chấm
              </p>
              <p className="font-bold text-slate-700">
                {submission.scoreAuto} điểm
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <HiOutlineDocumentText size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Điểm tự luận mới
              </p>
              <p className="font-bold text-slate-700">
                {Object.values(itemScores)
                  .reduce((a, b) => a + Number(b || 0), 0)
                  .toFixed(2)}
                đ
              </p>
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÂU HỎI LẤY TỪ EXAM (Đảm bảo không thiếu câu) */}
        <div className="space-y-12">
          {submission.exam?.questions.map((q, idx) => {
            // Trường hợp 1: Nhóm bài đọc
            if (q.type === "passage_group") {
              const essaySubs = q.subQuestions?.filter(
                (sub) => sub.type === "essay" || !sub.correctAnswer,
              );
              if (!essaySubs || essaySubs.length === 0) return null;

              return (
                <div key={idx} className="space-y-6">
                  <div className="bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                    <span className="bg-indigo-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase mb-4 inline-block">
                      Reading Section
                    </span>
                    <div
                      className="prose prose-invert max-w-none text-slate-300 font-serif italic"
                      dangerouslySetInnerHTML={{ __html: q.passage }}
                    />
                  </div>
                  {essaySubs.map((sub, sIdx) => {
                    const ans = getStudentAnswer(sub._id);
                    return (
                      <div
                        key={sub._id}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden ml-8"
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                            Câu {idx + 1}.{sIdx + 1}
                          </span>
                          <span className="font-black text-slate-800">
                            Tối đa: {sub.points}đ
                          </span>
                        </div>
                        <div
                          className="font-bold text-slate-800 mb-4"
                          dangerouslySetInnerHTML={{ __html: sub.content }}
                        />
                        <div className="bg-slate-50 p-4 rounded-xl italic text-slate-600 mb-6 border-l-4 border-slate-200">
                          {ans?.content || "(Học sinh không trả lời)"}
                        </div>
                        <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl">
                          <span className="text-xs font-black text-indigo-900 uppercase">
                            Nhập điểm:
                          </span>
                          <input
                            type="number"
                            step="0.1"
                            max={sub.points}
                            min="0"
                            value={itemScores[sub._id] || ""}
                            onChange={(e) =>
                              setItemScores({
                                ...itemScores,
                                [sub._id]: e.target.value,
                              })
                            }
                            className="w-24 p-2 border-2 border-indigo-300 rounded-lg text-center font-black text-indigo-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Trường hợp 2: Câu tự luận lẻ
            if (q.type === "essay" || !q.correctAnswer) {
              const ans = getStudentAnswer(q._id);
              return (
                <div
                  key={q._id}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                      Câu hỏi {idx + 1}
                    </span>
                    <span className="font-black text-slate-800">
                      Tối đa: {q.points}đ
                    </span>
                  </div>
                  <div
                    className="font-bold text-slate-800 mb-4"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />
                  <div className="bg-slate-50 p-4 rounded-xl italic text-slate-600 mb-6 border-l-4 border-slate-200">
                    {ans?.content || "(Học sinh không trả lời)"}
                  </div>
                  <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl">
                    <span className="text-xs font-black text-indigo-900 uppercase">
                      Nhập điểm:
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      max={q.points}
                      min="0"
                      value={itemScores[q._id] || ""}
                      onChange={(e) =>
                        setItemScores({
                          ...itemScores,
                          [q._id]: e.target.value,
                        })
                      }
                      className="w-24 p-2 border-2 border-indigo-300 rounded-lg text-center font-black text-indigo-600"
                    />
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* LỜI PHÊ */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-dashed border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <HiOutlinePencilSquare size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase">
              Lời phê của giáo viên
            </h3>
          </div>
          <textarea
            className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-indigo-400 transition-all"
            rows="4"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Nhập nhận xét bài làm..."
          />
        </div>

        <button
          onClick={handleUpdateGrade}
          className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:bg-indigo-600 transition-all shadow-2xl uppercase tracking-widest"
        >
          Lưu & Hoàn tất chấm bài
        </button>
      </div>
    </div>
  );
};

export default GradeSubmission;
