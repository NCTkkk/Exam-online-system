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

const GradeExam = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [itemScores, setItemScores] = useState({});
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
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

        // Nếu đã từng chấm trước đó, load lại điểm cũ từ server (nếu backend có hỗ trợ field này)
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
          scoreManualDetails: itemScores, // Gửi chi tiết để lưu trữ
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

  const currentTotal =
    (submission.scoreAuto || 0) +
    Object.values(itemScores).reduce((a, b) => a + Number(b || 0), 0);

  // Helper tìm câu trả lời của học sinh dựa trên questionId
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

      {/* Header chấm điểm - Sticky */}
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
                  Đang chấm bài: {submission.exam?.title}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Trắc nghiệm
              </p>
              <p className="font-bold text-green-600">
                {submission.scoreAuto}đ
              </p>
            </div>
            <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl shadow-xl flex flex-col items-center min-w-30">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                Tổng điểm dự kiến
              </span>
              <span className="text-2xl font-black text-yellow-400">
                {currentTotal.toFixed(2)}đ
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 px-4 space-y-8">
        {/* Tóm tắt tình trạng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Điểm tự luận
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

        {/* Danh sách các câu tự luận cần chấm */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
            Phần câu hỏi tự luận
          </h3>

          {submission.exam?.questions.map((q, idx) => {
            // TRƯỜNG HỢP: NHÓM BÀI ĐỌC
            if (q.type === "passage_group") {
              const essaySubs = q.subQuestions?.filter(
                (sub) => sub.type === "essay" || !sub.correctAnswer,
              );
              if (!essaySubs || essaySubs.length === 0) return null;

              return (
                <div key={idx} className="space-y-6 mt-10">
                  {/* Render Bài đọc */}
                  <div className="bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-700">
                      <span className="bg-indigo-500 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase mb-4 inline-block">
                        Reading Section
                      </span>
                      <h3 className="text-white text-xl font-bold mb-4">
                        {q.content}
                      </h3>
                      <div
                        className="prose prose-invert max-w-none text-slate-300 font-serif text-lg leading-relaxed italic"
                        dangerouslySetInnerHTML={{ __html: q.passage }}
                      />
                    </div>
                  </div>

                  {/* Render các câu hỏi tự luận trong bài đọc */}
                  {essaySubs.map((sub, subIdx) => {
                    const ans = getStudentAnswer(sub._id);
                    return (
                      <div
                        key={sub._id}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden ml-8"
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                            Câu hỏi {idx + 1}.{subIdx + 1}
                          </span>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase">
                              Điểm tối đa
                            </p>
                            <p className="font-black text-slate-800">
                              {sub.points || 0}đ
                            </p>
                          </div>
                        </div>
                        <div
                          className="text-lg font-bold text-slate-800 mb-6 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: sub.content }}
                        />
                        <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-200 mb-8">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                            Bài làm của học sinh:
                          </p>
                          <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap italic">
                            {ans?.content || "(Không có câu trả lời)"}
                          </p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                          <div className="flex-1">
                            <h4 className="text-indigo-900 font-black text-xs uppercase mb-1">
                              Chấm điểm câu này
                            </h4>
                            <p className="text-indigo-400 text-[10px]">
                              Thang điểm: 0 đến {sub.points}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              step="0.1"
                              max={sub.points}
                              min="0"
                              value={itemScores[sub._id] || ""}
                              className="w-32 p-4 border-2 border-indigo-200 rounded-xl text-center font-black text-2xl text-indigo-700 outline-none focus:border-indigo-500 transition-all"
                              onChange={(e) =>
                                setItemScores({
                                  ...itemScores,
                                  [sub._id]: e.target.value,
                                })
                              }
                            />
                            <span className="font-black text-indigo-300 text-xl">
                              / {sub.points}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // TRƯỜNG HỢP: CÂU TỰ LUẬN LẺ
            if (q.type === "essay" || !q.correctAnswer) {
              const ans = getStudentAnswer(q._id);
              return (
                <div
                  key={q._id}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                      Câu tự luận {idx + 1}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Điểm tối đa
                      </p>
                      <p className="font-black text-slate-800">
                        {q.points || 0}đ
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-lg font-bold text-slate-800 mb-6 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />
                  <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-200 mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                      Bài làm của học sinh:
                    </p>
                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap italic">
                      {ans?.content || "(Học sinh không để lại câu trả lời)"}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <div className="flex-1">
                      <h4 className="text-indigo-900 font-black text-xs uppercase mb-1">
                        Chấm điểm câu này
                      </h4>
                      <p className="text-indigo-400 text-[10px]">
                        Nhập số điểm dựa trên thang điểm tối đa.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        max={q.points}
                        min="0"
                        value={itemScores[q._id] || ""}
                        className="w-32 p-4 border-2 border-indigo-200 rounded-xl text-center font-black text-2xl text-indigo-700 outline-none focus:border-indigo-500 transition-all"
                        placeholder="0.0"
                        onChange={(e) =>
                          setItemScores({
                            ...itemScores,
                            [q._id]: e.target.value,
                          })
                        }
                      />
                      <span className="font-black text-indigo-300 text-xl">
                        / {q.points}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Ô nhập lời phê */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-dashed border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <HiOutlinePencilSquare size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Lời phê của giáo viên
            </h3>
          </div>
          <textarea
            className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium text-slate-700"
            rows="4"
            placeholder="Viết nhận xét về bài làm..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>
        </div>

        {/* Nút lưu kết quả */}
        <div className="pt-6">
          <button
            onClick={handleUpdateGrade}
            className="group relative w-full flex items-center justify-center bg-slate-900 text-white text-xl font-black py-8 rounded-[2.5rem] hover:bg-indigo-600 transition-all shadow-2xl active:scale-[0.98] overflow-hidden uppercase tracking-widest"
          >
            <span className="relative z-10 flex items-center gap-3">
              Hoàn tất chấm bài & Lưu kết quả
            </span>
            <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeExam;
