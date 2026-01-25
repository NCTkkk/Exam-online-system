import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  HiOutlineChevronLeft,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineLightBulb,
  HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";

const ReviewResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/submissions/detail/${id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setResult(res.data);
      } catch (err) {
        alert("Không thể tải chi tiết bài làm");
      }
    };
    fetchResult();
  }, [id]);

  // Tạo Map để tra cứu câu trả lời nhanh theo questionId
  const answerMap = useMemo(() => {
    if (!result?.answers) return {};
    return result.answers.reduce((acc, curr) => {
      const qId = curr.questionId?._id || curr.questionId;
      acc[qId] = curr;
      return acc;
    }, {});
  }, [result]);

  if (!result)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-indigo-200 rounded-full mb-4"></div>
          <p className="text-slate-500 font-bold">Đang tải kết quả...</p>
        </div>
      </div>
    );

  let cumulativeQuestionNumber = 0;

  // Hàm helper render từng Card câu hỏi để code gọn gàng
  const renderQuestionCard = (q, userAnswer, displayNum, isChild = false) => {
    const isEssay = q.type === "essay";
    const isCorrect = userAnswer?.isCorrect || false;
    const hasAnswered = !!userAnswer?.content;

    return (
      <motion.div
        key={q._id}
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`relative bg-white p-8 rounded-4xl shadow-sm border border-slate-200 ${
          isChild ? "ml-8 -mt-6 border-t-0 rounded-t-none bg-slate-50/50" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg font-black text-[10px] uppercase">
            Câu hỏi {displayNum}
          </span>
          {!isEssay && (
            <div
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-xs ${
                !hasAnswered
                  ? "bg-gray-100 text-gray-400"
                  : isCorrect
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
              }`}
            >
              {!hasAnswered ? (
                "BỎ TRỐNG"
              ) : isCorrect ? (
                <>
                  <HiOutlineCheckCircle size={18} /> CHÍNH XÁC
                </>
              ) : (
                <>
                  <HiOutlineXCircle size={18} /> CHƯA ĐÚNG
                </>
              )}
            </div>
          )}
        </div>

        <div
          className="text-lg font-bold text-slate-800 mb-8 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: q.content }}
        />

        {/* LỰA CHỌN TRẮC NGHIỆM */}
        {q.options && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {q.options.map((opt, i) => {
              const isUserAns = userAnswer?.content === opt;
              const isCorrectAns = q.correctAnswer === opt;

              let cardStyle = "border-slate-100 bg-slate-50 text-slate-400";
              if (isCorrectAns)
                cardStyle =
                  "border-green-500 bg-green-50 text-green-700 ring-4 ring-green-100";
              else if (isUserAns && !isCorrect)
                cardStyle = "border-red-400 bg-red-50 text-red-700";

              return (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border-2 flex justify-between items-center transition-all ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black opacity-40">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="font-bold">{opt}</span>
                  </div>
                  {isCorrectAns && (
                    <span className="text-[9px] font-black bg-green-600 text-white px-2 py-0.5 rounded shadow-sm uppercase">
                      Đáp án đúng
                    </span>
                  )}
                  {isUserAns && !isCorrect && (
                    <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded shadow-sm uppercase">
                      Bạn chọn
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* BÀI LÀM CỦA HỌC SINH (CHO TỰ LUẬN HOẶC HIỂN THỊ TEXT) */}
        {(isEssay || !q.options) && (
          <div className="mb-8 overflow-hidden rounded-2xl border-2 border-slate-100">
            <div className="bg-slate-100 px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Bài làm của bạn
            </div>
            <div className="p-4 text-slate-700 italic font-medium bg-white whitespace-pre-wrap">
              {userAnswer?.content || "(Thí sinh không để lại câu trả lời)"}
            </div>
          </div>
        )}

        {/* GIẢI THÍCH CHI TIẾT */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
          <div className="bg-amber-100 p-2 rounded-xl h-fit">
            <HiOutlineLightBulb size={20} className="text-amber-600" />
          </div>
          <div>
            <h4 className="text-amber-900 font-black text-[11px] uppercase mb-1 tracking-tight">
              Giải thích chi tiết
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {q.explanation || "Chưa có giải thích cho câu hỏi này."}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <style>{`
        mark { background-color: #fef08a; color: #854d0e; padding: 0 2px; border-radius: 2px; }
        u { text-decoration-color: #6366f1; text-underline-offset: 4px; }
        .prose-invert mark { background-color: #ca8a04; color: white; }
      `}</style>

      {/* HEADER KẾT QUẢ */}
      <div className="bg-white border-b sticky top-0 z-50 px-6 py-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <HiOutlineChevronLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
                {result.exam?.title}
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase mt-2">
                Ngày thi: {new Date(result.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center bg-indigo-600 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">
                Tổng điểm
              </p>
              <p className="text-3xl font-black text-white">
                {(result.scoreAuto || 0) + (result.scoreManual || 0)}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-xl border-2 font-black text-xs uppercase ${
                result.status === "graded"
                  ? "bg-green-50 border-green-100 text-green-600"
                  : "bg-orange-50 border-orange-100 text-orange-500"
              }`}
            >
              {result.status === "graded" ? "Đã chấm xong" : "Chờ chấm"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 px-4 space-y-10">
        {/* LỜI PHÊ GIÁO VIÊN */}
        {result.status === "graded" && result.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-4xl border-2 border-indigo-100 shadow-sm flex gap-4"
          >
            <div className="bg-indigo-100 p-3 rounded-2xl h-fit">
              <HiOutlineChatBubbleBottomCenterText
                size={24}
                className="text-indigo-600"
              />
            </div>
            <div>
              <h3 className="text-indigo-900 font-black uppercase text-xs mb-1">
                Lời phê của giáo viên
              </h3>
              <p className="text-slate-600 italic leading-relaxed">
                {result.feedback}
              </p>
            </div>
          </motion.div>
        )}

        {/* DANH SÁCH CÂU HỎI LẤY TỪ EXAM (HIỆN ĐỦ 40 CÂU) */}
        <div className="space-y-12">
          {result.exam?.questions.map((q, idx) => {
            // TRƯỜNG HỢP 1: BÀI ĐỌC (PASSAGE GROUP)
            if (q.type === "passage_group") {
              return (
                <React.Fragment key={idx}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl mt-12"
                  >
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
                  </motion.div>

                  {/* Render các câu hỏi con trong bài đọc */}
                  {q.subQuestions?.map((sub) => {
                    cumulativeQuestionNumber++;
                    const userAnswer = answerMap[sub._id];
                    return renderQuestionCard(
                      sub,
                      userAnswer,
                      cumulativeQuestionNumber,
                      true,
                    );
                  })}
                </React.Fragment>
              );
            }

            // TRƯỜNG HỢP 2: CÂU HỎI LẺ
            cumulativeQuestionNumber++;
            const userAnswer = answerMap[q._id];
            return renderQuestionCard(
              q,
              userAnswer,
              cumulativeQuestionNumber,
              false,
            );
          })}
        </div>

        <button
          onClick={() => navigate("/view-results")}
          className="w-full py-8 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-[0.2em] text-sm transition-all"
        >
          ← Quay lại danh sách bài làm
        </button>
      </div>
    </div>
  );
};

export default ReviewResult;
